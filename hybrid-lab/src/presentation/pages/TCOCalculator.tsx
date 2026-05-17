import React, { useState, useRef, useEffect, useCallback } from 'react';
import { drawTCOChart, type TCOBarData } from '../instruments/canvas/tcoChart';

interface TCOParams {
  annualKm: number;
  fuelPricePerL: number;
  electricityPricePerKwh: number;
  years: number;
}

interface VehicleProfile {
  name: string;
  shortLabel: string;
  purchasePrice: number;
  annualMaintenanceBase: number;
  fuelConsumptionPer100km: number;
  electricConsumptionPer100km: number;
  color: string;
  cssVar: string;
}

const VEHICLE_PROFILES: VehicleProfile[] = [
  {
    name: 'ДВС',
    shortLabel: 'ICE',
    purchasePrice: 1_500_000,
    annualMaintenanceBase: 80_000,
    fuelConsumptionPer100km: 9,
    electricConsumptionPer100km: 0,
    color: '#f59e0b',
    cssVar: 'var(--amber)',
  },
  {
    name: 'Гибрид',
    shortLabel: 'HEV',
    purchasePrice: 2_000_000,
    annualMaintenanceBase: 70_000,
    fuelConsumptionPer100km: 5,
    electricConsumptionPer100km: 1.5,
    color: '#34d399',
    cssVar: 'var(--emerald)',
  },
  {
    name: 'Электро',
    shortLabel: 'EV',
    purchasePrice: 2_800_000,
    annualMaintenanceBase: 40_000,
    fuelConsumptionPer100km: 0,
    electricConsumptionPer100km: 17,
    color: '#22d3ee',
    cssVar: 'var(--cyan)',
  },
];

function calculateTCO(profile: VehicleProfile, params: TCOParams) {
  const fuelCostPerYear =
    (params.annualKm / 100) * profile.fuelConsumptionPer100km * params.fuelPricePerL;
  const electricCostPerYear =
    (params.annualKm / 100) *
    profile.electricConsumptionPer100km *
    params.electricityPricePerKwh;
  const maintenanceTotal = profile.annualMaintenanceBase * params.years;
  const fuelTotal = fuelCostPerYear * params.years;
  const electricTotal = electricCostPerYear * params.years;
  const total = profile.purchasePrice + fuelTotal + electricTotal + maintenanceTotal;
  return {
    total,
    breakdown: {
      purchase: profile.purchasePrice,
      fuel: fuelTotal + electricTotal,
      maintenance: maintenanceTotal,
    },
  };
}

