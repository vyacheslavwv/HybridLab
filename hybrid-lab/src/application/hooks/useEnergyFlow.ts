import { useSimulationStore } from '../stores/simulationStore';
import type { EnergyFlowState } from '../../domain/types/Simulation';

/**
 * useEnergyFlow — derives active energy path intensities from simulation state.
 * Consumed by CircuitSchematic to animate SVG energy flow paths.
 */
export function useEnergyFlow(): EnergyFlowState {
  const { simulationState } = useSimulationStore();
  const { mode, throttle, isRunning, t, batterySoc } = simulationState;

  const activity = isRunning ? throttle : 0;

  switch (mode) {
    case 'EV':
      return {
        batteryToMotor: activity,
        iceToGenerator: 0,
        generatorToBattery: 0,
        motorToWheels: activity,
        wheelsToMotor: 0,
        batteryDirection: activity > 0.05 ? 'discharging' : 'idle',
        animationT: t,
      };

    case 'Series':
      return {
        batteryToMotor: activity * 0.5,
        iceToGenerator: isRunning ? Math.max(0.3, throttle * 0.9) : 0,
        generatorToBattery: isRunning && batterySoc < 80 ? 0.8 : 0,
        motorToWheels: activity,
        wheelsToMotor: 0,
        batteryDirection: batterySoc < 80 ? 'charging' : 'discharging',
        animationT: t,
      };

    case 'Charging':
      return {
        batteryToMotor: 0,
        iceToGenerator: isRunning ? 0.9 : 0,
        generatorToBattery: isRunning ? 0.9 : 0,
        motorToWheels: 0,
        wheelsToMotor: 0,
        batteryDirection: 'charging',
        animationT: t,
      };

    default: // 'Hybrid' — parallel mode
      return {
        batteryToMotor: activity * 0.5,
        iceToGenerator: 0,
        generatorToBattery: 0,
        motorToWheels: activity,
        wheelsToMotor: throttle < 0.08 && isRunning ? 0.5 : 0,
        batteryDirection: activity > 0.6 ? 'discharging' : activity < 0.08 && isRunning ? 'charging' : 'idle',
        animationT: t,
      };
  }
}
