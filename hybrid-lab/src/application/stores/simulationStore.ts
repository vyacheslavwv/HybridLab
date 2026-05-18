/**
 * Zustand store для управления состоянием симуляции
 * Это главный store приложения с физическим движком
 */

import { create } from 'zustand';
import { SimulationEngine } from '../../domain/physics/SimulationEngine';
import { HybridModeFactory } from '../../domain/strategies/HybridModeFactory';
import type {
  SimulationState,
  PhysicsProps,
  HybridModeType,
} from '../../domain/types/Simulation';
import { PHYSICS_CONSTANTS } from '../../domain/physics/constants';
import { SIGNAL_REGISTRY } from '../../domain/physics/SignalRegistry';

// Физические параметры автомобиля (по умолчанию)
const DEFAULT_PHYSICS: PhysicsProps = {
  engineMaxRpm: PHYSICS_CONSTANTS.ENGINE_MAX_RPM,
  motorMaxRpm: PHYSICS_CONSTANTS.MOTOR_MAX_RPM,
  batteryCapacity: PHYSICS_CONSTANTS.BATTERY_CAPACITY_KWH,
  batteryVoltageNominal: PHYSICS_CONSTANTS.BATTERY_VOLTAGE_NOMINAL,
  vehicleMass: PHYSICS_CONSTANTS.VEHICLE_MASS_KG,
  motorEfficiency: PHYSICS_CONSTANTS.MOTOR_EFFICIENCY,
  engineEfficiency: PHYSICS_CONSTANTS.ENGINE_EFFICIENCY,
};

// Начальное состояние симуляции
const DEFAULT_STATE: SimulationState = {
  t: 0,
  throttle: 0,
  engineRpm: 0,
  motorRpm: 0,
  batterySoc: 85,
  batteryVoltage: 144,
  isRunning: false,
  mode: 'Hybrid',
  timestamp: Date.now(),
  connectedTestPoint: null,
  waveformData: [],
  testPointValue: 0,
};

export interface SimulationStore {
  // --- СОСТОЯНИЕ ---
  simulationState: SimulationState;
  hybridMode: HybridModeType;
  physics: PhysicsProps;

  // --- ДЕЙСТВИЯ ---
  setThrottle: (value: number) => void;
  setHybridMode: (mode: HybridModeType) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;

  // Основной шаг симуляции (вызывается из useSimulation hook)
  step: (deltaTime: number) => void;

  // Работа с тестовыми точками (для осциллографа/мультиметра)
  connectTestPoint: (pointId: string) => void;
  disconnectTestPoint: () => void;

  // Получить текущий движок (для прямого доступа)
  getEngine: () => SimulationEngine;
}

/**
 * Создаём store с Zustand
 * Используем функцию для создания экземпляра движка один раз
 */
export const useSimulationStore = create<SimulationStore>((set, get) => {
  // Создаём движок один раз при инициализации
  let engine: SimulationEngine | null = null;

  const initializeEngine = () => {
    if (!engine) {
      const mode = HybridModeFactory.createMode('Hybrid', DEFAULT_PHYSICS);
      engine = new SimulationEngine(DEFAULT_PHYSICS, mode);
    }
    return engine;
  };

  return {
    // === НАЧАЛЬНОЕ СОСТОЯНИЕ ===
    simulationState: DEFAULT_STATE,
    hybridMode: 'Hybrid',
    physics: DEFAULT_PHYSICS,

    // === ДЕЙСТВИЯ ===

    /**
     * Установить позицию дросселя
     */
    setThrottle: (value: number) => {
      set((state) => ({
        simulationState: {
          ...state.simulationState,
          throttle: Math.max(0, Math.min(1, value)),
        },
      } as Partial<SimulationStore>));
    },

    /**
     * Переключить режим гибрида
     */
    setHybridMode: (mode: HybridModeType) => {
      const current = get();
      const newMode = HybridModeFactory.createMode(mode, current.physics);

      initializeEngine().setHybridMode(newMode);

      set({
        hybridMode: mode,
        simulationState: {
          ...current.simulationState,
          mode,
        },
      } as Partial<SimulationStore>);
    },

    /**
     * Запустить симуляцию
     */
    startSimulation: () => {
      set((state) => ({
        simulationState: {
          ...state.simulationState,
          isRunning: true,
        },
      } as Partial<SimulationStore>));
    },

    /**
     * Приостановить симуляцию
     */
    pauseSimulation: () => {
      set((state) => ({
        simulationState: {
          ...state.simulationState,
          isRunning: false,
        },
      } as Partial<SimulationStore>));
    },

    /**
     * Полностью остановить симуляцию
     */
    stopSimulation: () => {
      set({
        simulationState: {
          ...DEFAULT_STATE,
          mode: get().hybridMode,
        },
      } as Partial<SimulationStore>);
      if (engine) {
        engine.reset();
      }
    },

    /**
     * Сбросить всё на начальные значения
     */
    resetSimulation: () => {
      engine = null;
      set({
        simulationState: DEFAULT_STATE,
        hybridMode: 'Hybrid',
        physics: DEFAULT_PHYSICS,
      } as Partial<SimulationStore>);
    },

    /**
     * Основной шаг симуляции
     * Вызывается из useSimulation hook на каждый frame
     * @param deltaTime - время в секундах с последнего вызова
     */
    step: (deltaTime: number) => {
      const current = get();
      const engine = initializeEngine();

      const newState = engine.step(
        deltaTime,
        current.simulationState.throttle,
        current.simulationState
      );

      // Update waveform buffer using SIGNAL_REGISTRY
      let newWaveformData = [...current.simulationState.waveformData];
      if (current.simulationState.connectedTestPoint) {
        const testPointId = current.simulationState.connectedTestPoint;
        const entry = SIGNAL_REGISTRY[testPointId];
        const testValue = entry
          ? entry.calculate(newState.t, current.simulationState.throttle)
          : 0;
        // Cap buffer at 512 samples
        newWaveformData = [...newWaveformData.slice(-511), testValue];
      }

      set({
        simulationState: {
          ...newState,
          waveformData: newWaveformData,
          testPointValue: current.simulationState.connectedTestPoint
            ? newWaveformData[newWaveformData.length - 1] || 0
            : 0,
        },
      } as Partial<SimulationStore>);
    },

    /**
     * Подключить щуп к тестовой точке
     */
    connectTestPoint: (pointId: string) => {
      set((state) => ({
        simulationState: {
          ...state.simulationState,
          connectedTestPoint: pointId,
          waveformData: [], // очищаем предыдущие данные
        },
      } as Partial<SimulationStore>));
    },

    /**
     * Отключить щуп
     */
    disconnectTestPoint: () => {
      set((state) => ({
        simulationState: {
          ...state.simulationState,
          connectedTestPoint: null,
          waveformData: [],
        },
      } as Partial<SimulationStore>));
    },

    /**
     * Получить текущий движок (для прямого доступа)
     */
    getEngine: () => {
      return initializeEngine();
    },
  };
});
