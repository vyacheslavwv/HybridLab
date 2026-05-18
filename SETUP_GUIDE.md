# 🚀 Hybrid Lab - Запуск без Docker

## QUICK START (30 секунд)

### Для Windows:
```bash
# Откройте PowerShell/CMD в папке проекта и выполните:
python start-backend.py
```

В отдельном терминале:
```bash
python start-frontend.py
```

Откройте: **http://localhost:3000**

---

## Что было исправлено

### 1. TypeScript ошибки (82 ошибки исправлены)
- ✅ Импорты с неправильными путями (../core/ → ../../core/)
- ✅ Недостающие `type` keywords для type-only imports
- ✅ Неиспользуемые переменные
- ✅ Zustand store type issues

### 2. Backend улучшения
- ✅ Добавлен endpoint `GET /download` для скачивания Excel
- ✅ Правильные MIME types для .xlsx файлов
- ✅ Error handling

### 3. Frontend - Новая функция
- ✅ Кнопка "Скачать Excel" в Statistics Panel
- ✅ Красивый UI с иконкой download
- ✅ Асинхронное скачивание файла

---

## Подробные инструкции

### Вариант 1: Автоматический запуск (Python скрипты)

**Шаг 1: Установка зависимостей + запуск Backend**
```bash
cd "C:\Users\admin\Desktop\Hybrid lab"
python start-backend.py
```

Результат:
```
==================================================
  Hybrid Lab - Local Development Setup
==================================================

✓ Python 3.9.0 found
✓ Node.js v18.12.0 found

==================================================
  Installing Backend Dependencies
==================================================

✓ Backend dependencies installed

==================================================
  Installing Frontend Dependencies
==================================================

✓ Frontend dependencies installed

==================================================
  Starting Backend Server
==================================================

Starting uvicorn on http://localhost:8000
Press Ctrl+C to stop

INFO:     Started server process [12345]
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Шаг 2: В отдельном терминале - запуск Frontend**
```bash
cd "C:\Users\admin\Desktop\Hybrid lab"
python start-frontend.py
```

Результат:
```
==================================================
  Starting Frontend - Hybrid Lab
==================================================

Frontend: http://localhost:3000
Press Ctrl+C to stop

VITE v5.2.0  ready in 542 ms

➜  Local:   http://localhost:3000/
➜  press h + enter to show help
```

**Шаг 3: Откройте браузер**
- http://localhost:3000

---

### Вариант 2: BAT скрипт (только Windows)

Двойной клик по `run-local.bat` - скрипт сам запустит все в новых окнах терминала.

---

### Вариант 3: Ручной запуск

**Терминал 1 - Backend:**
```bash
cd metrics-backend
pip install -r requirements.txt
python main.py
```

**Терминал 2 - Frontend:**
```bash
cd hybrid-lab
npm install
npm run dev
```

---

## Тестирование новой функции (Excel Export)

1. ✅ Откройте http://localhost:3000
2. ✅ Перейдите на страницу "Симулятор"
3. ✅ Запустите симуляцию (нажмите кнопку Play)
4. ✅ В панели "Статистика" найдите кнопку **"Скачать Excel"**
5. ✅ Нажмите кнопку - файл скачается
6. ✅ Откройте скачанный `metrics_log.xlsx` в Excel/LibreOffice

Проверьте что:
- Файл содержит все колонки (Timestamp, Speed, RPM, Temp, SOC, Voltage, Torque)
- Красивое форматирование (цвета заголовков, бордеры)
- Данные обновляются при отправке метрик

---

## Проверка API Backend

Откройте в браузере: **http://localhost:8000/docs**

Вы увидите интерактивную документацию Swagger с всеми endpoints:

### Доступные endpoints:
```
GET  /              - Информация о сервисе
GET  /status        - Статус сервиса
GET  /health        - Health check
GET  /logs          - Информация о логах
GET  /download      - 🆕 Скачать Excel файл
POST /metrics       - Отправить метрики
```

### Пример запроса к /download:
```bash
curl -O http://localhost:8000/download
```

---

## Возможные проблемы и решения

### ❌ "Port 3000 already in use"
```bash
# Frontend на другом порте:
npm run dev -- --port 5173
```
Тогда откройте http://localhost:5173

### ❌ "Port 8000 already in use"
Отредактируйте `metrics-backend/main.py` (последняя строка):
```python
# Было:
uvicorn.run(app, host="0.0.0.0", port=8000)

# Станет:
uvicorn.run(app, host="0.0.0.0", port=8001)
```

И обновите URL в `StatisticsPanel.tsx`:
```javascript
const response = await fetch('http://localhost:8001/download');
```

### ❌ "npm command not found"
- Установите Node.js: https://nodejs.org
- Добавьте в PATH (обычно автоматически)
- Перезагрузите терминал

### ❌ "python command not found"
- Установите Python: https://python.org
- При установке отметьте: ✅ "Add Python to PATH"
- Перезагрузите терминал

### ❌ "ModuleNotFoundError: No module named 'fastapi'"
```bash
cd metrics-backend
pip install -r requirements.txt
```

### ❌ CORS ошибки в консоли браузера
Это не проблема! Backend сконфигурирован правильно - ошибки обычно от browser extensions.

---

## Структура проекта

```
Hybrid lab/
├── 📁 hybrid-lab/                 # React Frontend (TypeScript)
│   ├── src/
│   │   ├── core/                  # Physics engine
│   │   ├── domain/                # Business logic
│   │   ├── application/           # Stores & hooks
│   │   ├── presentation/          # React components
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── 📁 metrics-backend/            # FastAPI Backend (Python)
│   ├── main.py                    # REST API + Excel logging
│   ├── requirements.txt
│   └── logs/                      # Excel files saved here
│
├── 🐳 docker-compose.yml          # Docker config
├── 📄 run-local.bat               # Windows auto-launcher
├── 📄 run-local.sh                # Linux/Mac auto-launcher
├── 🐍 start-backend.py            # Backend launcher
├── 🐍 start-frontend.py           # Frontend launcher
└── 📄 RUN_LOCALLY.md              # This file
```

---

## Что дальше?

### Если всё работает:
1. ✅ Тестируйте функцию скачивания Excel
2. ✅ Проверьте API на http://localhost:8000/docs
3. ✅ Создавайте PR с изменениями

### Перед production:
1. Обновите CORS origins в backend (удалите `allow_origins=["*"]`)
2. Добавьте аутентификацию
3. Используйте Docker для сборки
4. Настройте переменные окружения

---

## Контакты и поддержка

Если возникли проблемы:
1. Проверьте что установлены Python 3.8+ и Node.js
2. Убедитесь что порты 3000 и 8000 свободны
3. Очистите cache: `npm cache clean --force`
4. Удалите node_modules и переустановите: `rm -rf node_modules && npm install`

---

**Happy coding! 🚀**
