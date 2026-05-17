/**
 * Основные типы для симуляции гибридного автомобиля
 */

export type HybridModeType = 'EV' | 'Hybrid' | 'Series' | 'Charging';

export interface SimulationState {
  /** Время симуляции в секундах */
  t: number;

  /** Позиция дросселя 0-1 */
  throttle: number;

  /** Обороты двигателя (об/мин) */
  engineRpm: number;

  /** Обороты мотора (об/мин) */
  motorRpm: number;

  /** Заряд батареи (%) */
  batterySoc: number;

  /** Напряжение батареи (V) */
  batteryVoltage: number;

  /** Запущена ли симуляция */
  isRunning: boolean;

  /** Текущий режим гибрида */
  mode: HybridModeType;

  /** Время последнего обновления */
  timestamp: number;

  /** Подключённая тестовая точка */
  connectedTestPoint: string | null;

  /** Данные осциллографа */
  waveformData: number[];

  /** Текущее значение щупа */
  testPointValue: number;
}

export interface PhysicsProps {
  /** Максимальные обороты ДВС (об/мин) */
  engineMaxRpm: number;

  /** Максимальные обороты мотора (об/мин) */
  motorMaxRpm: number;

  /** Ёмкость батареи (кВтч) */
  batteryCapacity: number;

  /** Номинальное напряжение батареи (V) */
  batteryVoltageNominal: number;

  /** Масса автомобиля (кг) */
  vehicleMass: number;

  /** КПД мотора (0-1) */
  motorEfficiency: number;

  /** КПД ДВС (0-1) */
  engineEfficiency: number;
}

export interface EnergyAllocation {
  /** Нагрузка на ДВС (0-1) */
  engineLoad: number;

  /** Нагрузка на мотор (0-1) */
  motorLoad: number;

  /** Ток батареи (положительный = зарядка) */
  chargeRate: number;

  /** Оптимален ли этот режим */
  isOptimal: boolean;
}

export interface SignalConfig {
  /** Базовое напряжение (V) */
  baseVoltage: number;

  /** Частота сигнала (Гц) */
  frequency: number;

  /** Амплитуда сигнала */
  amplitude: number;

  /** Уровень шума (0-1) */
  noiseLevel: number;
}

export interface TestPoint {
  /** Уникальный ID точки */
  id: string;

  /** Человеческое имя */
  label: string;

  /** Координата X (SVG) */
  x: number;

  /** Координата Y (SVG) */
  y: number;

  /** Accent color for highlight ring when connected */
  color?: string;

  /** Получить текущий сигнал */
  getSignal(): number;
}

/**
 * Describes which energy paths are active in the hybrid circuit.
 * Derived from SimulationState by useEnergyFlow() hook.
 */
export interface EnergyFlowState {
  /** Battery → Inverter → Motor path activity (0–1) */
  batteryToMotor: number;
  /** ICE → Generator path activity (0–1) */
  iceToGenerator: number;
  /** Generator → Battery charging path activity (0–1) */
  generatorToBattery: number;
  /** Motor → Wheels path activity (0–1) */
  motorToWheels: number;
  /** Wheels → Motor regenerative path activity (0–1) */
  wheelsToMotor: number;
  /** Direction of battery current */
  batteryDirection: 'charging' | 'discharging' | 'idle';
  /** Simulation time — drives stroke-dashoffset animation */
  animationT: number;
}

export interface InstrumentState {
  /** Название инструмента */
  name: string;

  /** Подключённая тестовая точка */
  connectedPoint: string | null;

  /** Текущие данные */
  data: number[];
}
