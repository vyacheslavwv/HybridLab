import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  SimulationState,
  BatteryState,
  EngineState,
  MotorState,
  WaveformBuffer,
  SimulationInput,
} from '../../core/types';

/**
 * 🔄 Zustand Store для управления симуляцией
 * Заменяет prop drilling, предоставляет глобальное состояние
 */

const initialBatteryState: BatteryState = {
  soc: 85,
  voltage: 144,
  temperature: 25,
  healthPercent: 98,
};

const initialEngineState: EngineState = {
  rpm: 0,
  throttle: 0,
  temperature: 20,
  isRunning: false,
};

const initialMotorState: MotorState = {
  rpm: 0,
  torque: 0,
  temperature: 20,
  mode: 'idle',
};

const initialWaveformBuffer: WaveformBuffer = {
  data: [],
  maxLength: 512,
  sampleRate: 60, // 60 Hz
};

export interface SimulationStore extends SimulationState {
  // Действия для управления состоянием
  setThrottle: (throttle: number) => void;
  setRunning: (isRunning: boolean) => void;
  setBatterySoc: (soc: number) => void;
  setEngineRpm: (rpm: number) => void;
  setMotorRpm: (rpm: number) => void;
  setCurrentMode: (mode: 'parallel' | 'series' | 'ev') => void;
  connectTestPoint: (point: string) => void;
  disconnectTestPoint: () => void;
  addWaveformSample: (sample: number) => void;
  reset: () => void;
  updateSimulation: (input: SimulationInput) => void;
}

const useSimulationStore = create<SimulationStore>()(
  devtools(
    (set, get) => ({
      // Начальное состояние
      time: 0,
      deltaTime: 0,
      isRunning: false,
      battery: initialBatteryState,
      engine: initialEngineState,
      motor: initialMotorState,
      currentMode: 'parallel',
      connectedTestPoint: null,
      waveformBuffer: initialWaveformBuffer,
      totalEnergy: 0,
      efficiency: 0,

      // ==================== SETTERS ====================

      setThrottle: (throttle: number) =>
        set((state) => ({
          engine: {
            ...state.engine,
            throttle: Math.max(0, Math.min(1, throttle)),
          },
        })),

      setRunning: (isRunning: boolean) =>
        set(() => ({
          isRunning,
        })),

      setBatterySoc: (soc: number) =>
        set((state) => ({
          battery: {
            ...state.battery,
            soc: Math.max(0, Math.min(100, soc)),
          },
        })),

      setEngineRpm: (rpm: number) =>
        set((state) => ({
          engine: {
            ...state.engine,
            rpm: Math.max(0, rpm),
          },
        })),

      setMotorRpm: (rpm: number) =>
        set((state) => ({
          motor: {
            ...state.motor,
            rpm: Math.max(0, rpm),
          },
        })),

      setCurrentMode: (mode: 'parallel' | 'series' | 'ev') =>
        set(() => ({
          currentMode: mode,
        })),

      connectTestPoint: (point: string) =>
        set((state) => ({
          connectedTestPoint: point,
          waveformBuffer: {
            ...state.waveformBuffer,
            data: [], // Очистить буфер при подключении нового щупа
          },
        })),

      disconnectTestPoint: () =>
        set(() => ({
          connectedTestPoint: null,
          waveformBuffer: {
            ...initialWaveformBuffer,
          },
        })),

      addWaveformSample: (sample: number) =>
        set((state) => {
          const { data, maxLength } = state.waveformBuffer;
          const newData =
            data.length >= maxLength
              ? [...data.slice(1), sample]
              : [...data, sample];

          return {
            waveformBuffer: {
              ...state.waveformBuffer,
              data: newData,
            },
          };
        }),

      updateSimulation: (input: SimulationInput) =>
        set((state) => {
          const newState = { ...state };

          if (input.throttle !== undefined) {
            newState.engine.throttle = Math.max(0, Math.min(1, input.throttle));
          }

          if (input.targetMode && input.targetMode !== state.currentMode) {
            newState.currentMode = input.targetMode as 'parallel' | 'series' | 'ev';
          }

          return newState;
        }),

      reset: () =>
        set(() => ({
          time: 0,
          deltaTime: 0,
          isRunning: false,
          battery: initialBatteryState,
          engine: initialEngineState,
          motor: initialMotorState,
          currentMode: 'parallel',
          connectedTestPoint: null,
          waveformBuffer: initialWaveformBuffer,
          totalEnergy: 0,
          efficiency: 0,
        })),
    }),
    { name: 'HybridLabStore' }
  )
);

export default useSimulationStore;
