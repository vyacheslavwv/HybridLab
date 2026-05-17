import React from 'react';
import { SIGNAL_REGISTRY } from '../../domain/physics/SignalRegistry';

export interface MultimeterProps {
  connectedPoint: string | null;
  simulationTime: number;
  throttle: number;
}

const POINT_COLORS: Record<string, string> = {
  battery:   'var(--cyan)',
  motor:     'var(--emerald)',
  engine:    'var(--amber)',
  generator: 'var(--violet)',
};

const MultimeterDisplay: React.FC<MultimeterProps> = ({
  connectedPoint,
  simulationTime,
  throttle,
}) => {
  const entry = connectedPoint ? SIGNAL_REGISTRY[connectedPoint] : null;
  const displayValue = entry ? entry.calculate(simulationTime, throttle) : 0;
  const accentColor = connectedPoint ? (POINT_COLORS[connectedPoint] ?? 'var(--indigo)') : 'var(--subtle)';

  return (
    <div className="glass-static rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>
          Мультиметр
        </span>
        <span style={{
          fontSize: 9, padding: '2px 7px', borderRadius: 5,
          background: connectedPoint ? 'var(--e-dim)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${connectedPoint ? 'rgba(52,211,153,0.22)' : 'rgba(255,255,255,0.08)'}`,
          color: connectedPoint ? 'var(--emerald)' : 'var(--subtle)',
          fontFamily: 'monospace',
        }}>
          {connectedPoint ? 'ACTIVE' : 'IDLE'}
        </span>
      </div>

      {/* Screen */}
      <div className="rounded-lg p-4 bg-black/40 mb-4 flex flex-col justify-center"
        style={{
          border: `1px solid ${connectedPoint ? accentColor.replace('var(', 'rgba(').replace(')', ',0.2)') : 'rgba(255,255,255,0.06)'}`,
          boxShadow: connectedPoint ? `inset 0 0 24px rgba(0,0,0,0.6), 0 0 12px ${accentColor.replace('var(', 'rgba(').replace(')', ',0.06)')}` : 'inset 0 0 20px rgba(0,0,0,0.5)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
          minHeight: 100,
        }}>
        {/* Value */}
        <div className="jb" style={{
          fontSize: 42, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1,
          color: connectedPoint ? accentColor : 'var(--subtle)',
          transition: 'color 0.3s',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {displayValue.toFixed(3)}
        </div>

        {/* Label row */}
        <div className="flex items-center gap-2 mt-2">
          {entry ? (
            <>
              <span className="jb text-sm font-semibold" style={{ color: accentColor }}>{entry.unit}</span>
              <span style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.1)' }} />
              <span className="jb text-xs" style={{ color: 'var(--muted)' }}>DC · {entry.label}</span>
            </>
          ) : (
            <span className="jb text-xs" style={{ color: 'var(--subtle)', letterSpacing: '0.1em' }}>
              — — — НЕТ СИГНАЛА — — —
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {['ПЕРЕМ/ПОСТ', 'ДИАПАЗОН'].map(label => (
          <button
            key={label}
            disabled
            style={{
              padding: '9px 12px',
              borderRadius: 12,
              background: 'var(--s1)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--muted)',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              cursor: 'not-allowed',
              transition: 'all 0.15s ease',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Probe status */}
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0`} style={{
          background: connectedPoint ? accentColor : 'var(--subtle)',
          boxShadow: connectedPoint ? `0 0 6px ${accentColor.replace('var(', 'rgba(').replace(')', ',0.5)')}` : 'none',
          transition: 'all 0.3s',
        }} />
        <span className="jb text-xs font-semibold" style={{ color: connectedPoint ? accentColor : 'var(--muted)', letterSpacing: '0.06em', transition: 'color 0.3s' }}>
          {connectedPoint ? `ПОДКЛЮЧЁН · ${connectedPoint.toUpperCase()}` : 'ЩУП НЕ ПОДКЛЮЧЁН'}
        </span>
      </div>
    </div>
  );
};

export default MultimeterDisplay;
