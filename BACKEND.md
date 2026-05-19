# Hybrid Lab — Описание серверной части (Backend)

Документ описывает **актуальную** реализацию в каталоге `metrics-backend/` — REST API на **FastAPI** для приёма и хранения телеметрии симулятора в **Excel**.

---

## 1. Назначение

Сервер решает задачу **журналирования метрик** гибридного автомобиля в формате, удобном для анализа на занятиях и отчётов:

- принимает структурированные данные с клиента (скорость, обороты, температуры, SOC, напряжение, момент мотора);
- валидирует диапазоны полей;
- дописывает строки в `logs/metrics_log.xlsx`;
- отдаёт файл для скачивания и служебную статистику;
- предоставляет health-check для Docker и мониторинга.

Бэкенд **не** считает физику гибрида — это зона frontend (`domain/physics`). Сервер отвечает за **хранение, валидацию и выдачу** данных.

---

## 2. Технологический стек

| Компонент | Назначение |
|-----------|------------|
| **Python 3.11** | Runtime в Docker |
| **FastAPI 0.104** | REST API, автодокументация OpenAPI |
| **Uvicorn** | ASGI-сервер |
| **Pydantic v2** | Валидация входных моделей |
| **openpyxl 3.1** | Создание и запись `.xlsx` |
| **Docker** | Изолированный деплой, volume для логов |

Зависимости: `metrics-backend/requirements.txt`.

---

## 3. Структура проекта

```
metrics-backend/
├── main.py              # Приложение FastAPI, все эндпоинты
├── requirements.txt
├── Dockerfile
├── docker-compose.yml   # Локальный запуск только бэка
└── logs/                # metrics_log.xlsx (volume в Docker)
```

Основная логика сосредоточена в **одном модуле** `main.py` (~235 строк) — прозрачно для ревью на защите.

---

## 4. Модель данных

### 4.1. Входная схема `MetricsData` (Pydantic)

| Поле | Тип | Диапазон | Описание |
|------|-----|----------|----------|
| `pid_0d` | float | 0–300 | Скорость автомобиля, км/ч (OBD PID 0D) |
| `pid_0c` | float | 0–8000 | Обороты ДВС, об/мин (PID 0C) |
| `pid_5c` | float | −40…150 | Температура масла, °C (PID 5C) |
| `hv_soc` | float | 0–100 | SOC HV-батареи, % |
| `hv_volt` | float | 0–400 | Напряжение HV-шины, В |
| `electric_motor_torque` | float | −500…500 | Момент электромотора, Н·м |

Некорректные значения отклоняются **до** записи в файл — ответ `422 Unprocessable Entity` с описанием поля.

### 4.2. Файл Excel

Путь: `./logs/metrics_log.xlsx`  
Лист: `Metrics Log`

Колонки:

1. Timestamp  
2. Скорость (км/ч) [PID_0D]  
3. Обороты ДВС (об/мин) [PID_0C]  
4. Температура масла (°C) [PID_5C]  
5. SOC HV батареи (%) [HV_SOC]  
6. Напряжение HV шины (V) [HV_VOLT]  
7. Момент эл. мотора (Nm)

При первом запуске создаётся файл с **оформленной шапкой** (цвет, границы, выравнивание). Каждая новая запись — строка с временной меткой и форматированием ячеек.

---

## 5. REST API

Базовый URL в production (через Nginx):

`https://hybrid-lab.duckdns.org/api`

| Метод | Путь | Назначение |
|-------|------|------------|
| `GET` | `/` | Информация о сервисе и списке эндпоинтов |
| `POST` | `/metrics` | Принять метрики, записать в Excel → `201 Created` |
| `GET` | `/status` | Статус сервиса, путь к файлу логов |
| `GET` | `/logs` | Количество записей, метаданные файла |
| `GET` | `/health` | Liveness для Docker (`{"status": "healthy"}`) |
| `GET` | `/download` | Скачать `metrics_log.xlsx` |

Интерактивная документация: `http://localhost:8000/docs` (локально) или `https://hybrid-lab.duckdns.org/api/docs` (если прокси передаёт `/docs`).

### Пример: отправка метрик

```http
POST /api/metrics
Content-Type: application/json

{
  "pid_0d": 60.0,
  "pid_0c": 2500.0,
  "pid_5c": 85.0,
  "hv_soc": 72.5,
  "hv_volt": 320.0,
  "electric_motor_torque": 120.0
}
```

Ответ:

