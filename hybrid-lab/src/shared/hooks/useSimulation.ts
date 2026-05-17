import { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore } from '../../application/stores/simulationStore';
import { SimulationEngine } from '../core/SimulationEngine';
import { SimulatorConfig } from '../core/types';

/**
 * 🎣 useSimulation Hook
 * Управляет симуляцией независимо от частоты обновления экрана
 * Использует requestAnimationFrame для плавного отображения
 */

export const useSimulation = (config: SimulatorConfig) => {
  const engineRef = useRef(new SimulationEngine(config));
  const lastTimeRef = useRef(Date.now());
  let frameIdRef = useRef<number | null>(null);

  // Получить store из Zustand
  const store = useSimulationStore();

  /**
   * Основной цикл симуляции
   * Работает независимо от частоты обновления UI
   */
  const simulationLoop = useCallback(() => {
    const now = Date.now();
    const deltaTime = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    if (deltaTime > 0.1) {
      // Если прошло более 100ms, ограничить deltaTime
      return;
    }

    if (store.isRunning) {
      // Расчитать новое состояние через Engine
      engineRef.current
        .step(store as any, { throttle: store.engine.throttle }, deltaTime)
        .then((newState) => {
          // Обновить store с новым состоянием
          store.setEngineRpm(newState.engine.rpm);
          store.setMotorRpm(newState.motor.rpm);
          store.setBatterySoc(newState.battery.soc);

          // Добавить сэмпл в буфер волны
          if (store.connectedTestPoint && newState.waveformBuffer.data.length > 0) {
            const lastSample = newState.waveformBuffer.data[newState.waveformBuffer.data.length - 1];
            store.addWaveformSample(lastSample);
          }
        });
    }

    // Продолжить цикл
    if (frameIdRef.current) {
      frameIdRef.current = requestAnimationFrame(simulationLoop);
    }
  }, [store]);

  /**
   * Запустить/остановить симуляцию
   */
  const start = useCallback(() => {
    if (!frameIdRef.current) {
      lastTimeRef.current = Date.now();
      frameIdRef.current = requestAnimationFrame(simulationLoop);
      store.setRunning(true);
    }
  }, [simulationLoop, store]);

  const stop = useCallback(() => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
      store.setRunning(false);
    }
  }, [store]);

  /**
   * Завершение при размонтировании компонента
   */
  useEffect(() => {
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []);

  return {
    ...store,
    start,
    stop,
  };
};

export default useSimulation;
