# Запуск Hybrid Lab локально без Docker

## Быстрый старт (Рекомендуется)

### Windows
1. Убедитесь, что установлены:
   - Python 3.8+ (https://python.org)
   - Node.js (https://nodejs.org)

2. Двойной клик по файлу: `run-local.bat`

3. Откройте в браузере: **http://localhost:3000**

### macOS / Linux
1. Убедитесь, что установлены:
   - Python 3.8+
   - Node.js

2. Запустите в терминале:
```bash
chmod +x run-local.sh
./run-local.sh
```

3. Откройте в браузере: **http://localhost:3000**

---

## Ручной запуск (если скрипты не работают)

### 1. Установка зависимостей Backend

```bash
cd metrics-backend
pip install -r requirements.txt
```

### 2. Запуск Backend (на порте 8000)

```bash
cd metrics-backend
python main.py
```

Backend должен вывести:
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 3. В новом терминале - установка Frontend

```bash
cd hybrid-lab
npm install
```

### 4. Запуск Frontend (на порте 3000)

```bash
cd hybrid-lab
npm run dev
```

Frontend должен вывести:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:3000/
```

---

## Проверка

### Backend API
- http://localhost:8000/ - информация о сервисе
- http://localhost:8000/docs - документация Swagger
- http://localhost:8000/health - проверка здоровья

### Frontend
- http://localhost:3000 - основное приложение

---

## Новая функция: Скачивание Excel

1. В симуляторе нажмите **"Скачать Excel"** в панели статистики
2. Файл `metrics_log.xlsx` будет скачан в папку Download
3. Backend сохраняет все метрики в `metrics-backend/logs/metrics_log.xlsx`

---

## Потенциальные проблемы

### Порты заняты
Если порты 3000 или 8000 уже использованы:

**Frontend (изменить с 3000 на 5173):**
```bash
npm run dev -- --port 5173
```

**Backend (изменить с 8000 на 8001):**
Отредактировать последнюю строку `metrics-backend/main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)
```
И обновить URL в `StatisticsPanel.tsx`:
```javascript
const response = await fetch('http://localhost:8001/download');
```

### CORS ошибки
Если видите ошибки CORS, это нормально - backend уже сконфигурирован:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Зависимости не устанавливаются
Убедитесь, что Python и Node.js в PATH:
```bash
python --version
node --version
```

---

## Docker (если нужен)

Для сборки Docker образов:
```bash
docker-compose up --build
```

Тогда сервисы будут доступны на тех же портах.

---

## Структура папок
```
Hybrid lab/
├── hybrid-lab/          # Frontend React + TypeScript
│   ├── src/
│   ├── package.json
│   └── ...
├── metrics-backend/     # Backend FastAPI + Python
│   ├── main.py
│   ├── requirements.txt
│   └── logs/           # Excel файлы сохраняются здесь
├── run-local.bat       # Скрипт для Windows
├── run-local.sh        # Скрипт для macOS/Linux
└── docker-compose.yml  # Docker конфиг
```
