# Архитектура Hybrid Lab

## Концепция

Проект построен по принципам **Clean Architecture**: бизнес-логика полностью изолирована от UI и фреймворка.  
Зависимости направлены строго внутрь — `presentation` зависит от `application`, `application` — от `domain`, `domain` не зависит ни от чего.

```
┌─────────────────────────────────────────────┐
│  presentation/   React-компоненты, страницы │
├─────────────────────────────────────────────┤
│  application/    Zustand-сторы, хуки        │
├─────────────────────────────────────────────┤
│  domain/         Физика, стратегии, типы    │  ← не знает о React
├─────────────────────────────────────────────┤
│  infrastructure/ Конфиги, реестры           │
└─────────────────────────────────────────────┘
```

---

## Слои

### `domain/` — Чистая логика

Не импортирует React, Zustand или что-либо внешнее.

```
domain/
├── physics/
│   ├── SimulationEngine.ts   # Основной движок физической модели
│   ├── SignalRegistry.ts     # Реестр сигналов для приборов
│   └── constants.ts          # Физические константы
├── strategies/               # Strategy Pattern для режимов гибрида
│   ├── BaseHybridMode.ts     # Абстрактный базовый класс
│   ├── EVMode.ts
│   ├── ParallelHybridMode.ts
│   ├── SeriesHybridMode.ts
│   ├── ChargingMode.ts
│   └── HybridModeFactory.ts  # Фабрика: создаёт стратегию по ключу
└── types/
    ├── HybridMode.ts          # union-тип: 'EV' | 'Hybrid' | 'Series' | 'Charging'
    └── Simulation.ts          # SimulationState и связанные интерфейсы
```

**SimulationEngine** принимает текущее состояние и `deltaTime`, возвращает новое состояние. Не хранит состояние сам.

```typescript
// Вызов из game loop:
const next = SimulationEngine.step(currentState, deltaTime);
```

**SignalRegistry** — словарь сигналов для точек подключения щупа:

```typescript
SIGNAL_REGISTRY['battery'].calculate(t, throttle) // → число в вольтах
SIGNAL_REGISTRY['motor'].color                     // → '#34d399'
```

---

### `application/` — Состояние и хуки

Содержит Zustand-сторы и React-хуки. Знает о `domain/`, не знает о `presentation/`.

```
application/
├── stores/
│   ├── simulationStore.ts   # Главный стор
│   ├── progressStore.ts     # Прогресс прохождения модулей
│   └── uiStore.ts
└── hooks/
    ├── useSimulation.ts
    ├── useEnergyFlow.ts
    ├── useHybridMode.ts
    └── useProgress.ts
```

**simulationStore** содержит:

```typescript
interface SimulationState {
  isRunning: boolean;
  mode: HybridMode;           // 'EV' | 'Hybrid' | 'Series' | 'Charging'
  throttle: number;           // 0–1
  batterySoc: number;         // 0–100 %
  motorRpm: number;
  engineRpm: number;
  connectedTestPoint: string | null;  // точка подключения щупа
  waveformData: number[];     // буфер осциллографа, макс. 512 сэмплов
  t: number;                  // время симуляции в секундах
}
```

Game loop живёт в `App.tsx` через `useEffect` + `requestAnimationFrame`:

```typescript
useEffect(() => {
  if (!simulationState.isRunning) return;
  let id: number, last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1); // cap 100ms
    last = now;
    useSimulationStore.getState().step(dt);         // вызов движка
    id = requestAnimationFrame(loop);
  };
  id = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(id);
}, [simulationState.isRunning]);
```

---

### `presentation/` — UI

Знает о `application/`, не знает о деталях `domain/` (только через сторы).

```
presentation/
├── components/
│   ├── CircuitSchematic.tsx    # SVG-схема HEV с анимированными потоками
│   ├── ControlPanel.tsx        # Слайдер дросселя, кнопки, выбор режима
│   ├── DraggableProbe.tsx      # Перетаскиваемый щуп: привязка к TEST_POINT_COORDS
│   ├── Oscilloscope.tsx        # Canvas с HiDPI-скейлингом, буфер 512 точек
│   └── StatisticsPanel.tsx
├── instruments/
│   ├── MultimeterDisplay.tsx   # Читает из SIGNAL_REGISTRY по connectedTestPoint
│   └── canvas/
│       └── tcoChart.ts         # Чистый Canvas-рендерер (без React)
└── pages/
    ├── TCOCalculator.tsx        # ResizeObserver + Canvas, contentRect.width
    ├── TopologyBuilder.tsx      # Drag-and-drop, валидация порядка компонентов
    ├── DiagnosticsPage.tsx      # OBD-II state machine + live data polling
    ├── GlossaryPage.tsx         # Фильтрация по 15 терминам
    └── LiteraturePage.tsx       # Ссылки на открытые источники
```

#### Oscilloscope

- Canvas масштабируется через `window.devicePixelRatio` (чёткость на Retina)
- Буфер `waveformData` ограничен 512 сэмплами в сторе
- Размер перевычисляется через `ResizeObserver` при изменении контейнера

#### DraggableProbe

- Координаты точек подключения (`TEST_POINT_COORDS`) задаются в `CircuitSchematic.tsx`
- При наведении на точку — snap и подключение через `store.connectTestPoint(id)`
- Отключение — `store.disconnectTestPoint()`

#### TCOCalculator — фикс бесконечного расширения Canvas

