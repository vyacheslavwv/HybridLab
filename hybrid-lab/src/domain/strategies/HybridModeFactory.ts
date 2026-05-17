/**
 * Factory для создания объектов гибридных режимов
 */

import type { PhysicsProps } from '../types/Simulation';
import type { HybridModeType } from '../types/Simulation';
import type { IHybridMode } from '../types/HybridMode';
import { EVMode } from './EVMode';
import { ParallelHybridMode } from './ParallelHybridMode';
import { SeriesHybridMode } from './SeriesHybridMode';
import { ChargingMode } from './ChargingMode';

/**
 * Фабрика для создания экземпляров гибридных режимов
 * Используется Strategy Pattern
 */
export class HybridModeFactory {
  /**
   * Создать режим по типу
   * @param type - тип режима ('EV' | 'Hybrid' | 'Series' | 'Charging')
   * @param physics - физические параметры автомобиля
   * @returns Экземпляр стратегии режима
   */
  static createMode(type: HybridModeType, physics: PhysicsProps): IHybridMode {
    switch (type) {
      case 'EV':
        return new EVMode(physics);
      case 'Hybrid':
        return new ParallelHybridMode(physics);
      case 'Series':
        return new SeriesHybridMode(physics);
      case 'Charging':
        return new ChargingMode(physics);
      default:
        throw new Error(`Unknown hybrid mode: ${type}`);
    }
  }

  /**
   * Получить все доступные режимы
   */
  static getAllModes(physics: PhysicsProps): Record<HybridModeType, IHybridMode> {
    return {
      EV: new EVMode(physics),
      Hybrid: new ParallelHybridMode(physics),
      Series: new SeriesHybridMode(physics),
      Charging: new ChargingMode(physics),
    };
  }

  /**
   * Получить список названий режимов
   */
  static getModeNames(): HybridModeType[] {
    return ['EV', 'Hybrid', 'Series', 'Charging'];
  }
}
