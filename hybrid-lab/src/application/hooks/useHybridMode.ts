/**
 * Custom hook для управления режимом гибрида
 */

import { useCallback } from 'react';
import { useSimulationStore } from '../stores/simulationStore';
import type { HybridModeType } from '../../domain/types/Simulation';
import { HybridModeFactory } from '../../domain/strategies/HybridModeFactory';

export function useHybridMode() {
  const { hybridMode, setHybridMode, getEngine } = useSimulationStore();

  // Переключить режим
  const switchMode = useCallback(
    (newMode: HybridModeType) => {
      setHybridMode(newMode);
    },
    [setHybridMode]
  );

  // Получить все доступные режимы
  const availableModes = useCallback(() => {
    return HybridModeFactory.getModeNames();
  }, []);

  // Получить информацию о текущем режиме
  const getCurrentModeInfo = useCallback(() => {
    const engine = getEngine();
    const mode = engine.getHybridMode();
    return {
      name: mode.name,
      description: getModeName(mode.name),
    };
  }, [getEngine]);

  return {
    currentMode: hybridMode,
    switchMode,
    availableModes,
    getCurrentModeInfo,
  };
}

/**
 * Вспомогательная функция для получения названия режима
 */
function getModeName(mode: HybridModeType): string {
  const names: Record<HybridModeType, string> = {
    EV: 'Электромобиль - только батарея',
    Hybrid: 'Параллельный гибрид - ДВС + мотор одновременно',
    Series: 'Последовательный гибрид - ДВС генерирует ток',
    Charging: 'Зарядка - максимальная зарядка батареи',
  };
  return names[mode];
}
