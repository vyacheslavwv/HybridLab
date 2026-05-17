/**
 * Zustand store для управления прогрессом пользователя в обучении
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserLevel = 'Newbie' | 'Practitioner' | 'Expert';

export interface ProgressStore {
  // --- СОСТОЯНИЕ ---
  completedModules: string[];
  totalPoints: number;
  userLevel: UserLevel;
  lastUpdated: number;

  // --- ДЕЙСТВИЯ ---
  markModuleCompleted: (moduleId: string) => void;
  addPoints: (points: number) => void;
  resetProgress: () => void;
  getProgress: () => { completed: number; total: number; percent: number };
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      // === НАЧАЛЬНОЕ СОСТОЯНИЕ ===
      completedModules: [],
      totalPoints: 0,
      userLevel: 'Newbie',
      lastUpdated: Date.now(),

      // === ДЕЙСТВИЯ ===

      /**
       * Отметить модуль как пройденный
       */
      markModuleCompleted: (moduleId: string) => {
        set((state) => {
          if (state.completedModules.includes(moduleId)) {
            return state; // уже отмечен
          }

          const newCompleted = [...state.completedModules, moduleId];
          const newPoints = state.totalPoints + 100; // 100 баллов за модуль
          const newLevel = calculateLevel(newCompleted.length);

          return {
            completedModules: newCompleted,
            totalPoints: newPoints,
            userLevel: newLevel,
            lastUpdated: Date.now(),
          };
        });
      },

      /**
       * Добавить баллы
       */
      addPoints: (points: number) => {
        set((state) => ({
          totalPoints: state.totalPoints + points,
          lastUpdated: Date.now(),
        }));
      },

      /**
       * Сбросить весь прогресс
       */
      resetProgress: () => {
        set({
          completedModules: [],
          totalPoints: 0,
          userLevel: 'Newbie',
          lastUpdated: Date.now(),
        });
      },

      /**
       * Получить информацию о прогрессе
       */
      getProgress: () => {
        const state = get();
        const total = 3; // всего 3 модуля: ICE, Electric, Modes
        const completed = state.completedModules.length;
        const percent = Math.round((completed / total) * 100);

        return { completed, total, percent };
      },
    }),
    {
      name: 'hybrid-lab-progress', // ключ в localStorage
      version: 1,
    }
  )
);

/**
 * Вспомогательная функция для определения уровня пользователя
 */
function calculateLevel(completedModules: number): UserLevel {
  if (completedModules === 0) return 'Newbie';
  if (completedModules < 3) return 'Practitioner';
  return 'Expert';
}
