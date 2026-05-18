import type { SimulationState, SimulationInput, HybridStrategy } from '../types';

/**
 * 📋 HybridModeStrategy — абстрактный класс для всех режимов
 */
abstract class HybridModeStrategy implements HybridStrategy {
  abstract name: string;
  abstract description: string;

  abstract execute(state: SimulationState, input: SimulationInput): SimulationState;

  protected calculateEfficiency(state: SimulationState): number {
    const { battery, motor } = state;
    if (battery.soc === 0 || motor.rpm === 0) return 0;
    return Math.min(100, (motor.torque / (battery.voltage / 100)) * 10);
  }
}

/**
 * 🔋 ParallelHybridMode
 * ДВС и электромотор работают параллельно
 * - Лучший комфорт и ускорение
 * - Среднее потребление энергии
 */
export class ParallelHybridMode extends HybridModeStrategy {
  name = 'Параллельный режим';
  description =
    'ДВС и электромотор работают вместе. Оптимально для комфорта и производительности.';

  execute(state: SimulationState, input: SimulationInput): SimulationState {
    const { throttle = 0 } = input;

    // В параллельном режиме оба источника активны одновременно
    let newEngine = { ...state.engine };
    let newMotor = { ...state.motor };
    let newBattery = { ...state.battery };

    if (throttle > 0.1) {
      // ДВС работает при любом дроссле > 10%
      newEngine.isRunning = true;
      newEngine.rpm = throttle * 5000;

      // Мотор помогает ДВС
      newMotor.mode = 'drive';
      newMotor.rpm = throttle * 3500;
      newMotor.torque = throttle * 250;

      // Расход батареи
      newBattery.soc = Math.max(
        0,
        newBattery.soc - throttle * 0.3
      );
    } else {
      newEngine.isRunning = false;
      newMotor.mode = 'idle';
    }

    return {
      ...state,
      engine: newEngine,
      motor: newMotor,
      battery: newBattery,
      currentMode: 'parallel',
    };
  }
}

/**
 * ⚡ SeriesHybridMode
 * ДВС ведет генератор, электромотор приводит колеса
 * - Лучшая эффективность в городе
 * - ДВС работает на оптимальных оборотах
 */
export class SeriesHybridMode extends HybridModeStrategy {
  name = 'Последовательный режим';
  description =
    'ДВС работает на генератор, мотор приводит колеса. Максимальная эффективность в городе.';

  execute(state: SimulationState, input: SimulationInput): SimulationState {
    const { throttle = 0 } = input;

    let newEngine = { ...state.engine };
    let newMotor = { ...state.motor };
    let newBattery = { ...state.battery };

    if (throttle > 0.1) {
      // ДВС работает на постоянных оборотах (оптимальные)
      newEngine.isRunning = true;
      newEngine.rpm = 3000; // Фиксированные обороты для эффективности

      // Мотор приводит колеса
      newMotor.mode = 'drive';
      newMotor.rpm = throttle * 3500;
      newMotor.torque = throttle * 280; // Чуть больше момента в этом режиме

      // Батарея может подзаряжаться от ДВС (меньше расход)
      newBattery.soc = Math.max(
        0,
        newBattery.soc - throttle * 0.15
      );
    } else {
      newEngine.isRunning = false;
      newMotor.mode = 'idle';
    }

    return {
      ...state,
      engine: newEngine,
      motor: newMotor,
      battery: newBattery,
      currentMode: 'series',
    };
  }
}

/**
 * 🔌 EVMode
 * Только электромотор, ДВС выключен
 * - Нулевые выбросы
 * - Минимум расходов на топливо
 * - Максимум разряда батареи
 */
export class EVMode extends HybridModeStrategy {
  name = 'Электрический режим';
  description = 'Только электромотор. Экологичный и бесшумный режим движения.';

  execute(state: SimulationState, input: SimulationInput): SimulationState {
    const { throttle = 0 } = input;

    let newEngine = { ...state.engine };
    let newMotor = { ...state.motor };
    let newBattery = { ...state.battery };

    // ДВС всегда выключен
    newEngine.isRunning = false;
    newEngine.rpm = 0;

    if (throttle > 0.05 && newBattery.soc > 5) {
      // Мотор работает, батарея разряжается
      newMotor.mode = 'drive';
      newMotor.rpm = throttle * 4000; // Чуть выше макс в EV режиме
      newMotor.torque = throttle * 300; // Максимальный момент

      // Максимальный расход батареи
      newBattery.soc = Math.max(0, newBattery.soc - throttle * 0.8);
    } else {
      newMotor.mode = 'idle';
      newMotor.rpm = 0;
      newMotor.torque = 0;
    }

    return {
      ...state,
      engine: newEngine,
      motor: newMotor,
      battery: newBattery,
      currentMode: 'ev',
    };
  }
}

/**
 * 🏭 Фабрика стратегий
 */
export class HybridModeFactory {
  private static strategies: Record<string, HybridModeStrategy> = {
    parallel: new ParallelHybridMode(),
    series: new SeriesHybridMode(),
    ev: new EVMode(),
  };

  static getStrategy(mode: 'parallel' | 'series' | 'ev'): HybridModeStrategy {
    return this.strategies[mode];
  }

  static getAllStrategies(): HybridModeStrategy[] {
    return Object.values(this.strategies);
  }
}
