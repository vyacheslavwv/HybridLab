import type { ComponentConfig } from './types';

/**
 * 🔌 SignalSource — генератор сигналов для компонентов системы
 * Использует детерминированный шум вместо Math.random()
 * для воспроизводимых тестов
 */

export class SignalSource {
  private config: ComponentConfig;

  constructor(config: ComponentConfig) {
    this.config = config;
  }

  /**
   * Простой детерминированный шум через sin функции
   * (вместо Перлина для простоты реализации)
   */
  private deterministicNoise(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Получить сигнал в момент времени t
   * @param t - текущее время в секундах
   * @param amplitude - амплитуда (обычно дроссель 0-1)
   * @returns напряжение в вольтах
   */
  getSignal(t: number, amplitude: number = 0.5): number {
    // Синусоидальная волна
    const sine = Math.sin(t * this.config.frequency * Math.PI * 2);

    // Детерминированный шум
    const noise =
      this.deterministicNoise(t * 13.7) * (this.config.noiseAmplitude ?? 0.05);

    // Результат: базовое напряжение * амплитуда + волна + шум
    return (
      this.config.baseVoltage * amplitude +
      sine * (this.config.baseVoltage * 0.1) +
      noise * 2
    );
  }

  /**
   * Получить аналитический сигнал (для фазовых методов)
   */
  getAnalyticSignal(t: number, amplitude: number = 0.5): { real: number; imag: number } {
    const sine = Math.sin(t * this.config.frequency * Math.PI * 2);
    const cosine = Math.cos(t * this.config.frequency * Math.PI * 2);
    const noise = this.deterministicNoise(t * 13.7) * (this.config.noiseAmplitude ?? 0.05);

    return {
      real: this.config.baseVoltage * amplitude + sine * (this.config.baseVoltage * 0.1) + noise,
      imag: cosine * (this.config.baseVoltage * 0.05),
    };
  }

  /**
   * Получить производную сигнала (для расчета di/dt)
   */
  getDerivative(t: number, amplitude: number = 0.5, dt: number = 0.001): number {
    const f1 = this.getSignal(t, amplitude);
    const f2 = this.getSignal(t + dt, amplitude);
    return (f2 - f1) / dt;
  }

  /**
   * Обновить конфигурацию источника
   */
  updateConfig(newConfig: Partial<ComponentConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Фабрика для создания стандартных источников
 */
export class SignalSourceFactory {
  static createBatterySource(): SignalSource {
    return new SignalSource({
      id: 'battery',
      name: 'Батарея',
      baseVoltage: 144,
      frequency: 0.5,
      noiseAmplitude: 0.05,
    });
  }

  static createMotorSource(): SignalSource {
    return new SignalSource({
      id: 'motor',
      name: 'Мотор',
      baseVoltage: 120,
      frequency: 2,
      noiseAmplitude: 0.08,
    });
  }

  static createEngineSource(): SignalSource {
    return new SignalSource({
      id: 'engine',
      name: 'ДВС',
      baseVoltage: 12,
      frequency: 3,
      noiseAmplitude: 0.1,
    });
  }
}