```json
{
  "status": "success",
  "message": "Метрики успешно зарегистрированы",
  "timestamp": "2026-05-18T12:00:00.000000",
  "data_received": { ... }
}
```

### Пример: скачивание журнала

```http
GET /api/download
```

Ответ: файл `metrics_log.xlsx`, MIME  
`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

Фронтенд (`StatisticsPanel`) вызывает этот URL через `API_BASE_URL`.

---

## 6. Внутренняя логика

### 6.1. Жизненный цикл

```
Старт приложения (@app.on_event("startup"))
    → init_excel_file() — создать xlsx с заголовками, если нет
    → готовность к приёму метрик

POST /metrics
    → Pydantic-валидация MetricsData
    → log_to_excel() — append строки, save
    → JSON-ответ об успехе

GET /download
    → проверка существования файла
    → FileResponse(metrics_log.xlsx)
```

### 6.2. Обработка ошибок

- **404** — файл Excel ещё не создан при `/download`;
- **500** — ошибки записи/чтения диска, логируются через `logging`;
- **422** — невалидное тело запроса (Pydantic).

### 6.3. CORS

```python
CORSMiddleware(
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Для production с одним доменом и reverse proxy CORS часто не критичен, но включён для гибкости при разработке.

### 6.4. Логирование

Модуль `logging` (уровень INFO): инициализация файла, каждая записанная строка, ошибки I/O.

---

## 7. Контейнеризация и деплой

### Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
VOLUME ["/app/logs"]
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose (корень репозитория)

```yaml
backend:
  build: ./metrics-backend
  ports:
    - "8000:8000"
  restart: always
```

Рекомендуется примонтировать volume `./logs` для сохранения Excel между перезапусками контейнера.

### Production (Yandex Cloud + Nginx)

По `deploy.md`:

1. VM в Yandex Cloud, Docker + Docker Compose.  
2. Nginx как reverse proxy:  
   - `/` → frontend:3000  
   - `/api/` → backend:8000 (с strip prefix или rewrite на корень FastAPI).  
3. **Certbot / Let's Encrypt** — HTTPS на домене `hybrid-lab.duckdns.org`.  
4. Frontend обращается к `https://hybrid-lab.duckdns.org/api` — единый origin, без mixed content.

---

## 8. Связь с frontend

```
┌─────────────────┐     HTTPS      ┌──────────────┐     HTTP      ┌─────────────────┐
│  React (Vite)   │ ──────────────►│    Nginx     │ ────────────► │  FastAPI :8000  │
│  hybrid-lab     │  /api/download │  SSL termination          │  metrics-backend │
└─────────────────┘  /api/metrics └──────────────┘               └─────────────────┘
                                              │
                                              ▼
                                    logs/metrics_log.xlsx
```

| Действие | Кто инициирует | Эндпоинт |
|----------|----------------|----------|
| Скачать журнал | Frontend, кнопка в StatisticsPanel | `GET /download` |
| Отправить метрики | Готовность API (интеграция с симулятором — расширение) | `POST /metrics` |

Поля API согласованы с телеметрией симулятора (скорость, RPM, SOC, напряжение, момент) — удобно для отчётов и сопоставления с OBD-II терминологией.

---

## 9. Сценарий демонстрации на защите (3–5 мин)

1. Открыть **Swagger** `/docs` — показать схему `MetricsData` и валидацию.  
2. Выполнить **POST /metrics** с тестовым JSON — показать `201` и рост счётчика в **GET /logs**.  
3. Открыть **GET /download** или скачать файл с фронта — показать Excel с оформленной таблицей.  
4. Показать **GET /health** — объяснить использование в Docker healthcheck.  
5. Кратко: **Pydantic** = контракт API, **openpyxl** = переносимый формат для преподавателя, **FastAPI** = скорость разработки и автодокументация.  
6. Схема деплоя: Docker + Nginx + HTTPS.

---

## 10. Итоги 

| Критерий | Реализация |
|----------|-------------|
| API | REST, 6 эндпоинтов, OpenAPI |
| Валидация | Pydantic, диапазоны как у OBD/HV |
| Хранение | Excel с форматированием, timestamp |
| DevOps | Docker, health check, volume logs |
| Интеграция | HTTPS `/api`, скачивание с фронта |

**Metrics Backend** — специализированный микросервис логирования учебной симуляции: строгий контракт данных, понятный формат отчёта и готовность к production-деплою за reverse proxy.