Используется `ResizeObserver.contentRect.width` (контентная ширина без padding) вместо `element.clientWidth`, что предотвращает петлю расширения:

```typescript
const obs = new ResizeObserver((entries) => {
  const w = Math.floor(entries[0]?.contentRect.width ?? 0);
  if (w > 0) redrawWithWidth(w);
});
```

#### DiagnosticsPage — OBD-II state machine

```
idle ──connect()──► connecting ──1.5s AT-команды──► connected
                                                         │
                                               setInterval(400ms)
                                               синхронизация с simulationStore
```

---

### `infrastructure/` — Конфигурация

```
infrastructure/
└── config/
    ├── components.ts   # Реестр компонентов TopologyBuilder
    └── modules.ts      # Конфигурация учебных модулей (id, title, time)
```

---

## Поток данных

```
Пользователь (слайдер дросселя)
        │
        ▼
ControlPanel.tsx
  store.setThrottle(0.7)
        │
        ▼
simulationStore (Zustand)
  throttle = 0.7
        │
        ▼
App.tsx — requestAnimationFrame loop
  store.step(deltaTime)
        │
        ▼
SimulationEngine.step(state, dt)
  HybridModeFactory.create(mode).calculateEnergyFlow(state, dt)
        │
        ▼
Новый SimulationState записывается в стор
        │
        ├──► Oscilloscope.tsx    (waveformData)
        ├──► MultimeterDisplay   (connectedTestPoint → SIGNAL_REGISTRY)
        ├──► ControlPanel        (throttle, isRunning, mode)
        └──► DiagnosticsPage     (batterySoc, engineRpm, motorRpm, throttle)
```

---

## Strategy Pattern — режимы гибрида

Все режимы наследуют `BaseHybridMode` и переопределяют `calculateEnergyFlow`:

```typescript
abstract class BaseHybridMode {
  abstract readonly key: string;
  abstract calculateEnergyFlow(state: SimulationState, dt: number): SimulationState;
}
```

| Класс | Ключ | Поведение |
|-------|------|-----------|
| `EVMode` | `'EV'` | Только электромотор, ДВС не работает, батарея разряжается |
| `ParallelHybridMode` | `'Hybrid'` | ДВС + мотор вместе, рекуперация при сбросе газа |
| `SeriesHybridMode` | `'Series'` | ДВС → генератор → батарея → мотор, механической связи нет |
| `ChargingMode` | `'Charging'` | ДВС заряжает батарею без движения |

`HybridModeFactory.create(key)` возвращает нужный экземпляр.

---

## Дизайн-система

Все визуальные токены в `src/index.css` как CSS-переменные:

```css
:root {
  --bg, --s1, --s2          /* фон и поверхности */
  --b1, --b2                /* границы */
  --text, --muted, --subtle /* типографика */

  /* акценты */
  --indigo  + --i-dim, --i-glow
  --cyan    + --c-dim
  --emerald + --e-dim
  --amber   + --a-dim
  --violet  + --v-dim
  --rose    + --r-dim
}
```

Переиспользуемые классы:

| Класс | Назначение |
|-------|-----------|
| `.glass` | Glassmorphism с hover-эффектом |
| `.glass-static` | Glassmorphism без hover |
| `.jb` | JetBrains Mono, tabular-nums |
| `.tag`, `.tag-i/e/a/v/r` | Цветные бейджи |
| `.in-up` | Анимация появления (translateY + opacity) |
| `.pulse-dot` | Пульсирующая точка статуса |

---

## Роутинг

Роутинг реализован через `useState<Page>` в `App.tsx` (без React Router):

```typescript
type Page = 'dashboard' | 'simulator' | 'tco' | 'topology'
          | 'literature' | 'diagnostics' | 'glossary';
```

Переход: `go(page, moduleId?)` — устанавливает страницу и опциональный id модуля.  
Назад: `back()` — останавливает симуляцию и возвращает на dashboard.

---

## Добавление нового режима

1. Создать `src/domain/strategies/MyMode.ts`:

```typescript
import { BaseHybridMode } from './BaseHybridMode';
import type { SimulationState } from '../types/Simulation';

export class MyMode extends BaseHybridMode {
  readonly key = 'MyMode';

  calculateEnergyFlow(state: SimulationState, dt: number): SimulationState {
    return {
      ...state,
      motorRpm: state.throttle * 3000,
      batterySoc: Math.max(0, state.batterySoc - state.throttle * dt * 2),
    };
  }
}
```

2. Зарегистрировать в `HybridModeFactory.ts`
3. Добавить ключ `'MyMode'` в union в `domain/types/HybridMode.ts`
4. Добавить опцию в `ControlPanel.tsx`

---

## Добавление новой страницы

1. Создать `src/presentation/pages/MyPage.tsx`
2. В `App.tsx`:
   - Добавить `'mypage'` в `type Page`
   - Добавить в массив `NAV`: `{ id: 'mypage', label: 'Моя страница', icon: icons.xxx }`
   - Добавить рендер: `{page === 'mypage' && <Sub title="..." onBack={back}><MyPage /></Sub>}`

---

## Известные ограничения

- Нет React Router — навигация через state, deep links не поддерживаются
- Нет тестов — директории `tests/unit/` и `tests/integration/` существуют, но пусты
- `src/core/` и `src/shared/` — legacy-слои, часть логики ещё не перенесена в `domain/`
- OBD-II диагностика — симуляция, реального подключения через Web Serial API нет
- Прогресс модулей хранится в `localStorage` без синхронизации
