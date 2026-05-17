/**
 * Режим Charging (Зарядка)
 * ДВС максимально заряжает батарею
 * Автомобиль может медленно ехать или стоять на месте
 */

import type { EnergyAllocation, PhysicsProps } from '../types/Simulation';
import { BaseHybridMode } from './BaseHybridMode';

export class ChargingMode extends BaseHybridMode {
  override name: 'Charging' = 'Charging';

  constructor(physics: PhysicsProps) {
    super(physics);
  }

  /**
   * В режиме зарядки:
   * - ДВС работает на максимальную мощность для генерации
   * - Мотор используется минимально для движения
   * - Батарея максимально заряжается
   */
  override calculateEnergyFlow(
    throttle: number,
    socPercent: number,
    _speed: number
  ): EnergyAllocation {
    // ДВС на полную для зарядки
    const engineLoad = 1.0; // 100% мощности ДВС

    // Мотор минимально (только для небольшого движения)
    const motorLoad = Math.min(throttle, 0.2); // максимум 20% для движения

    // Максимальная зарядка батареи
    const chargeRate = 100; // 100А зарядки

    return {
      engineLoad,
      motorLoad,
      chargeRate,
      isOptimal: socPercent < 80, // оптимально при низком заряде
    };
  }

  override getEngineTarget(_throttle: number): number {
    return this.physics.engineMaxRpm * 0.8; // ДВС почти на максимум
  }

  override getMotorTarget(throttle: number): number {
    return Math.min(throttle, 0.2) * this.physics.motorMaxRpm;
  }

  override getBatteryChargeRate(): number {
    return 100; // максимальная зарядка
  }
}
