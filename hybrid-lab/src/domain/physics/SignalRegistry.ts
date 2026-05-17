/**
 * Signal Registry — extensible registry pattern for test point signals.
 * Each entry defines label, color, unit, and a calculate() function.
 * Replaces the if/else chain previously used in the simulation store.
 */

export interface SignalRegistryEntry {
  label: string;
  /** Hex color for instrument display and oscilloscope trace */
  color: string;
  unit: string;
  calculate: (t: number, throttle: number) => number;
}

export const SIGNAL_REGISTRY: Record<string, SignalRegistryEntry> = {
  battery: {
    label: 'BATTERY',
    color: '#0ea5e9',
    unit: 'V',
    calculate: (t: number, throttle: number) => {
      const baseVoltage = 144;
      const sine = Math.sin(t * 0.5 * Math.PI * 2);
      const noise = (Math.random() - 0.5) * 0.05;
      return baseVoltage * (throttle || 0.5) + sine * 2 + noise;
    },
  },
  motor: {
    label: 'MOTOR',
    color: '#10b981',
    unit: 'V',
    calculate: (t: number, throttle: number) => {
      const sine = Math.sin(t * 2 * Math.PI * 2);
      const noise = (Math.random() - 0.5) * 0.03;
      return 120 * Math.sin(t) * (throttle || 0.5) + sine * 1.5 + noise;
    },
  },
  engine: {
    label: 'ICE',
    color: '#f59e0b',
    unit: 'V',
    calculate: (t: number) => {
      return Math.max(0, 12 + Math.sin(t * 3) * 5);
    },
  },
  generator: {
    label: 'GENERATOR',
    color: '#a78bfa',
    unit: 'V',
    calculate: (t: number, throttle: number) => {
      const sine = Math.sin(t * 1.5 * Math.PI * 2);
      return 48 * (throttle || 0.5) + sine * 3 + (Math.random() - 0.5) * 0.08;
    },
  },
};
