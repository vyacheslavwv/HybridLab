import { SimulatorConfig, ComponentConfig } from '../core/types';

/**
 * 🔌 MockService — заглушка для будущего API
 * Позволяет легко переключиться на реальные данные
 */

export class MockService {
  /**
   * Получить конфигурацию симулятора
   */
  static async getSimulatorConfig(): Promise<SimulatorConfig> {
    return {
      battery: {
        id: 'battery',
        name: 'Батарея',
        baseVoltage: 144,
        frequency: 0.5,
        noiseAmplitude: 0.05,
      },
      motor: {
        id: 'motor',
        name: 'Электромотор',
        baseVoltage: 120,
        frequency: 2,
        noiseAmplitude: 0.08,
      },
      engine: {
        id: 'engine',
        name: 'ДВС',
        baseVoltage: 12,
        frequency: 3,
        noiseAmplitude: 0.1,
      },
      updateRate: 60, // 60 Hz
    };
  }

  /**
   * Получить данные о модулях обучения
   */
  static async getModules(): Promise<
    Array<{
      id: string;
      title: string;
      description: string;
      duration: string;
    }>
  > {
    return [
      {
        id: 'ice',
        title: 'Устройство ДВС',
        description: 'Макет двигателя и его роль в гибридной схеме.',
        duration: '15–20 мин',
      },
      {
        id: 'electric',
        title: 'Электрическая схема',
        description: 'Связь ДВС, генератора, аккумулятора и тягового мотора.',
        duration: '20–25 мин',
      },
      {
        id: 'modes',
        title: 'Симулятор режимов',
        description: 'Режимы движения гибридного автомобиля и распределение энергии.',
        duration: '20–30 мин',
      },
    ];
  }

  /**
   * Сохранить прогресс пользователя (mock)
   */
  static async saveUserProgress(userId: string, moduleId: string): Promise<boolean> {
    console.log(`[Mock] Сохранение прогресса пользователя ${userId} для модуля ${moduleId}`);
    return true;
  }

  /**
   * Получить прогресс пользователя
   */
  static async getUserProgress(userId: string): Promise<string[]> {
    console.log(`[Mock] Получение прогресса пользователя ${userId}`);
    // Здесь будет чтение из localStorage или API
    const stored = localStorage.getItem('hybridlab-completed');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Отправить телеметрию симуляции
   */
  static async logSimulationMetrics(metrics: {
    moduleId: string;
    duration: number;
    avgEfficiency: number;
    peakRpm: number;
  }): Promise<void> {
    console.log('[Mock] Логирование метрик:', metrics);
    // Здесь будет отправка на реальный сервер
  }
}
