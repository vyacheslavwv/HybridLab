/**
 * Custom hook для управления прогрессом пользователя в обучении
 */

import { useCallback } from 'react';
import { useProgressStore } from '../stores/progressStore';

export function useProgress() {
  const {
    completedModules,
    totalPoints,
    userLevel,
    markModuleCompleted,
    addPoints,
    resetProgress,
    getProgress,
  } = useProgressStore();

  // Мемоизируем функцию получения прогресса
  const progress = useCallback(() => getProgress(), [getProgress]);

  // Мемоизируем функцию отметки модуля
  const markCompleted = useCallback(
    (moduleId: string) => {
      markModuleCompleted(moduleId);
    },
    [markModuleCompleted]
  );

  // Мемоизируем функцию добавления баллов
  const addScore = useCallback(
    (points: number) => {
      addPoints(points);
    },
    [addPoints]
  );

  const reset = useCallback(() => {
    resetProgress();
  }, [resetProgress]);

  return {
    completedModules,
    totalPoints,
    userLevel,
    progress,
    markCompleted,
    addScore,
    reset,
    isComplete: completedModules.length === 3,
  };
}
