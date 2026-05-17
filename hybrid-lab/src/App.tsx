import React, { useState, useEffect, useRef } from 'react';
import { useSimulationStore } from './application/stores/simulationStore';
import CanvasOscilloscope from './presentation/components/Oscilloscope';
import ControlPanel from './presentation/components/ControlPanel';
import CircuitSchematic, { TEST_POINT_COORDS } from './presentation/components/CircuitSchematic';
import DraggableProbe from './presentation/components/DraggableProbe';
import MultimeterDisplay from './presentation/instruments/MultimeterDisplay';
import TCOCalculator from './presentation/pages/TCOCalculator';
import TopologyBuilder from './presentation/pages/TopologyBuilder';
import LiteraturePage from './presentation/pages/LiteraturePage';
import DiagnosticsPage from './presentation/pages/DiagnosticsPage';
import GlossaryPage from './presentation/pages/GlossaryPage';
import './index.css';
import './presentation/styles/globals.css';

type Page = 'dashboard' | 'simulator' | 'tco' | 'topology' | 'literature' | 'diagnostics' | 'glossary';

// ── Icons ────────────────────────────────────────────────────

const icons = {
  grid:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  circuit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1"/></svg>,
  calc:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>,
  nodes:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><line x1="7" y1="12" x2="17" y2="6"/><line x1="7" y1="12" x2="17" y2="18"/></svg>,
  book:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  wrench:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  list:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg>,
  arrow:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  back:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  check:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>,
};

const NAV: { id: Page; label: string; icon: React.ReactNode; soon?: boolean }[] = [
  { id: 'dashboard',   label: 'Главная',         icon: icons.grid },
  { id: 'simulator',   label: 'Симулятор',       icon: icons.circuit },
  { id: 'tco',         label: 'Калькулятор TCO', icon: icons.calc },
  { id: 'topology',    label: 'Топология',       icon: icons.nodes },
  { id: 'literature',  label: 'Учебники',        icon: icons.book },
  { id: 'diagnostics', label: 'Диагностика',     icon: icons.wrench },
  { id: 'glossary',    label: 'Глоссарий',       icon: icons.list },
];

// ── Arc Gauge ────────────────────────────────────────────────

