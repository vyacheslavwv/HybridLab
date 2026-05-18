import React from 'react';
import { useSimulationStore } from '../../application/stores/simulationStore';
import { API_BASE_URL } from '../../infrastructure/config/api';

const MODE_NAMES: Record<string, string> = {
  Hybrid: 'Параллельный', Series: 'Последовательный', EV: 'Электрический', Charging: 'Зарядка',
};

function ArcGauge({ value, max, color, size = 72 }: { value: number; max: number; color: string; size?: number }) {
  const r = size * 0.34, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r, arc = circ * 0.75;
  const fill = arc * Math.min(Math.max(value / max, 0), 1);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3"
        strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
  <div className="flex justify-between items-center py-1.5">
    <span className="text-sm" style={{ color: 'var(--muted)' }}>{label}</span>
    <span className="text-sm font-semibold" style={{ color: color ?? 'var(--text)' }}>{value}</span>
    </div>
  );
}

function AnimBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 rounded bg-white/5 mt-2 overflow-hidden">
      <div style={{ height: '100%', background: color, width: `${Math.min(value, 100)}%`, transition: 'width 0.4s ease' }} />
    </div>
  );
}

const StatisticsPanel: React.FC = () => {
  const { simulationState: s } = useSimulationStore();
  const { batterySoc, batteryVoltage, engineRpm, motorRpm, throttle, mode, waveformData } = s;
  const socColor = batterySoc > 60 ? 'var(--emerald)' : batterySoc > 30 ? 'var(--amber)' : 'var(--rose)';

  const downloadExcel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/download`);
      if (!response.ok) throw new Error('Failed to download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'metrics_log.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Ошибка при скачивании файла');
    }
  };

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, paddingBottom: 14 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div className="glass-static rounded-lg p-5">
      <div className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Статистика</div>

      {/* Battery with arc */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: 14 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ArcGauge value={batterySoc} max={100} color={socColor} size={68} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span className="jb" style={{ fontSize: 11, fontWeight: 700, color: socColor, lineHeight: 1 }}>
              {batterySoc.toFixed(0)}%
            </span>
          </div>
        </div>
        <div style={{ flex: 1, paddingTop: 4 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Батарея</div>
          <Row label="SOC"        value={`${batterySoc.toFixed(1)}%`}      color={socColor} />
          <Row label="Напряжение" value={`${batteryVoltage.toFixed(1)} V`} color="var(--amber)" />
          <AnimBar value={batterySoc} color={socColor} />
        </div>
      </div>

      {section('Электромотор', <>
        <Row label="Об/мин"   value={motorRpm.toFixed(0)}              color="var(--indigo)" />
        <Row label="Дроссель" value={`${(throttle*100).toFixed(0)}%`} color="var(--violet)" />
        <AnimBar value={(motorRpm / 4000) * 100} color="var(--indigo)" />
      </>)}

      {section('ДВС', <>
        <Row label="Об/мин"   value={engineRpm.toFixed(0)}             color="var(--amber)" />
        <Row label="Дроссель" value={`${(throttle*100).toFixed(0)}%`} color="var(--amber)" />
        <AnimBar value={(engineRpm / 4000) * 100} color="var(--amber)" />
      </>)}

      {section('Режим', <>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--indigo)', marginBottom: 2 }}>{MODE_NAMES[mode] ?? mode}</div>
      </>)}

      {section('Осциллограф', <>
        <Row label="Сэмплы"  value={String(waveformData.length)} color="var(--emerald)" />
        <Row label="Буфер"   value="512 pts" />
        <Row label="Частота" value="60 Hz" />
      </>)}

      {/* Download Excel Button */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, paddingBottom: 14 }}>
        <button
          onClick={downloadExcel}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.08) 100%)',
            border: '1px solid rgba(34,197,94,0.25)',
            color: 'var(--emerald)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'rgba(34,197,94,0.25)';
            el.style.borderColor = 'rgba(34,197,94,0.4)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.08) 100%)';
            el.style.borderColor = 'rgba(34,197,94,0.25)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Скачать Excel
        </button>
      </div>
    </div>
  );
};

export default StatisticsPanel;
