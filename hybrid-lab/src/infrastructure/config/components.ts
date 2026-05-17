/**
 * Конфигурация компонентов гибридной системы для динамической панели управления
 */

export interface ComponentConfig {
  name: string;
  icon: string;
  color: string;
  specs: Record<string, string | number>;
}

export const COMPONENT_CONFIG: Record<string, ComponentConfig> = {
  battery: {
    name: 'Батарея',
    icon: '🔋',
    color: 'text-cyan-400',
    specs: {
      'Напряжение': '144 V',
      'Ёмкость': '50 кWh',
      'Макс ток': '100 A',
      'Тип': 'Li-Po',
    },
  },
  ice: {
    name: 'ДВС (ICE)',
    icon: '⚙️',
    color: 'text-orange-400',
    specs: {
      'Макс об/мин': '5000',
      'КПД': '35%',
      'Тип': '4-цилиндровый',
      'Объём': '2.0L',
    },
  },
  mg1: {
    name: 'МГ1 (Motor/Gen)',
    icon: '⚡',
    color: 'text-green-400',
    specs: {
      'Макс об/мин': '4000',
      'КПД': '92%',
      'Тип': 'Синхронный мотор',
      'Мощность': '50 kW',
    },
  },
  mg2: {
    name: 'МГ2 (Motor/Gen)',
    icon: '⚡',
    color: 'text-blue-400',
    specs: {
      'Макс об/мин': '3500',
      'КПД': '92%',
      'Тип': 'Синхронный мотор',
      'Мощность': '40 kW',
    },
  },
};

export function getComponentConfig(componentId: string): ComponentConfig | null {
  return COMPONENT_CONFIG[componentId] || null;
}