function ArcGauge({ value, max, color, size = 80, sw = 3.5 }: {
  value: number; max: number; color: string; size?: number; sw?: number;
}) {
  const r    = size * 0.34;
  const cx   = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const arc  = circ * 0.75;
  const fill = arc * Math.min(Math.max(value / max, 0), 1);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgba(255,255,255,0.07)" strokeWidth={sw}
        strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
      />
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={sw}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

// ── Root App ─────────────────────────────────────────────────

export function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [moduleId, setModuleId] = useState<string | null>(null);
  const { simulationState, pauseSimulation } = useSimulationStore();

  useEffect(() => {
    if (!simulationState.isRunning) return;
    let id: number, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      useSimulationStore.getState().step(dt);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [simulationState.isRunning]);

  const go = (p: Page, m?: string) => { setPage(p); setModuleId(m ?? null); };
  const back = () => { pauseSimulation(); setPage('dashboard'); setModuleId(null); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)', position: 'relative' }}>

      {/* ── Gradient mesh ── */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 90% 55% at 12% -8%,  rgba(99,102,241,0.13) 0%, transparent 55%),
          radial-gradient(ellipse 60% 45% at 88% 108%, rgba(34,211,238,0.08) 0%, transparent 52%),
          radial-gradient(ellipse 40% 35% at 60% 60%,  rgba(129,140,248,0.04) 0%, transparent 60%)
        `,
      }} />

      {/* ── Sidebar ── */}
      <aside style={{
        width: 210, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'rgba(255,255,255,0.018)', borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        position: 'relative', zIndex: 2,
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Badge with bolt icon */}
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 1px rgba(129,140,248,0.35), 0 0 18px rgba(99,102,241,0.28), 0 4px 12px rgba(99,102,241,0.2)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Gloss overlay */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
                borderRadius: '10px 10px 0 0',
              }} />
              {/* Lightning bolt */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
                <path d="M13 2L4 13h7l-1 9 9-11h-7l1-9z" fill="white" fillOpacity="0.95" strokeWidth="0"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--text)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>Hybrid Lab</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1, letterSpacing: '0.02em' }}>v2 · 2026</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
          {NAV.map(item => {
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => go(item.id)}
                className={`nav-item ${active ? 'active' : ''}`}
                title={item.label}
              >
                <span style={{ opacity: active ? 1 : 0.65, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1, lineHeight: 1 }}>{item.label}</span>
                {active && (
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--indigo)', display: 'inline-block',
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Status pill */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '7px 10px',
          }}>
            <span className={simulationState.isRunning ? 'pulse-dot' : ''} style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: simulationState.isRunning ? 'var(--emerald)' : 'var(--subtle)',
              display: 'inline-block',
            }} />
            <span className="jb" style={{ fontSize: 10, color: simulationState.isRunning ? 'var(--emerald)' : 'var(--muted)' }}>
              {simulationState.isRunning ? 'SIM · RUNNING' : 'SIM · IDLE'}
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '32px 36px' }}>
          {page === 'dashboard'   && <DashboardPage go={go} />}
          {page === 'simulator'   && <SimulatorPage moduleId={moduleId} onBack={back} />}
          {page === 'tco'         && <Sub title="Калькулятор TCO" onBack={back}><TCOCalculator /></Sub>}
          {page === 'topology'    && <Sub title="Топология схемы" onBack={back}><TopologyBuilder /></Sub>}
          {page === 'literature'  && <Sub title="" onBack={back}><LiteraturePage /></Sub>}
          {page === 'diagnostics' && <Sub title="" onBack={back}><DiagnosticsPage /></Sub>}
          {page === 'glossary'    && <Sub title="" onBack={back}><GlossaryPage /></Sub>}
        </div>
      </main>
    </div>
  );
}

// ── Sub-page wrapper ─────────────────────────────────────────

function Sub({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--muted)', fontSize: 13, marginBottom: 24,
        transition: 'color 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
      >
        {icons.back} Главная
      </button>
      {title && <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, letterSpacing: '-0.02em' }}>{title}</h2>}
      {children}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────

const MODE_SHORT: Record<string, string> = { Hybrid: 'Парал.', Series: 'Послед.', EV: 'ЭВ', Charging: 'Заряд' };

function DashboardPage({ go }: { go: (p: Page, m?: string) => void }) {
  const [done] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hybridlab-completed') ?? '[]'); } catch { return []; }
  });
  const { simulationState: s } = useSimulationStore();
  const pct = Math.round((done.length / 5) * 100);
  const socColor = s.batterySoc > 60 ? 'var(--emerald)' : s.batterySoc > 30 ? 'var(--amber)' : 'var(--rose)';

  const MODULES = [
    { id: 'ice',      label: 'Устройство ДВС',     time: '15–20 мин' },
    { id: 'electric', label: 'Электрическая схема', time: '20–25 мин' },
    { id: 'modes',    label: 'Режимы движения',     time: '20–30 мин' },
  ];

  return (
    <div className="in-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Учебная платформа</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--subtle)', display: 'inline-block' }} />
          {s.isRunning && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--emerald)' }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} />
              Симуляция активна
            </span>
          )}
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 750, letterSpacing: '-0.035em', lineHeight: 1, color: '#fff', marginBottom: 8 }}>
          Hybrid Lab
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Гибридные электрические автомобили — интерактивный курс с симулятором
        </p>
      </div>

      {/* Live telemetry bar */}
      <div className="glass-static" style={{ borderRadius: 14, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 0 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', marginRight: 16, flexShrink: 0 }}>Телеметрия</span>
        {[
          { key: 'SOC',   val: `${s.batterySoc.toFixed(1)}%`,       color: socColor },
          { key: 'Мотор', val: `${s.motorRpm.toFixed(0)} об/мин`,   color: 'var(--indigo)' },
          { key: 'ДВС',   val: `${s.engineRpm.toFixed(0)} об/мин`,  color: 'var(--amber)' },
        ].map((t, i) => (
          <React.Fragment key={t.key}>
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.07)', marginRight: 16 }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginRight: 16 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.key}</span>
              <span className="jb" style={{ fontSize: 12, fontWeight: 600, color: t.color }}>{t.val}</span>
            </div>
          </React.Fragment>
        ))}
        <div style={{ flex: 1 }} />
        <span className="tag tag-i" style={{ fontSize: 10 }}>{MODE_SHORT[s.mode] ?? s.mode}</span>
      </div>

      {/* Bento grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>

        {/* Hero: Simulator — col 2 */}
        <div className="glass" style={{ gridColumn: 'span 2', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative waveform bg */}
          <svg aria-hidden style={{ position: 'absolute', right: -20, top: -10, opacity: 0.045, pointerEvents: 'none' }} width="340" height="180" viewBox="0 0 340 180">
            <path d="M0 90 C25 55,50 125,75 90 S125 55,150 90 S200 125,225 90 S275 55,300 90 S325 80,350 90" fill="none" stroke="var(--indigo)" strokeWidth="2"/>
            <path d="M0 115 C18 85,36 145,54 115 S90 85,108 115 S144 145,162 115 S198 85,216 115 S252 145,270 115 S306 85,340 115" fill="none" stroke="var(--emerald)" strokeWidth="1.5"/>
          </svg>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Интерактивный симулятор</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>Гибридный привод</h3>
            </div>
            <span className="tag tag-e">Активен</span>
          </div>

          <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 24 }}>
            Физическая модель гибридного автомобиля с осциллографом, мультиметром и переключением режимов.
          </p>

          <div style={{ marginTop: 'auto' }}>
            {MODULES.map((m, i) => {
              const completed = done.includes(m.id);
              return (
                <button key={m.id} onClick={() => go('simulator', m.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 10px', margin: '0 -10px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  background: 'none', border: 'none',
                  borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: 'rgba(255,255,255,0.06)',
                  cursor: 'pointer', textAlign: 'left', borderRadius: 10,
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span className="jb" style={{ fontSize: 10, color: 'var(--subtle)', width: 16, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: completed ? 'var(--emerald)' : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {completed && <span style={{ color: '#04050a', display: 'flex' }}>{icons.check}</span>}
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>{m.label}</span>
                  <span className="jb" style={{ fontSize: 11, color: 'var(--muted)' }}>{m.time}</span>
                  <span style={{ color: 'var(--muted)', display: 'flex' }}>{icons.arrow}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress — col 1 */}
        <div className="glass-static" style={{ borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 20 }}>Прогресс курса</div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <ArcGauge value={done.length} max={5} color="var(--indigo)" size={124} sw={4} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="jb" style={{ fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{done.length}</span>
                <span className="jb" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>/5</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>модулей завершено</p>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Выполнено</span>
              <span className="jb" style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo)' }}>{pct}%</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: 'var(--indigo)', width: `${pct}%`, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Баллы</span>
              <span className="jb" style={{ fontSize: 11, color: 'var(--muted)' }}>{done.length * 100} / 500</span>
            </div>
          </div>
        </div>

        {/* TCO */}
        <BentoCard onClick={() => go('tco')} accent="var(--indigo)">
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>Финансовый анализ</div>
          <h3 style={{ fontSize: 18, fontWeight: 650, color: '#fff', letterSpacing: '-0.015em', marginBottom: 10 }}>Калькулятор TCO</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, flex: 1 }}>
            Сравните полную стоимость владения ДВС, гибридом и электромобилем за выбранный срок.
          </p>
          <CardLink>Открыть калькулятор</CardLink>
        </BentoCard>

        {/* Topology — col 2 */}
        <BentoCard onClick={() => go('topology')} col={2} accent="var(--cyan)">
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>Практическое задание</div>
          <h3 style={{ fontSize: 18, fontWeight: 650, color: '#fff', letterSpacing: '-0.015em', marginBottom: 10 }}>Топология схемы</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, flex: 1 }}>
            Соберите схему последовательного гибридного привода из компонентов. Drag-and-drop с мгновенной проверкой.
          </p>
          <CardLink color="var(--cyan)">Открыть задание</CardLink>
        </BentoCard>

        {/* Glossary */}
        <BentoCard onClick={() => go('glossary')} accent="var(--violet)">
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>Справочник</div>
          <h3 style={{ fontSize: 18, fontWeight: 650, color: '#fff', letterSpacing: '-0.015em', marginBottom: 10 }}>Глоссарий</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, flex: 1 }}>
            15 терминов и аббревиатур гибридных систем с быстрым поиском.
          </p>
          <CardLink color="var(--violet)">Открыть</CardLink>
        </BentoCard>

        {/* Literature */}
        <StubCard onClick={() => go('literature')} label="Библиотека" title="Учебные материалы" desc="Рекомендованная литература и учебные пособия." />

        {/* Diagnostics */}
        <StubCard onClick={() => go('diagnostics')} label="OBD-II" title="Диагностика" desc="Чтение кодов ошибок и живых данных через CAN-шину." />

      </div>
    </div>
  );
}

// ── Bento helpers ─────────────────────────────────────────────

function BentoCard({ onClick, col = 1, accent, children }: {
  onClick: () => void; col?: number; accent?: string; children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} style={{
      gridColumn: `span ${col}`,
      background: hov ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.025)',
      border: `1px solid ${hov ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 20, padding: 24, cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.18s ease',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </div>
  );
}

function CardLink({ children, color = 'var(--indigo)' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color, marginTop: 18 }}>
      {children} {icons.arrow}
    </div>
  );
}

