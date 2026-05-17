/**
 * Интерфейсы для Strategy Pattern реализации режимов гибрида
 */

import type { HybridModeType, EnergyAllocation } from './Simulation';

export interface IHybridMode {
  /** Название режима */
  name: HybridModeType;

  /**
   * Расчёт распределения энергии
   * @param throttle - позиция дросселя 0-1
   * @param socPercent - заряд батареи в %
   * @param speed - скорость автомобиля (км/ч)
   */
  calculateEnergyFlow(
    throttle: number,
    socPercent: number,
    speed: number
  ): EnergyAllocation;

  /**
   * Получить целевые обороты ДВС
   * @param throttle - позиция дросселя
   */
  getEngineTarget(throttle: number): number;

  /**
   * Получить целевые обороты мотора
   * @param throttle - позиция дросселя
   */
  getMotorTarget(throttle: number): number;

  /**
   * Получить скорость зарядки батареи (А)
   */
  getBatteryChargeRate(): number;
}
