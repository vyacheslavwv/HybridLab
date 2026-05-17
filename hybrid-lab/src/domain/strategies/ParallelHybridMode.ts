/**
 * Режим Hybrid (Параллельный гибрид)
 * ДВС и мотор работают одновременно
 * Оптимальное распределение нагрузки между ними
 */

import type { EnergyAllocation, PhysicsProps } from '../types/Simulation';
import { BaseHybridMode } from './BaseHybridMode';
import { PHYSICS_CONSTANTS } from '../physics/constants';

export class ParallelHybridMode extends BaseHybridMode {
  override name: 'Hybrid' = 'Hybrid';

  constructor(physics: PhysicsProps) {
    super(physics);
  }

  /**
   * В параллельном гибриде:
   * - ДВС и мотор работают одновременно
   * - Распределяем нагрузку: ДВС берет основную нагрузку, мотор помогает
   * - При ускорении оба на полную
   * - При торможении рекуперируем энергию
   */
  override calculateEnergyFlow(
    throttle: number,
    socPercent: number,
    _speed: number
  ): EnergyAllocation {
    // Базовое распределение
    let engineLoad = throttle * 0.7; // ДВС берет 70% нагрузки
    let motorLoad = throttle * 0.5; // Мотор - 50% (может суммироваться)
    let chargeRate = 0;

    // Если батарея слишком разряжена, ДВС должен её заряжать
    if (socPercent < PHYSICS_CONSTANTS.HYBRID_MODE_EV_THRESHOLD) {
      engineLoad = throttle * 0.9; // ДВС на полную
      motorLoad = throttle * 0.2; // Мотор только помогает
      chargeRate = throttle * 30; // зарядка до 30А
    }
    // Если батарея переполнена, заряжать больше не нужно
    else if (socPercent > PHYSICS_CONSTANTS.HYBRID_MODE_CHARGE_THRESHOLD) {
      chargeRate = -Math.abs(throttle * 20); // разрядка
    }
    // Нормальный режим
    else {
      chargeRate = throttle > 0.5 ? throttle * 10 : -throttle * 15;
    }

    return {
      engineLoad: Math.min(engineLoad, 1),
      motorLoad: Math.min(motorLoad, 1),
      chargeRate,
      isOptimal: socPercent > 40 && socPercent < 90,
    };
  }

  override getEngineTarget(throttle: number): number {
    return throttle * this.physics.engineMaxRpm;
  }

  override getMotorTarget(throttle: number): number {
    return throttle * this.physics.motorMaxRpm * 0.7;
  }

  override getBatteryChargeRate(): number {
    return 15; // условно, зависит от реальной симуляции
  }
}
