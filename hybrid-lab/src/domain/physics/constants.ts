/**
 * Физические константы для симуляции
 */

export const PHYSICS_CONSTANTS = {
  // Двигатель
  ENGINE_MAX_RPM: 5000,
  ENGINE_IDLE_RPM: 650,
  ENGINE_EFFICIENCY: 0.35,
  ENGINE_INERTIA: 3000, // об/мин в секунду

  // Мотор
  MOTOR_MAX_RPM: 4000,
  MOTOR_EFFICIENCY: 0.92,
  MOTOR_INERTIA: 2500,

  // Батарея
  BATTERY_VOLTAGE_NOMINAL: 144, // Volts
  BATTERY_CAPACITY_KWH: 50, // Kilowatt-hours
  BATTERY_MIN_SOC: 10, // % минимального заряда
  BATTERY_MAX_SOC: 100, // % максимального заряда
  BATTERY_CHARGE_RATE_MAX: 50, // А максимальный ток зарядки
  BATTERY_DISCHARGE_RATE_MAX: 100, // А максимальный ток разрядки

  // Автомобиль
  VEHICLE_MASS_KG: 1500,
  VEHICLE_DRAG_COEFFICIENT: 0.28,
  VEHICLE_FRONTAL_AREA: 2.2,

  // Физика
  GRAVITY: 9.81, // м/с²
  AIR_DENSITY: 1.225, // кг/м³
  ROLLING_RESISTANCE_COEFFICIENT: 0.015,

  // Режимы
  HYBRID_MODE_EV_THRESHOLD: 20, // % заряда ниже этого = силовой режим
  HYBRID_MODE_CHARGE_THRESHOLD: 80, // % выше этого начнётся зарядка

  // Симуляция
  DEFAULT_TIME_STEP: 1 / 60, // 60 FPS
  MAX_TIME_STEP: 0.05, // 50ms максимум за итерацию
};

/**
 * Режимы гибрида и их параметры
 */
export const HYBRID_MODE_PARAMS = {
  EV: {
    name: 'EV' as const,
    label: 'Электромобиль',
    description: 'Только мотор от батареи, ДВС выключен',
    minSoc: 20, // минимальный заряд для EV
    enginePowerPercent: 0,
    motorPowerPercent: 100,
  },
  Hybrid: {
    name: 'Hybrid' as const,
    label: 'Параллельный гибрид',
    description: 'ДВС и мотор работают одновременно',
    minSoc: 40,
    enginePowerPercent: 50,
    motorPowerPercent: 50,
  },
  Series: {
    name: 'Series' as const,
    label: 'Последовательный гибрид',
    description: 'ДВС крутит генератор, мотор от батареи',
    minSoc: 30,
    enginePowerPercent: 40,
    motorPowerPercent: 100,
  },
  Charging: {
    name: 'Charging' as const,
    label: 'Зарядка',
    description: 'ДВС заряжает батарею',
    minSoc: 40,
    enginePowerPercent: 100,
    motorPowerPercent: 0,
  },
};
