# Hybrid Lab

Интерактивная учебная платформа по гибридным электромобилям: симулятор привода с приборами, калькулятор TCO и сервер журналирования метрик.

**Production:** [https://hybrid-lab.duckdns.org](https://hybrid-lab.duckdns.org)

---

## Состав репозитория

| Каталог | Назначение |
|---------|------------|
| [`hybrid-lab/`](hybrid-lab/) | Frontend — React, TypeScript, Vite |
| [`metrics-backend/`](metrics-backend/) | Backend — FastAPI, Excel-логи |
| [`docker-compose.yml`](docker-compose.yml) | Запуск frontend + backend |

---

## Быстрый старт

```bash
docker compose up --build
```

| Сервис | URL |
|--------|-----|
| Frontend | https://hybrid-lab.duckdns.org |
| Backend API | https://hybrid-lab.duckdns.org/api |
| Swagger | https://hybrid-lab.duckdns.org/api/docs |

Локальная разработка frontend:

```bash
cd hybrid-lab
npm install
npm run dev
```

---

## Документация

Подробности — в отдельных файлах:

| Документ | Содержание |
|----------|------------|
| [**FRONTEND.md**](FRONTEND.md) | Архитектура UI, симулятор, осциллограф, щуп, TCO, адаптеры |
| [**BACKEND.md**](BACKEND.md) | REST API, Excel-журнал, модель метрик, эндпоинты |
| [**deploy.md**](deploy.md) | Деплой: Docker, Nginx, HTTPS, Yandex Cloud |

---

## Стек

- **Frontend:** React 19, TypeScript, Vite, Zustand, Tailwind CSS, Canvas/SVG  
- **Backend:** Python 3.11, FastAPI, Pydantic, openpyxl  
- **Инфраструктура:** Docker, Nginx, Let's Encrypt
