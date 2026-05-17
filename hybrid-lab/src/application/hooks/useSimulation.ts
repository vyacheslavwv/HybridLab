/**
 * Custom hook для управления симуляцией
 * Главный hook приложения - управляет игровым циклом
 *
 * ⚠️ ВАЖНО: Расчёты симуляции НЕЗАВИСИМЫ от частоты обновления экрана!
 * Это достигается через deltaTime-based логику
 */

import { useEffect } from 'react';
import { useSimulationStore } from '../stores/simulationStore';

export function useSimulation() {
  const {
    simulationState,
    startSimulation,
    pauseSimulation,
    step,
  } = useSimulationStore();

  /**
   * Основной игровой цикл (game loop)
   * Работает независимо от частоты обновления браузера
   */
  useEffect(() => {
    // Если не запущена - выходим
    if (!simulationState.isRunning) {
      return;
    }

    // Инициализируем время последнего обновления
    let lastFrameTime = performance.now();
    let frameId: number;

    /**
     * Основная функция цикла
     * requestAnimationFrame вызывает эту функцию, когда браузер готов отрисовать кадр
     */
    const gameLoop = (currentFrameTime: number) => {
      // 1️⃣ Вычисляем реальное время, прошедшее с последнего кадра
      const deltaTime = (currentFrameTime - lastFrameTime) / 1000; // в секундах
      lastFrameTime = currentFrameTime;

      // 2️⃣ Ограничиваем максимальный deltaTime
      // Если браузер лагает и deltaTime > 50ms, берем максимум 50ms
      // Это предотвращает "прыжки" в физике при падении FPS
      const clampedDeltaTime = Math.min(deltaTime, 0.05);

      // 3️⃣ Выполняем шаг симуляции
      // Расчёты НЕЗАВИСИМЫ от FPS благодаря deltaTime
      step(clampedDeltaTime);

      // 4️⃣ Запланируем следующий кадр
      frameId = requestAnimationFrame(gameLoop);
    };

    // Запускаем цикл
    frameId = requestAnimationFrame(gameLoop);

    // Cleanup: отменяем цикл при размонтировании или остановке сим
    return () => cancelAnimationFrame(frameId);
  }, [simulationState.isRunning, step]);

  // Возвращаем хук для использования в компонентах
  return {
    simulationState,
    startSimulation,
    pauseSimulation,
    isRunning: simulationState.isRunning,
    throttle: simulationState.throttle,
    engineRpm: simulationState.engineRpm,
    motorRpm: simulationState.motorRpm,
    batterySoc: simulationState.batterySoc,
    batteryVoltage: simulationState.batteryVoltage,
    time: simulationState.t,
    waveformData: simulationState.waveformData,
    connectedTestPoint: simulationState.connectedTestPoint,
    testPointValue: simulationState.testPointValue,
  };
}
