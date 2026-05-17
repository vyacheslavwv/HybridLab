/**
 * Конфигурация учебных модулей для Hybrid Lab
 */

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon?: string;
}

export const MODULES: Module[] = [
  {
    id: 'ice',
    title: 'Устройство ДВС',
    description: 'Макет двигателя внутреннего сгорания и его роль в гибридной схеме.',
    duration: '15–20 мин',
  },
  {
    id: 'electric',
    title: 'Электрическая схема',
    description: 'Связь ДВС, генератора, аккумулятора и тягового мотора.',
    duration: '20–25 мин',
  },
  {
    id: 'modes',
    title: 'Симулятор режимов',
    description: 'Режимы движения гибридного автомобиля и распределение энергии.',
    duration: '20–30 мин',
  },
];

/**
 * Получить модуль по ID
 */
export function getModuleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}

/**
 * Получить все модули
 */
export function getAllModules(): Module[] {
  return MODULES;
}
