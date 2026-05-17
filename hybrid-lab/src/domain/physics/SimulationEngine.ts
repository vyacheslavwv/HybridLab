/**
 * Главный симуляционный движок
 * Независим от React render loop и частоты обновления экрана
 */

import type {
  SimulationState,
  PhysicsProps,
  EnergyAllocation,
} from '../types/Simulation';
import type { IHybridMode } from '../types/HybridMode';
import { PHYSICS_CONSTANTS } from './constants';

export class SimulationEngine {
  private physics: PhysicsProps;
  private currentMode: IHybridMode;
  private previousEngineRpm: number = 0;
  private previousMotorRpm: number = 0;

  constructor(physics: PhysicsProps, initialMode: IHybridMode) {
    this.physics = physics;
    this.currentMode = initialMode;
  }

  /**
   * Каждый шаг по времени (deltaTime)
   * Расчёты НЕЗАВИСИМЫ от частоты обновления экрана
   *
   * @param deltaTime - время шага в секундах (0.016 для 60FPS, но может быть любое)
   * @param throttle - позиция дросселя 0-1
   * @param state - текущее состояние симуляции
   * @returns Новое состояние симуляции
   */
  step(deltaTime: number, throttle: number, state: SimulationState): SimulationState {
    // 2️⃣ Ограничиваем deltaTime, чтобы избежать неправильных расчётов
    const dt = Math.min(deltaTime, PHYSICS_CONSTANTS.MAX_TIME_STEP);

    // 1️⃣ Вычисляем распределение энергии через текущий режим гибрида
    const newTime = state.t + dt;
    const speed = this.calculateSpeed(this.previousEngineRpm, this.previousMotorRpm);
    const energyFlow = this.currentMode.calculateEnergyFlow(
      throttle,
      state.batterySoc,
      speed
    );

    // 2️⃣ Вычисляем новые обороты
    const newEngineRpm = this.calculateEngineRpm(
      throttle,
      energyFlow.engineLoad,
      dt,
      this.previousEngineRpm
    );

    const newMotorRpm = this.calculateMotorRpm(
      energyFlow.motorLoad,
      dt,
      this.previousMotorRpm
    );

    // 3️⃣ Обновляем батарею
    const newBatterySoc = this.updateBatterySoc(
      state.batterySoc,
      energyFlow.chargeRate,
      dt
    );

    const newBatteryVoltage = this.calculateBatteryVoltage(newBatterySoc);

    // 4️⃣ Обновляем сохранённые обороты
    this.previousEngineRpm = newEngineRpm;
    this.previousMotorRpm = newMotorRpm;

    // 5️⃣ Возвращаем новое состояние
    return {
      ...state,
      t: newTime,
      engineRpm: Math.max(0, newEngineRpm),
      motorRpm: Math.max(0, newMotorRpm),
      batterySoc: Math.max(0, Math.min(100, newBatterySoc)),
      batteryVoltage: newBatteryVoltage,
      timestamp: Date.now(),
    };
  }

  /**
   * Расчёт оборотов ДВС с учётом инерции
   * Уравнение динамики: ω' = (ω_target - ω) / τ + ω
   */
  private calculateEngineRpm(
    throttle: number,
    load: number,
    dt: number,
    previousRpm: number
  ): number {
    const target = throttle * this.physics.engineMaxRpm;

    // Инерция двигателя - быстрое ускорение, медленное замедление
    const acceleration = load > 0 ?
      PHYSICS_CONSTANTS.ENGINE_INERTIA * 1.2 : // ускорение
      PHYSICS_CONSTANTS.ENGINE_INERTIA * 0.8; // замедление

    const rpmDelta = (target - previousRpm) / (acceleration * dt);
    return previousRpm + rpmDelta * dt;
  }

  /**
   * Расчёт оборотов мотора
   * Более быстрая реакция, чем у ДВС
   */
  private calculateMotorRpm(
    load: number,
    dt: number,
    previousRpm: number
  ): number {
    const target = load * this.physics.motorMaxRpm;

    // Мотор реагирует быстрее
    const acceleration = load > 0 ?
      PHYSICS_CONSTANTS.MOTOR_INERTIA * 1.5 :
      PHYSICS_CONSTANTS.MOTOR_INERTIA * 1.0;

    const rpmDelta = (target - previousRpm) / (acceleration * dt);
    return previousRpm + rpmDelta * dt;
  }

  /**
   * Обновление заряда батареи
   * Преобразуем ток (А) в проценты заряда
   *
   * Формула: ΔSoC = (Current / Capacity) * dt * 100
   * где Current в амперах, Capacity в ампер-часах
   */
  private updateBatterySoc(
    currentSoc: number,
    chargeRate: number, // в амперах (положительный = зарядка)
    dt: number
  ): number {
    // Переводим заряд батареи из кВтч в ампер-часы
    // 1 кВтч = 1000 Вт•ч, Ампер-часы = (1000 Вт•ч) / 144 В
    const capacityAh = (this.physics.batteryCapacity * 1000) / 144;

    // Процент изменения за шаг времени
    const socDelta = (chargeRate / capacityAh) * dt * 100;

    return currentSoc + socDelta;
  }

  /**
   * Расчёт напряжения батареи
   * В реальности: V = V_nominal - I*R - V_drop(SoC)
   * Для симуляции: V = V_nominal * (SoC / 100)
   */
  private calculateBatteryVoltage(soc: number): number {
    return this.physics.batteryVoltageNominal * (soc / 100);
  }

  /**
   * Расчёт скорости автомобиля
   * Упрощённый расчёт: скорость пропорциональна RPM среднего мотора
   * В км/ч
   */
  private calculateSpeed(engineRpm: number, motorRpm: number): number {
    // Среднее между ДВС и мотором (условно)
    const avgRpm = (engineRpm + motorRpm) / 2;

    // На каждых 1000 об/мин примерно 20 км/ч
    return Math.min(avgRpm / 50, 180); // макс 180 км/ч
  }

  /**
   * Переключить режим гибрида
   */
  setHybridMode(newMode: IHybridMode): void {
    this.currentMode = newMode;
  }

  /**
   * Получить текущий режим
   */
  getHybridMode(): IHybridMode {
    return this.currentMode;
  }

  /**
   * Получить текущий расчёт энергии (для отладки и визуализации)
   */
  getCurrentEnergyFlow(
    throttle: number,
    socPercent: number,
    speed: number
  ): EnergyAllocation {
    return this.currentMode.calculateEnergyFlow(throttle, socPercent, speed);
  }

  /**
   * Сбросить состояние движка
   */
  reset(): void {
    this.previousEngineRpm = 0;
    this.previousMotorRpm = 0;
  }
}
