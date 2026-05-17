/**
 * Режим EV (Электромобиль)
 * Только мотор от батареи, ДВС выключен
 */

import type { EnergyAllocation, PhysicsProps } from '../types/Simulation';
import { BaseHybridMode } from './BaseHybridMode';
import { PHYSICS_CONSTANTS } from '../physics/constants';

export class EVMode extends BaseHybridMode {
  override name: 'EV' = 'EV';

  constructor(physics: PhysicsProps) {
    super(physics);
  }

  /**
   * В режиме EV:
   * - ДВС полностью отключен (0%)
   * - Мотор работает на 100% от дросселя (если заряд > минимума)
   * - Батарея разряжается
   */
  override calculateEnergyFlow(
    throttle: number,
    socPercent: number,
    _speed: number
  ): EnergyAllocation {
    // Если заряд критически низкий, нужно переключиться на другой режим
    const canRunEV = socPercent > PHYSICS_CONSTANTS.HYBRID_MODE_EV_THRESHOLD;

    return {
      engineLoad: 0, // ДВС выключен
      motorLoad: canRunEV ? throttle : 0,
      chargeRate: canRunEV ? -Math.abs(throttle * 50) : 0, // разрядка до 50А
      isOptimal: socPercent > 60, // оптимально, когда заряд > 60%
    };
  }

  override getEngineTarget(_throttle: number): number {
    return 0; // ДВС выключен в EV режиме
  }

  override getMotorTarget(throttle: number): number {
    return throttle * this.physics.motorMaxRpm;
  }

  override getBatteryChargeRate(): number {
    return -50; // разрядка
  }
}