// ── Slider ────────────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{label}</span>
        <span className="jb" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
          {value.toLocaleString('ru-RU')} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%', height: 3, borderRadius: 3, cursor: 'pointer',
          background: `linear-gradient(to right, var(--indigo) 0%, var(--indigo) ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--subtle)', marginTop: 4 }}>
        <span className="jb">{min.toLocaleString('ru-RU')}</span>
        <span className="jb">{max.toLocaleString('ru-RU')}</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

const TCOCalculator: React.FC = () => {
  const [params, setParams] = useState<TCOParams>({
    annualKm: 20_000,
    fuelPricePerL: 55,
    electricityPricePerKwh: 7,
    years: 5,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lastWidthRef = useRef(0);

  const redrawWithWidth = useCallback((w: number) => {
    const canvas = canvasRef.current;
    if (!canvas || w <= 0) return;
    lastWidthRef.current = w;
    const h = 280;
    canvas.width = Math.round(w * window.devicePixelRatio);
    canvas.height = Math.round(h * window.devicePixelRatio);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const bars: TCOBarData[] = VEHICLE_PROFILES.map((profile) => {
      const result = calculateTCO(profile, params);
      return { label: profile.name, value: result.total, color: profile.color, breakdown: result.breakdown };
    });
    drawTCOChart(ctx, bars, w, h);
  }, [params]);

  // Redraw when params change using last known width
  useEffect(() => {
    if (lastWidthRef.current > 0) redrawWithWidth(lastWidthRef.current);
  }, [redrawWithWidth]);

  // ResizeObserver uses contentRect.width (excludes padding) to avoid infinite loop
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width ?? 0);
      if (w > 0) redrawWithWidth(w);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [redrawWithWidth]);

  const results = VEHICLE_PROFILES.map((p) => ({ profile: p, ...calculateTCO(p, params) }));
  const minTotal = Math.min(...results.map((r) => r.total));

  return (
    <div className="in-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Сравните совокупную стоимость владения ДВС, гибридом и электромобилем за выбранный период.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, alignItems: 'stretch' }}>

        {/* ── Left: inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div className="glass-static" style={{ borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 20 }}>
              Параметры
            </div>
            <Slider label="Годовой пробег"    value={params.annualKm}               min={5_000} max={80_000} step={1_000} unit="км/год"    onChange={(v) => setParams((p) => ({ ...p, annualKm: v }))} />
            <Slider label="Цена топлива"       value={params.fuelPricePerL}           min={40}    max={120}    step={1}     unit="руб/л"     onChange={(v) => setParams((p) => ({ ...p, fuelPricePerL: v }))} />
            <Slider label="Цена электричества" value={params.electricityPricePerKwh}  min={3}     max={20}     step={0.5}   unit="руб/кВт·ч" onChange={(v) => setParams((p) => ({ ...p, electricityPricePerKwh: v }))} />
            <Slider label="Срок владения"      value={params.years}                  min={1}     max={15}     step={1}     unit="лет"       onChange={(v) => setParams((p) => ({ ...p, years: v }))} />
          </div>

          {/* Итог + Расшифровка — единая карточка, растягивается до конца колонки */}
          <div className="glass-static" style={{ borderRadius: 16, padding: 22, flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 16 }}>
              Итог за {params.years} {params.years === 1 ? 'год' : params.years < 5 ? 'года' : 'лет'}
            </div>

            {/* Totals row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {results.map((r) => (
                <div key={r.profile.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: r.profile.color }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{r.profile.name}</span>
                  {r.total === minTotal && (
                    <span className="tag tag-e" style={{ fontSize: 9 }}>выгоднее</span>
                  )}
                  <span className="jb" style={{ fontSize: 13, fontWeight: 700, color: r.profile.cssVar }}>
                    {(r.total / 1_000_000).toFixed(2)} М₽
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--b1)', marginBottom: 16 }} />

            {/* Breakdown per vehicle */}
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 14 }}>
              Расшифровка
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {results.map((r) => (
                <div key={r.profile.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.profile.color, flexShrink: 0 }} />
                    <span className="jb" style={{ fontSize: 10, fontWeight: 700, color: r.profile.cssVar }}>{r.profile.shortLabel}</span>
                  </div>
                  {[
                    { label: 'Покупка', val: r.breakdown.purchase },
                    { label: 'Топливо', val: r.breakdown.fuel },
                    { label: 'ТО',      val: r.breakdown.maintenance },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--b1)' }}>
                      <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{item.label}</span>
                      <span className="jb" style={{ fontSize: 10.5, color: 'var(--text)' }}>{(item.val / 1e6).toFixed(2)}M</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: chart ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div ref={containerRef} className="glass-static" style={{ borderRadius: 16, padding: '20px 16px 16px', flex: '0 0 auto', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />
          </div>

          {/* Vehicle legend cards — растягиваются до конца правой колонки */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, flex: 1, alignContent: 'start' }}>
            {VEHICLE_PROFILES.map((p) => {
              const r = calculateTCO(p, params);
              const isMin = r.total === minTotal;
              return (
                <div
                  key={p.name}
                  className="glass-static"
                  style={{
                    borderRadius: 14, padding: 18,
                    borderColor: isMin ? `${p.color}33` : undefined,
                    position: 'relative',
                  }}
                >
                  {isMin && (
                    <span style={{
                      position: 'absolute', top: 10, right: 10,
                      fontSize: 9, padding: '2px 6px', borderRadius: 5,
                      background: 'var(--e-dim)', border: '1px solid rgba(52,211,153,0.22)', color: 'var(--emerald)',
                    }}>★ выгоднее</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                    <span className="jb" style={{ fontSize: 13, fontWeight: 700, color: p.cssVar }}>{p.shortLabel}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.name}</span>
                  </div>
                  {[
                    { label: 'Покупка',    val: p.purchasePrice },
                    { label: 'Топливо',    val: r.breakdown.fuel },
                    { label: 'ТО',         val: r.breakdown.maintenance },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--b1)' }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{item.label}</span>
                      <span className="jb" style={{ fontSize: 11, color: 'var(--text)' }}>{(item.val / 1e6).toFixed(2)}M</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TCOCalculator;
