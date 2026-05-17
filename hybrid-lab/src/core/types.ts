/**
 * 📋 Типы для симуляции гибридного автомобиля
 * Все интерфейсы и типы данных находятся здесь
 */

// ==================== СИГНАЛЬНЫЕ ДАННЫЕ ====================

export interface SignalData {
  timestamp: number;       // Время в секундах
  voltage: number;         // Напряжение (В)
  current?: number;        // Ток (А) - опционально
  power?: number;          // Мощность (Вт) - опционально
}

export interface WaveformBuffer {
  data: number[];          // Массив значений сигнала
  maxLength: number;       // Максимальный размер буфера
  sampleRate: number;      // Частота дискретизации (Hz)
}

// ==================== КОМПОНЕНТЫ СИСТЕМЫ ====================

export interface BatteryState {
  soc: number;             // State of Charge (0-100%)
  voltage: number;         // Текущее напряжение (В)
  temperature: number;     // Температура (°C)
  healthPercent: number;   // Здоровье батареи (0-100%)
}

export interface EngineState {
  rpm: number;             // Обороты двигателя
  throttle: number;        // Дроссель (0-1)
  temperature: number;     // Температура (°C)
  isRunning: boolean;      // Работает ли двигатель
}

export interface MotorState {
  rpm: number;             // Обороты мотора
  torque: number;          // Крутящий момент (Nm)
  temperature: number;     // Температура (°C)
  mode: 'idle' | 'drive' | 'regen'; // Режим работы
}

// ==================== СОСТОЯНИЕ СИМУЛЯЦИИ ====================

export interface SimulationState {
  // Время
  time: number;            // Текущее время симуляции (сек)
  deltaTime: number;       // Время с последнего обновления (сек)
  isRunning: boolean;       // Работает ли симуляция

  // Компоненты системы
  battery: BatteryState;
  engine: EngineState;
  motor: MotorState;

  // Режим работы
  currentMode: 'parallel' | 'series' | 'ev';

  // Тестовая точка (для осциллографа)
  connectedTestPoint: string | null;
  waveformBuffer: WaveformBuffer;

  // Статистика
  totalEnergy: number;      // Общая использованная энергия (Wh)
  efficiency: number;       // КПД системы (0-100%)
}

// ==================== ТРЕБУЕМЫЕ ДАННЫЕ ДЛЯ ОБНОВЛЕНИЯ ====================

export interface SimulationInput {
  throttle: number;        // Дроссель (0-1)
  brakePressure?: number;  // Давление тормоза (0-100%)
  targetMode?: string;     // Желаемый режим
}

// ==================== КОНФИГУРАЦИЯ ====================

export interface ComponentConfig {
  id: string;
  name: string;
  baseVoltage: number;
  frequency: number;
  noiseAmplitude?: number;
}

export interface SimulatorConfig {
  battery: ComponentConfig;
  motor: ComponentConfig;
  engine: ComponentConfig;
  updateRate: number;      // Герцы обновления (Hz)
}

// ==================== СТРАТЕГИИ РЕЖИМОВ ====================

export interface HybridStrategy {
  name: string;
  description: string;
  execute(state: SimulationState, input: SimulationInput): SimulationState;
}

// ==================== МОДУЛИ ОБУЧЕНИЯ ====================

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon?: string;
}

export interface LMSState {
  completedModules: string[];
  currentModule: string | null;
  totalPoints: number;
  userLevel: 'beginner' | 'intermediate' | 'expert';
}
