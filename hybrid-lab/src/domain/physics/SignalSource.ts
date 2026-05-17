/**
 * Генератор сигналов для тестовых точек
 * Используется для осциллографа и мультиметра
 */

import type { SignalConfig } from '../types/Simulation';

export class SignalSource {
  private config: SignalConfig;

  constructor(config: SignalConfig) {
    this.config = config;
  }

  /**
   * Получить сигнал в момент времени t
   * @param t - абсолютное время в секундах
   * @param throttle - множитель амплитуды 0-1
   * @returns Напряжение в вольтах
   */
  getSignal(t: number, throttle: number = 0.5): number {
    // Синусоидальный сигнал
    const sine = Math.sin(t * this.config.frequency * Math.PI * 2);

    // Случайный шум для реалистичности
    const noise = (Math.random() - 0.5) * this.config.noiseLevel;

    // Итоговый сигнал: базовое напряжение * дроссель + синусоида + шум
    return (
      this.config.baseVoltage * throttle +
      sine * this.config.amplitude +
      noise
    );
  }

  /**
   * Получить амплитуду сигнала (без шума)
   */
  getAmplitude(t: number, throttle: number = 0.5): number {
    const sine = Math.sin(t * this.config.frequency * Math.PI * 2);
    return this.config.baseVoltage * throttle + sine * this.config.amplitude;
  }

  /**
   * Получить только шумовую составляющую
   */
  getNoise(): number {
    return (Math.random() - 0.5) * this.config.noiseLevel;
  }

  /**
   * Установить новый конфиг сигнала
   */
  updateConfig(newConfig: Partial<SignalConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Получить текущий конфиг
   */
  getConfig(): SignalConfig {
    return { ...this.config };
  }
}

/**
 * Предопределённые сигналы для компонентов автомобиля
 */
export class SignalLibrary {
  static battery(t: number, throttle: number = 0.5): number {
    return new SignalSource({
      baseVoltage: 144,
      frequency: 0.5,
      amplitude: 2,
      noiseLevel: 0.05,
    }).getSignal(t, throttle);
  }

  static motor(t: number, throttle: number = 0.5): number {
    return new SignalSource({
      baseVoltage: 120,
      frequency: 2,
      amplitude: 1.5,
      noiseLevel: 0.03,
    }).getSignal(t, throttle);
  }

  static engine(t: number, throttle: number = 0.5): number {
    return new SignalSource({
      baseVoltage: 12,
      frequency: 3,
      amplitude: 5,
      noiseLevel: 0.1,
    }).getSignal(t, throttle);
  }
}
