# Hybrid Lab — учебная платформа (демо)

Минималистичная LMS-платформа в стиле Electude для проекта по учебному макету гибридного транспортного средства.

## 🆕 NEW: Further Enhancements (v2.1)

### Visual & Structural Improvements

- **Optimized Oscilloscope**: Reduced by 50% in size (300x220 → 150x110), styled as a compact widget panel with header
- **Adaptive Scaling**: All simulator components now scaled to 1.2x (120%) for better visibility while maintaining responsive design
- **Reorganized Dashboard**: Single-column layout with "Ваш прогресс" panel positioned directly below module cards
- **Detailed ICE Module**: New interactive 2D SVG schematic of internal combustion engine featuring:
  - Piston animation synchronized with RPM and throttle control
  - Crankshaft visualization with real-time rotation
  - Motor-Generator (MG1/MG2) system integration
  - Planetary gear transmission schematic
  - Dynamic energy flow visualization with color-coded paths
  - Real-time RPM and throttle display

### UX/UI Enhancements

- Unified panel design throughout simulator (dark backgrounds, consistent borders)
- Improved throttle control with visual feedback
- Enhanced Start/Stop button with hover effects
- Color-standardized signals (#10ff00 bright green for all readings)
- Better visual hierarchy in information panels

---

## 🆕 NEW: Interactive 2D Simulator (v2.0)

This version includes a **brand new 2D simulation environment** with:

- ⚡ **Real-time Physics Simulation**: Engine RPM, Motor RPM, Battery SOC
- 📊 **Professional Oscilloscope**: Canvas-based waveform display with adjustable timebase & voltage scales
- 🔌 **Digital Multimeter**: DC voltage measurement with realistic display
- 🎯 **Draggable Probe System**: Intuitive drag-and-drop interface to connect to test points
- 🔄 **Energy Flow Visualization**: Animated particles showing power distribution
- 🎨 **Engineering Design**: Professional gray-blue color scheme (Electude-inspired)

**Quick Start**: Open `index.html` → Select a module → Enter 2D Simulator

---

## Как запустить

- Откройте файл `index.html` в браузере (двойной клик в проводнике или через контекстное меню «Открыть с помощью…»).
- Приложение использует React и React Router через CDN, поэтому установка зависимостей не обязательна.

## Основные экраны

- **LMS Dashboard**: список модулей — `Устройство ДВС`, `Электрическая схема`, `Симулятор режимов`. Статус модуля: «Пройдено» или «Начать» (статус сохраняется в `localStorage`).
- **Страница симулятора (2D Interactive)**:
  - **Для модуля "Устройство ДВС"**: SVG схема ДВС с анимированными поршнями
  - **Для модуля "Электрическая схема"**: SVG Circuit Schematic с интерактивными компонентами
  - Canvas Oscilloscope для просмотра сигналов в реальном времени
  - Digital Multimeter для измерения напряжения
  - Draggable Probe для подключения к измерительным точкам
  - Control Panel для управления симуляцией
  - Energy Flow visualization с анимированными частицами

## 🎮 Как использовать симулятор

1. **Запустите симуляцию**: Нажмите `START` в Control Panel
2. **Для модуля ДВС**: 
   - Регулируйте ползунок Throttle для управления скоростью поршней
   - Наблюдайте синхронную анимацию всех трех поршней
   - Смотрите вращение коленвала в реальном времени
3. **Для электрической схемы**:
   - Подключите щуп к контрольным точкам на схеме
   - Выбирайте между Oscilloscope и Multimeter для анализа
4. **Анализируйте сигналы**: 
   - На Oscilloscope: используйте Timebase и Volts/Div для масштабирования
   - На Multimeter: читайте DC напряжение

## Роутинг и параметры

- Главная страница: `/`
- Страница симулятора: `/simulator?module=<id>&qr=<part>`
  - `module` — `ice`, `electric`, `modes`
  - `qr` — эмуляция сканирования QR-кода: `battery`, `motor`, `engine`

При передаче параметра `qr` соответствующий узел на схеме будет подсвечиваться.

## 📁 Документация

- **README_2D_SIMULATOR.md**: Подробное описание нового 2D симулятора
- **SIMULATOR_GUIDE.md**: Архитектура и детальное объяснение каждого компонента
- **CUSTOMIZATION_GUIDE.md**: Руководство по модификации и расширению симулятора

## 🎓 Образовательные Цели

Студенты могут научиться:
- ✅ Снимать показания сигналов с осциллографа
- ✅ Измерять напряжение мультиметром  
- ✅ Понимать распределение энергии в гибридных системах
- ✅ Анализировать волновые формы
- ✅ Работать с профессиональными инженерными инструментами
- ✅ Понимать механику ДВС и синхронизацию поршней
- ✅ Изучать взаимодействие между ДВС, мотор-генератором и батареей

## 🛠 Технология

- **React 18** (via CDN)
- **Canvas API** для осциллографа (60fps rendering)
- **SVG** для интерактивной схемы и ДВС
- **CSS Grid/Flexbox** для макета
- **CSS-in-JS** (inline styles)
- **Vanilla JavaScript** physics engine

## 💾 Статус сохранения

- Каждый пройденный модуль сохраняется в `localStorage`
- История симуляции не сохраняется (новые сессии начинаются с начального состояния)