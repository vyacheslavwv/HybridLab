import React from 'react';
import { useSimulationStore } from '../../application/stores/simulationStore';
import type { HybridModeType } from '../../domain/types/Simulation';

const MODES: { key: HybridModeType; label: string }[] = [
  { key: 'Hybrid', label: 'Парал.' },
  { key: 'Series', label: 'Послед.' },
  { key: 'EV',     label: 'ЭВ' },
];

const ControlPanel: React.FC = () => {
  const { simulationState, setThrottle, startSimulation, pauseSimulation, setHybridMode } = useSimulationStore();
  const { throttle, isRunning, mode } = simulationState;
  const pct = throttle * 100;

  return (
    <div className="glass-static rounded-lg">
      <div className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Управление</div>

      {/* Throttle */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm" style={{ color: 'var(--text)' }}>Дроссель</span>
          <span className="text-sm font-semibold text-indigo-300">{pct.toFixed(0)}%</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01" value={throttle}
          onChange={e => setThrottle(parseFloat(e.target.value))}
          style={{
            width: '100%', height: 4, borderRadius: 2, appearance: 'none', cursor: 'pointer',
            background: `linear-gradient(to right, var(--indigo) ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
          }}
        />
      </div>

      {/* Start / Stop */}
      <button
        onClick={() => isRunning ? pauseSimulation() : startSimulation()}
        style={{
          width: '100%', padding: '10px 0', borderRadius: 12,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.15s',
          background: isRunning ? 'var(--r-dim)' : 'var(--e-dim)',
          border: `1px solid ${isRunning ? 'rgba(248,113,113,0.28)' : 'rgba(52,211,153,0.28)'}`,
          color: isRunning ? 'var(--rose)' : 'var(--emerald)',
          marginBottom: 16,
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
        onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
      >
        {isRunning ? '■  Стоп' : '▶  Старт'}
      </button>

      {/* Mode */}
      <div>
        <div className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Режим гибрида</div>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map(({ key, label }) => {
            const active = mode === key;
            return (
              <button key={key} onClick={() => setHybridMode(key)} className={`py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 ${active ? 'bg-indigo-600 border border-indigo-300 text-white' : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/6 hover:text-white'}`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/6">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isRunning ? 'bg-emerald-500' : 'bg-gray-500'}`} />
        <span className={`text-xs ${isRunning ? 'text-emerald-400' : 'text-gray-400'} font-semibold`}>{isRunning ? 'RUNNING' : 'STOPPED'}</span>
      </div>
    </div>
  );
};

export default ControlPanel;
