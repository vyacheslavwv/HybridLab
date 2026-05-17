/**
 * Интерфейс для всех стратегий режимов гибрида
 */

import type { IHybridMode } from '../types/HybridMode';
import type { PhysicsProps, EnergyAllocation } from '../types/Simulation';

export abstract class BaseHybridMode implements IHybridMode {
  abstract name: 'EV' | 'Hybrid' | 'Series' | 'Charging';
  protected physics: PhysicsProps;

  constructor(physics: PhysicsProps) {
    this.physics = physics;
  }

  abstract calculateEnergyFlow(
    throttle: number,
    socPercent: number,
    speed: number
  ): EnergyAllocation;

  abstract getEngineTarget(throttle: number): number;
  abstract getMotorTarget(throttle: number): number;
  abstract getBatteryChargeRate(): number;
}
