/**
 * Zustand store для управления UI состоянием приложения
 */

import { create } from 'zustand';

export type ActiveInstrument = 'oscilloscope' | 'multimeter';

export interface UIStore {
  // --- СОСТОЯНИЕ ---
  activeInstrument: ActiveInstrument;
  isPanelOpen: boolean;
  selectedComponent: string | null;
  sidebarOpen: boolean;

  // --- ДЕЙСТВИЯ ---
  setActiveInstrument: (instrument: ActiveInstrument) => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  selectComponent: (componentId: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // === НАЧАЛЬНОЕ СОСТОЯНИЕ ===
  activeInstrument: 'oscilloscope',
  isPanelOpen: true,
  selectedComponent: null,
  sidebarOpen: true,

  // === ДЕЙСТВИЯ ===

  /**
   * Установить активный инструмент
   */
  setActiveInstrument: (instrument: ActiveInstrument) => {
    set({ activeInstrument: instrument });
  },

  /**
   * Переключить видимость панели инструментов
   */
  togglePanel: () => {
    set((state) => ({
      isPanelOpen: !state.isPanelOpen,
    }));
  },

  /**
   * Установить видимость панели явно
   */
  setPanelOpen: (open: boolean) => {
    set({ isPanelOpen: open });
  },

  /**
   * Выбрать компонент для отображения подробиций
   */
  selectComponent: (componentId: string | null) => {
    set({ selectedComponent: componentId });
  },

  /**
   * Переключить видимость боковой панели
   */
  toggleSidebar: () => {
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    }));
  },

  /**
   * Установить видимость боковой панели явно
   */
  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },
}));
