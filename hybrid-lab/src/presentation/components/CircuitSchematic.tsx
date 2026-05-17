/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { useEnergyFlow } from '../../application/hooks/useEnergyFlow';

// SVG ViewBox dimensions
const VB_W = 700;
const VB_H = 280;

interface RectNode {
  cx: number; cy: number; w: number; h: number;
  label: string; sub: string; color: string;
}
interface CircleNode {
  cx: number; cy: number; r: number;
  label: string; sub: string; color: string;
}

const RECTS: Record<string, RectNode> = {
  battery:   { cx: 65,  cy: 90,  w: 90, h: 60, label: 'БАТАРЕЯ',  sub: '144V', color: '#0ea5e9' },
  inverter:  { cx: 215, cy: 90,  w: 70, h: 50, label: 'ИНВЕРТОР', sub: '',     color: '#94a3b8' },
  wheels:    { cx: 530, cy: 90,  w: 70, h: 50, label: 'КОЛЕСА',   sub: '',     color: '#94a3b8' },
  ice:       { cx: 65,  cy: 210, w: 90, h: 50, label: 'ДВС',      sub: 'ICE',  color: '#f59e0b' },
  generator: { cx: 215, cy: 210, w: 70, h: 50, label: 'ГЕНЕРАТ.', sub: '',     color: '#a78bfa' },
};

const CIRCLES: Record<string, CircleNode> = {
  motor: { cx: 370, cy: 90, r: 42, label: 'МОТОР', sub: 'AC', color: '#10b981' },
};

/**
 * Test point positions (SVG coords) — exported for DraggableProbe proximity detection.
 */
export const TEST_POINT_COORDS: Record<string, { x: number; y: number; label: string }> = {
  battery:   { x: 110, y: 90,  label: 'BATT' },
  motor:     { x: 328, y: 90,  label: 'MOTOR' },
  engine:    { x: 110, y: 210, label: 'ICE' },
  generator: { x: 180, y: 210, label: 'GEN' },
};

const TP_COLORS: Record<string, string> = {
  battery:   '#0ea5e9',
  motor:     '#10b981',
  engine:    '#f59e0b',
  generator: '#a78bfa',
};

export interface CircuitSchematicProps {
  connectedTestPoint: string | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}

/**
 * CircuitSchematic — SVG diagram of the hybrid powertrain.
 * Energy flow paths are animated based on useEnergyFlow() state.
 * Children (DraggableProbe) are rendered as absolutely positioned overlays.
 */
const CircuitSchematic: React.FC<CircuitSchematicProps> = ({
  connectedTestPoint,
  containerRef,
  children,
}) => {
  const ef = useEnergyFlow();

  // Move dashes at 80 SVG units/second
  const dashOffset = -(ef.animationT * 80) % 12;

  const flowPath = (d: string, activity: number, color: string, reversed = false) => {
    if (activity < 0.01) {
      return <path d={d} stroke="#3f3f46" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.35" />;
    }
    const offset = reversed ? dashOffset + 12 : dashOffset;
    return (
      <path
        d={d}
        stroke={color}
        strokeWidth={2 + activity * 1.5}
        strokeDasharray="8 4"
        strokeDashoffset={offset}
        fill="none"
        opacity={0.4 + activity * 0.6}
        style={{ transition: 'opacity 0.4s, stroke-width 0.4s' }}
      />
    );
  };

  const rectNode = (key: string, n: RectNode, highlighted: boolean) => (
    <g key={key}>
      <rect
        x={n.cx - n.w / 2} y={n.cy - n.h / 2} width={n.w} height={n.h}
        fill="#18181b"
        stroke={highlighted ? n.color : '#52525b'}
        strokeWidth={highlighted ? 2 : 1}
        rx="4"
      />
      <text x={n.cx} y={n.cy - (n.sub ? 7 : 3)} textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="monospace" fontWeight="bold">
        {n.label}
      </text>
      {n.sub && (
        <text x={n.cx} y={n.cy + 9} textAnchor="middle" fill={n.color} fontSize="8" fontFamily="monospace">
          {n.sub}
        </text>
      )}
    </g>
  );

  const circleNode = (key: string, n: CircleNode, highlighted: boolean) => (
    <g key={key}>
      <circle cx={n.cx} cy={n.cy} r={n.r} fill="#18181b" stroke={highlighted ? n.color : '#52525b'} strokeWidth={highlighted ? 2 : 1} />
      <text x={n.cx} y={n.cy - 6} textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="monospace" fontWeight="bold">
        {n.label}
      </text>
      {n.sub && (
        <text x={n.cx} y={n.cy + 9} textAnchor="middle" fill={n.color} fontSize="8" fontFamily="monospace">
          {n.sub}
        </text>
      )}
    </g>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full block"
      >
        {/* ── Energy flow paths ── */}
        {flowPath('M 110 90 L 180 90',               ef.batteryToMotor,      '#0ea5e9')}
        {flowPath('M 250 90 L 328 90',               ef.batteryToMotor,      '#0ea5e9')}
        {flowPath('M 412 90 L 495 90',               ef.motorToWheels,       '#10b981')}
        {flowPath('M 495 90 L 412 90',               ef.wheelsToMotor,       '#22d3ee', true)}
        {flowPath('M 110 210 L 180 210',             ef.iceToGenerator,      '#f59e0b')}
        {flowPath('M 215 185 L 215 140 L 65 140 L 65 120', ef.generatorToBattery, '#a78bfa', true)}

        {/* ── Component nodes ── */}
        {Object.entries(RECTS).map(([k, n]) =>
          rectNode(k, n, connectedTestPoint === k || connectedTestPoint === (k === 'ice' ? 'engine' : k))
        )}
        {Object.entries(CIRCLES).map(([k, n]) =>
          circleNode(k, n, connectedTestPoint === k)
        )}

        {/* ── Test point markers ── */}
        {Object.entries(TEST_POINT_COORDS).map(([key, pt]) => {
          const connected = connectedTestPoint === key;
          const color = TP_COLORS[key] ?? '#64748b';
          return (
            <g key={key}>
              <circle cx={pt.x} cy={pt.y} r={connected ? 7 : 5} fill={connected ? color : '#27272a'} stroke={color} strokeWidth="1.5" />
              <text x={pt.x} y={pt.y + 18} textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="monospace">
                {pt.label}
              </text>
            </g>
          );
        })}

        {/* ── Battery direction indicator ── */}
        {ef.batteryDirection !== 'idle' && (
          <text x={65} y={58} textAnchor="middle" fill={ef.batteryDirection === 'charging' ? '#10b981' : '#ef4444'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            {ef.batteryDirection === 'charging' ? 'CHG' : 'DIS'}
          </text>
        )}
      </svg>

      {children}
    </div>
  );
};

export default CircuitSchematic;
