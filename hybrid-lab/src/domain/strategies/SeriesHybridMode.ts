/**
 * Режим Series (Последовательный гибрид)
 * ДВС работает только на оптимальных оборотах для зарядки батареи
 * Мотор питается только от батареи
 */

import type { EnergyAllocation, PhysicsProps } from '../types/Simulation';
import { BaseHybridMode } from './BaseHybridMode';
import { PHYSICS_CONSTANTS } from '../physics/constants';

export class SeriesHybridMode extends BaseHybridMode {
  override name: 'Series' = 'Series';

  constructor(physics: PhysicsProps) {
    super(physics);
  }

  /**
   * В последовательном гибриде:
   * - ДВС работает как генератор на оптимальных оборотах
   * - Мотор получает мощность от батареи и генератора
   * - Сложнее в расчётах, но более экономичнее
   */
  override calculateEnergyFlow(
    throttle: number,
    socPercent: number,
    _speed: number
  ): EnergyAllocation {
    // ДВС работает на фиксированных оптимальных оборотах
    const engineLoad = throttle > 0.3 ? 0.75 : 0.0; // только если есть нагрузка

    // Мотор питается от батареи
    let motorLoad = throttle * 0.9; // мотор более мощный

    let chargeRate = 0;

    if (engineLoad > 0) {
      // ДВС вырабатывает энергию для зарядки
      chargeRate = throttle * 60; // зарядка до 60А при полном дросселе
    } else if (socPercent < PHYSICS_CONSTANTS.HYBRID_MODE_EV_THRESHOLD) {
      // Батарея разряжена, срочно нужно включить ДВС
      motorLoad = throttle * 0.5;
      chargeRate = 0; // минимальная разрядка
    } else if (socPercent > PHYSICS_CONSTANTS.HYBRID_MODE_CHARGE_THRESHOLD) {
      // Батарея переполнена, разряжаем
      chargeRate = -Math.abs(throttle * 25);
    }

    return {
      engineLoad: Math.min(engineLoad, 1),
      motorLoad: Math.min(motorLoad, 1),
      chargeRate,
      isOptimal: socPercent > 50 && socPercent < 90,
    };
  }

  override getEngineTarget(throttle: number): number {
    // ДВС работает на постоянных оборотах для оптимальной генерации
    return throttle > 0.3 ? this.physics.engineMaxRpm * 0.6 : 0;
  }

  override getMotorTarget(throttle: number): number {
    return throttle * this.physics.motorMaxRpm;
  }

  override getBatteryChargeRate(): number {
    return 60; // от генератора
  }
}
