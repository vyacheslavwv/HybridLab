import type {
  SimulationState,
  SimulationInput,
  BatteryState,
  EngineState,
  MotorState,
  SimulatorConfig,
} from './types';
import { SignalSourceFactory } from './SignalSource';

/**
 * 🧮 SimulationEngine — основной движок симуляции
 * Отделен от React, работает независимо от UI
 * Расчеты происходят независимо от частоты обновления экрана
 */

export class SimulationEngine {
  private batterySource = SignalSourceFactory.createBatterySource();
  private motorSource = SignalSourceFactory.createMotorSource();

  constructor() {
  }

  /**
   * Расчитать состояние батареи
   */
  private calculateBatteryState(
    prevBattery: BatteryState,
    throttle: number,
    deltaTime: number,
    t: number
  ): BatteryState {
    let newSoc = prevBattery.soc;

    // СОС изменяется в зависимости от дросселя
    if (throttle > 0.6) {
      newSoc -= throttle * 0.5 * deltaTime; // Разряд при высокой нагрузке
    } else if (throttle < 0.3 && throttle > 0) {
      newSoc += 0.05 * deltaTime; // Восстановление при низкой нагрузке
    }

    newSoc = Math.max(0, Math.min(100, newSoc));

    // Напряжение зависит от СОС и сигнала от батареи
    const baseVoltage = 120 + (newSoc / 100) * 24; // 120-144V
    const signal = this.batterySource.getSignal(t, throttle);
    const voltage = baseVoltage + signal * 0.1;

    // Температура зависит от степени разряда
    const temperature = 20 + (100 - newSoc) * 0.05 + (throttle * 15);

    return {
      soc: newSoc,
      voltage: Math.max(0, voltage),
      temperature,
      healthPercent: Math.max(70, 98 - (100 - newSoc) * 0.05),
    };
  }

  /**
   * Расчитать состояние ДВС
   */
  private calculateEngineState(
    prevEngine: EngineState,
    throttle: number,
    deltaTime: number,
    t: number
  ): EngineState {
    // ОБ/МИН зависит от дросселя + синусоидальный шум
    const baseRpm = throttle * 5000;
    const rpmNoise = Math.sin(t) * 500;
    const newRpm = baseRpm + rpmNoise;

    // Температура ДВС растет со временем работы
    const isRunning = throttle > 0.1;
    const temperature = isRunning
      ? prevEngine.temperature + 0.5 * deltaTime
      : Math.max(20, prevEngine.temperature - 0.3 * deltaTime);

    return {
      rpm: Math.max(0, newRpm),
      throttle,
      temperature: Math.min(120, temperature),
      isRunning,
    };
  }

  /**
   * Расчитать состояние электромотора
   */
  private calculateMotorState(
    prevMotor: MotorState,
    throttle: number,
    deltaTime: number,
    t: number
  ): MotorState {
    // Мотор может быть в трех режимах
    let mode: 'idle' | 'drive' | 'regen' = 'idle';
    if (throttle > 0.3) {
      mode = 'drive';
    }

    // ОБ/МИН мотора
    const baseRpm = throttle * 3500 + Math.cos(t * 2) * 400;

    // Крутящий момент зависит от мотора
    const torque = (throttle * 250) + Math.sin(t * 3) * 50;

    // Температура
    const temperature = mode === 'idle'
      ? Math.max(20, prevMotor.temperature - 0.2 * deltaTime)
      : prevMotor.temperature + 0.3 * throttle * deltaTime;

    return {
      rpm: Math.max(0, baseRpm),
      torque: Math.max(0, torque),
      temperature: Math.min(100, temperature),
      mode,
    };
  }

  /**
   * Основной метод обновления состояния
   * @param prevState - предыдущее состояние
   * @param input - входные данные (дроссель, режим и т.д.)
   * @param deltaTime - время с последнего обновления (сек)
   * @returns новое состояние симуляции
   */
  async step(
    prevState: SimulationState,
    input: SimulationInput,
    deltaTime: number
  ): Promise<SimulationState> {
    const newTime = prevState.time + deltaTime;
    const throttle = input.throttle ?? prevState.engine.throttle;

    // Расчитаем каждый компонент
    const newBattery = this.calculateBatteryState(
      prevState.battery,
      throttle,
      deltaTime,
      newTime
    );

    const newEngine = this.calculateEngineState(
      prevState.engine,
      throttle,
      deltaTime,
      newTime
    );

    const newMotor = this.calculateMotorState(
      prevState.motor,
      throttle,
      deltaTime,
      newTime
    );

    // Генерируем сигналы для подключенной тестовой точки
    let newTestPointValue = 0;
    if (prevState.connectedTestPoint) {
      switch (prevState.connectedTestPoint) {
        case 'battery':
          newTestPointValue = this.batterySource.getSignal(newTime, throttle);
          break;
        case 'motor':
          newTestPointValue = this.motorSource.getSignal(newTime, throttle);
          break;
        case 'engine':
          newTestPointValue = 12 + Math.sin(newTime * 3) * 5;
          break;
      }
    }

    // Расчитаем эффективность
    const efficiency =
      newBattery.soc > 0 && newMotor.rpm > 0
        ? Math.min(100, (newMotor.torque / (newBattery.voltage / 100)) * 10)
        : 0;

    // Обновляем буфер волны
    const newWaveformBuffer = { ...prevState.waveformBuffer };
    if (prevState.connectedTestPoint && newWaveformBuffer.data.length < newWaveformBuffer.maxLength) {
      newWaveformBuffer.data = [...newWaveformBuffer.data, newTestPointValue];
    } else if (prevState.connectedTestPoint) {
      newWaveformBuffer.data = [
        ...newWaveformBuffer.data.slice(1),
        newTestPointValue,
      ];
    }

    return {
      time: newTime,
      deltaTime,
      isRunning: prevState.isRunning,
      battery: newBattery,
      engine: newEngine,
      motor: newMotor,
      currentMode: input.targetMode ? input.targetMode as 'parallel' | 'series' | 'ev' : prevState.currentMode,
      connectedTestPoint: prevState.connectedTestPoint,
      waveformBuffer: newWaveformBuffer,
      totalEnergy: prevState.totalEnergy + (newBattery.voltage * 0.1 * deltaTime),
      efficiency,
    };
  }

  /**
   * Получить начальное состояние
   */
  getInitialState(): SimulationState {
    return {
      time: 0,
      deltaTime: 0,
      isRunning: false,
      battery: {
        soc: 85,
        voltage: 144,
        temperature: 25,
        healthPercent: 98,
      },
      engine: {
        rpm: 0,
        throttle: 0,
        temperature: 20,
        isRunning: false,
      },
      motor: {
        rpm: 0,
        torque: 0,
        temperature: 20,
        mode: 'idle',
      },
      currentMode: 'parallel',
      connectedTestPoint: null,
      waveformBuffer: {
        data: [],
        maxLength: 512,
        sampleRate: 60,
      },
      totalEnergy: 0,
      efficiency: 0,
    };
  }
}