function StubCard({ onClick, label, title, desc }: { onClick: () => void; label: string; title: string; desc: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} style={{
      background: hov ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.012)',
      border: `1px dashed ${hov ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 20, padding: 24, cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.18s ease',
    }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
        <span style={{
          fontSize: 9, padding: '2px 7px', borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.08)', color: 'var(--muted)',
          fontFamily: 'monospace',
        }}>soon</span>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: hov ? 'var(--text)' : 'var(--subtle)', marginBottom: 8, transition: 'color 0.15s', letterSpacing: '-0.015em' }}>{title}</h3>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

// ── Simulator Page ────────────────────────────────────────────

const MODULE_TITLES: Record<string, string> = {
  ice: 'Устройство ДВС', electric: 'Электрическая схема', modes: 'Симулятор режимов',
};

function SimulatorPage({ moduleId, onBack }: { moduleId: string | null; onBack: () => void }) {
  const store = useSimulationStore();
  const { simulationState: s } = store;
  const { batterySoc, motorRpm, engineRpm, throttle, connectedTestPoint, waveformData, t } = s;
  const schematicRef = useRef<HTMLDivElement>(null);
  const title = MODULE_TITLES[moduleId ?? ''] ?? 'Симулятор';
  const socColor = batterySoc > 60 ? 'var(--emerald)' : batterySoc > 30 ? 'var(--amber)' : 'var(--rose)';

  const kpis = [
    { label: 'SOC батареи', val: batterySoc.toFixed(1), unit: '%',      raw: batterySoc,      max: 100,  color: socColor },
    { label: 'Эл. мотор',  val: motorRpm.toFixed(0),   unit: 'об/мин', raw: motorRpm,        max: 4000, color: 'var(--indigo)' },
    { label: 'ДВС',         val: engineRpm.toFixed(0),  unit: 'об/мин', raw: engineRpm,       max: 4000, color: 'var(--amber)' },
    { label: 'Дроссель',    val: (throttle*100).toFixed(0), unit: '%',  raw: throttle * 100,  max: 100,  color: 'var(--violet)' },
  ];

  return (
    <div className="in-up" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted)', fontSize: 13, transition: 'color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          {icons.back} Главная
        </button>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{title}</h2>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {kpis.map(k => (
          <div key={k.label} className="glass-static" style={{ borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>{k.label}</div>
              <div className="jb" style={{ fontSize: 28, fontWeight: 800, color: k.color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {k.val}
              </div>
              <div className="jb" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{k.unit}</div>
            </div>
            <div style={{ flexShrink: 0, marginTop: -4, marginRight: -4 }}>
              <ArcGauge value={k.raw} max={k.max} color={k.color} size={52} sw={2.8} />
            </div>
          </div>
        ))}
      </div>

      {/* 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-static" style={{ borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 18 }}>Схема гибридной системы</div>
            <CircuitSchematic connectedTestPoint={connectedTestPoint} containerRef={schematicRef}>
              <DraggableProbe
                containerRef={schematicRef}
                svgViewBox={{ width: 700, height: 280 }}
                testPoints={TEST_POINT_COORDS}
                connectedPoint={connectedTestPoint}
                onConnect={store.connectTestPoint}
                onDisconnect={store.disconnectTestPoint}
              />
            </CircuitSchematic>
            <p className="jb" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 14, opacity: 0.6 }}>
              Перетащите щуп на точку: BATT · MOTOR · ICE · GEN
            </p>
          </div>

          <div className="glass-static" style={{ borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 18 }}>Осциллограф</div>
            <CanvasOscilloscope data={waveformData} timebase={1} voltsPerDiv={20} connectedPoint={connectedTestPoint} sampleRate={60} />
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ControlPanel />
          <MultimeterDisplay connectedPoint={connectedTestPoint} simulationTime={t} throttle={throttle} />
        </div>
      </div>
    </div>
  );
}
