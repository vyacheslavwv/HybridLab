# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # tsc -b && vite build
npm run lint       # ESLint (flat config, ESLint 9+)
npm run preview    # Preview production build
```

No test runner is configured yet — `tests/unit/` and `tests/integration/` directories exist but are empty.

## Architecture

**Hybrid Lab** is an interactive educational platform simulating hybrid electric vehicles (HEVs). It uses a **Clean Architecture** with three main layers:

### Layer Overview

```
domain/          → Pure physics logic, no React dependencies
application/     → Zustand stores, custom hooks, game loop
presentation/    → React components, Canvas rendering
infrastructure/  → Config (module definitions, component registry)
shared/          → Cross-cutting utilities
core/            → Legacy layer (being migrated to domain/)
```

### Data Flow

```
User Input (ControlPanel)
  → Zustand Store (setThrottle, setRunning)
  → useSimulation hook (requestAnimationFrame, deltaTime)
  → SimulationEngine.step(deltaTime)
  → HybridMode.calculateEnergyFlow()  ← Strategy Pattern
  → Physics state update
  → Store update → React re-render → Oscilloscope/Statistics
```

### Key Patterns

- **Strategy Pattern**: Four hybrid modes — `EVMode`, `ParallelHybridMode`, `SeriesHybridMode`, `ChargingMode` — all extend `BaseHybridMode`. Use `HybridModeFactory` to create them.
- **Game Loop**: `useSimulation` hook drives `requestAnimationFrame` with `deltaTime`-based physics (frame-rate independent).
- **State**: Zustand v5 store at `application/stores/simulationStore.ts`. Main state shape is `SimulationState` defined in `domain/types/Simulation.ts`.
- **Canvas Oscilloscope**: `presentation/components/Oscilloscope.tsx` handles HiDPI scaling via `window.devicePixelRatio`. Waveform buffer is capped at 512 samples.

### Adding a New Hybrid Mode

1. Create a class in `domain/strategies/` extending `BaseHybridMode`
2. Register it in `HybridModeFactory`
3. Add the mode key to the union in `domain/types/HybridMode.ts`

### Styling

Tailwind CSS v4 with custom dark-mode palette and neon animation utilities (`pulse-neon`, `flow`, `glow`) defined in `tailwind.config.ts`. PostCSS config is at `postcss.config.cjs`.

### In-Progress / TODOs

- SVG circuit schematic (placeholder in `SimulatorPage`)
- Draggable oscilloscope probe component
- Multimeter instrument
- `infrastructure/` API/storage layers are stubs
