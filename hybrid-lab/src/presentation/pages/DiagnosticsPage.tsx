import React, { useState, useEffect, useRef } from 'react';
import { useSimulationStore } from '../../application/stores/simulationStore';

// ── Types ────────────────────────────────────────────────────────

type ConnState = 'idle' | 'connecting' | 'connected' | 'error';
type AdapterType = 'ELM327_USB' | 'ELM327_BT' | 'J2534';

interface DtcCode {
  code: string;
  desc: string;
  severity: 'high' | 'medium' | 'low';
  cleared?: boolean;
}

interface LiveChannel {
  id: string;
  name: string;
  unit: string;
  value: number | null;
  color: string;
}

// ── Static data ──────────────────────────────────────────────────

const DTC_CODES: DtcCode[] = [
  { code: 'P0300', desc: 'Случайный пропуск зажигания',           severity: 'high' },
  { code: 'P0A0F', desc: 'Деградация тягового аккумулятора',      severity: 'high' },
  { code: 'P0A94', desc: 'Отказ DC/DC конвертора',                severity: 'medium' },
  { code: 'P1A00', desc: 'Аварийный режим гибридной системы',     severity: 'high' },
  { code: 'P0B2A', desc: 'SOC ниже допустимого предела',          severity: 'low' },
];

const ADAPTERS: { id: AdapterType; label: string; port: string }[] = [
  { id: 'ELM327_USB', label: 'ELM327 USB',       port: 'COM3' },
  { id: 'ELM327_BT',  label: 'ELM327 Bluetooth', port: 'BT-OBD2' },
  { id: 'J2534',      label: 'J2534 PassThru',   port: 'COM4' },
];

// ── Icons ────────────────────────────────────────────────────────

const icons = {
  plug: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V11"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M8 3v4"/><path d="M16 3v4"/>
      <path d="M8 7h8v4a4 4 0 0 1-8 0V7z"/>
    </svg>
  ),
  disconnect: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 2 20 20"/><path d="M8.5 8.5A4 4 0 0 0 8 11v1"/><path d="M16 11a4 4 0 0 0-4-4h-1"/>
      <path d="m11 17-1 1a4 4 0 0 1-5.66-5.66l1-1"/><path d="m22 18-1 1a4 4 0 0 1-5.66-5.66l1-1"/>
    </svg>
  ),
  clear: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  ),
  info: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
  ),
  chip: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="6" height="6" rx="1"/>
      <path d="M15 9V5h-2M9 9V5h2M9 15v4h2M15 15v4h-2M5 9h4M5 15h4M15 9h4M15 15h4"/>
    </svg>
  ),
};

// ── Spinner ──────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
    </svg>
  );
}

// ── Main component ───────────────────────────────────────────────

const DiagnosticsPage: React.FC = () => {
  const { simulationState: sim } = useSimulationStore();

  const [connState, setConnState] = useState<ConnState>('idle');
  const [adapter, setAdapter] = useState<AdapterType>('ELM327_USB');
  const [dtcs, setDtcs] = useState<DtcCode[]>(DTC_CODES);
  const [showInfo, setShowInfo] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [channels, setChannels] = useState<LiveChannel[]>([
    { id: 'PID_0D',   name: 'Скорость автомобиля',  unit: 'км/ч',   value: null, color: 'var(--cyan)' },
    { id: 'PID_0C',   name: 'Обороты ДВС',           unit: 'об/мин', value: null, color: 'var(--amber)' },
    { id: 'PID_5C',   name: 'Температура масла',     unit: '°C',     value: null, color: 'var(--rose)' },
    { id: 'HV_SOC',   name: 'SOC HV батареи',        unit: '%',      value: null, color: 'var(--emerald)' },
    { id: 'HV_VOLT',  name: 'Напряжение HV шины',    unit: 'В',      value: null, color: 'var(--indigo)' },
    { id: 'MOT_TORQ', name: 'Момент эл. мотора',     unit: 'Н·м',   value: null, color: 'var(--violet)' },
  ]);

  const addLog = (msg: string) =>
    setLog(prev => [`[${new Date().toLocaleTimeString('ru-RU')}] ${msg}`, ...prev].slice(0, 20));

  const connect = () => {
    if (connState !== 'idle' && connState !== 'error') return;
    const sel = ADAPTERS.find(a => a.id === adapter)!;
    setConnState('connecting');
    addLog(`Инициализация ${sel.label} на порту ${sel.port}…`);

    setTimeout(() => {
      addLog('AT Z — сброс ELM327… OK');
      setTimeout(() => {
        addLog('AT SP 0 — авто-протокол… ISO 15765-4 (CAN)');
        setTimeout(() => {
          addLog('0100 — поддерживаемые PID… OK');
          addLog(`Подключено к ECU. Протокол: CAN 11-bit 500kbps`);
          setConnState('connected');
        }, 500);
      }, 450);
    }, 600);
  };

  const disconnect = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setConnState('idle');
    setChannels(ch => ch.map(c => ({ ...c, value: null })));
    addLog('Соединение закрыто.');
  };

  // Live data polling when connected
  useEffect(() => {
    if (connState !== 'connected') return;

    const poll = () => {
      setChannels(prev => prev.map(ch => {
        switch (ch.id) {
          case 'PID_0D':   return { ...ch, value: Math.round(sim.motorRpm / 35) };
          case 'PID_0C':   return { ...ch, value: Math.round(sim.engineRpm) };
          case 'PID_5C':   return { ...ch, value: 85 + Math.round((Math.random() - 0.5) * 4) };
          case 'HV_SOC':   return { ...ch, value: Math.round(sim.batterySoc * 10) / 10 };
          case 'HV_VOLT':  return { ...ch, value: 200 + Math.round(sim.batterySoc * 2) };
          case 'MOT_TORQ': return { ...ch, value: Math.round(sim.throttle * 120 + (Math.random() - 0.5) * 8) };
          default: return ch;
        }
      }));
    };

    poll();
    intervalRef.current = setInterval(poll, 400);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [connState, sim.motorRpm, sim.engineRpm, sim.batterySoc, sim.throttle]);

  const clearDtc = (code: string) =>
    setDtcs(prev => prev.map(d => d.code === code ? { ...d, cleared: true } : d));

  const clearAll = () => setDtcs(prev => prev.map(d => ({ ...d, cleared: true })));

  const activeDtcs = dtcs.filter(d => !d.cleared);
  const sel = ADAPTERS.find(a => a.id === adapter)!;

  return (
    <div className="in-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Диагностика · OBD-II</span>
          {connState === 'connected' && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--subtle)', display: 'inline-block' }} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--emerald)' }}>
                <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} />
                Подключено · {sel.label}
              </span>
            </>
          )}
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 720, letterSpacing: '-0.03em', color: '#fff', marginBottom: 8 }}>
          OBD-II Диагностика
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Считывание кодов ошибок и живых данных с гибридного автомобиля через CAN-шину.
        </p>
      </div>

      {/* Info block */}
      <div
        className="glass-static"
        style={{ borderRadius: 12, padding: '12px 16px', marginBottom: 20, cursor: 'pointer' }}
        onClick={() => setShowInfo(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--indigo)', display: 'flex' }}>{icons.info}</span>
          <span style={{ fontSize: 13, color: 'var(--muted)', flex: 1 }}>
            Что такое OBD-II адаптер? Нажмите для подробностей.
          </span>
          <span style={{ fontSize: 11, color: 'var(--indigo)', fontWeight: 500 }}>{showInfo ? 'Скрыть ↑' : 'Подробнее ↓'}</span>
        </div>
        {showInfo && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--b1)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)' }}>OBD-II</strong> (On-Board Diagnostics II) — стандарт бортовой диагностики,
            обязательный для всех автомобилей с 1996 года. Адаптер подключается к разъёму под рулём
            и передаёт данные от ЭБУ на компьютер. <br />
            <strong style={{ color: 'var(--text)' }}>ELM327</strong> — популярный чип-интерпретатор протоколов OBD (USB / Bluetooth).{' '}
            <strong style={{ color: 'var(--text)' }}>J2534</strong> — профессиональный стандарт PassThru для заводского ПО.
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Adapter selector */}
          <div className="glass-static" style={{ borderRadius: 16, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ color: 'var(--indigo)', display: 'flex' }}>{icons.chip}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Адаптер</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {ADAPTERS.map(a => (
                <button
                  key={a.id}
                  disabled={connState !== 'idle' && connState !== 'error'}
                  onClick={() => setAdapter(a.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10,
                    background: adapter === a.id ? 'var(--i-dim)' : 'transparent',
                    border: `1px solid ${adapter === a.id ? 'rgba(129,140,248,0.22)' : 'var(--b1)'}`,
                    color: adapter === a.id ? 'var(--indigo)' : 'var(--muted)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontSize: 13, fontWeight: adapter === a.id ? 500 : 400,
                    opacity: (connState === 'connecting' || connState === 'connected') ? 0.5 : 1,
                  }}
                >
                  <span>{a.label}</span>
                  <span className="jb" style={{ fontSize: 10, opacity: 0.7 }}>{a.port}</span>
                </button>
              ))}
            </div>

            {/* Connect button */}
            {connState === 'idle' || connState === 'error' ? (
              <button
                onClick={connect}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 11,
                  background: 'var(--i-dim)', border: '1px solid rgba(129,140,248,0.3)',
                  color: 'var(--indigo)', fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(129,140,248,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--i-dim)'; }}
              >
                {icons.plug} Подключить {sel.label}
              </button>
            ) : connState === 'connecting' ? (
              <button disabled style={{
                width: '100%', padding: '11px 0', borderRadius: 11,
                background: 'var(--i-dim)', border: '1px solid rgba(129,140,248,0.2)',
                color: 'var(--indigo)', fontSize: 13.5, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: 0.8, cursor: 'wait',
              }}>
                <Spinner /> Инициализация…
              </button>
            ) : (
              <button
                onClick={disconnect}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 11,
                  background: 'var(--r-dim)', border: '1px solid rgba(248,113,113,0.25)',
                  color: 'var(--rose)', fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--r-dim)'; }}
              >
                {icons.disconnect} Отключить
              </button>
            )}
          </div>

          {/* Event log */}
          <div className="glass-static" style={{ borderRadius: 16, padding: 22, flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 14 }}>
              Журнал событий
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 180, overflowY: 'auto' }}>
              {log.length === 0 ? (
                <span style={{ fontSize: 12, color: 'var(--subtle)' }}>Нет событий</span>
              ) : log.map((entry, i) => (
                <div key={i} className="jb" style={{ fontSize: 11, color: i === 0 ? 'var(--text)' : 'var(--muted)', lineHeight: 1.5 }}>
                  {entry}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* DTC Codes */}
          <div className="glass-static" style={{ borderRadius: 16, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                  Коды DTC
                </span>
                {activeDtcs.length > 0 && (
                  <span style={{
                    fontSize: 10, padding: '1px 7px', borderRadius: 6,
                    background: 'var(--r-dim)', border: '1px solid rgba(248,113,113,0.22)', color: 'var(--rose)',
                  }} className="jb">{activeDtcs.length}</span>
                )}
              </div>
              {connState === 'connected' && activeDtcs.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12, color: 'var(--muted)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--rose)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'; }}
                  title="Сбросить все коды"
                >
                  {icons.clear} Сбросить все
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {dtcs.map((dtc, i) => (
                <div
                  key={dtc.code}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 0',
                    borderBottom: i < dtcs.length - 1 ? '1px solid var(--b1)' : 'none',
                    opacity: dtc.cleared ? 0.35 : 1,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: dtc.cleared ? 'var(--subtle)'
                      : dtc.severity === 'high' ? 'var(--rose)'
                      : dtc.severity === 'medium' ? 'var(--amber)'
                      : 'var(--emerald)',
                  }} />
                  <span className="jb" style={{
                    fontSize: 11.5, fontWeight: 700, flexShrink: 0,
                    color: dtc.cleared ? 'var(--muted)' : 'var(--indigo)',
                    padding: '2px 7px', borderRadius: 6,
                    background: dtc.cleared ? 'transparent' : 'var(--i-dim)',
                    border: `1px solid ${dtc.cleared ? 'transparent' : 'rgba(129,140,248,0.2)'}`,
                    width: 62, textAlign: 'center',
                  }}>
                    {dtc.code}
                  </span>
                  <span style={{ flex: 1, fontSize: 12.5, color: 'var(--muted)' }}>{dtc.desc}</span>
                  {!dtc.cleared && connState === 'connected' && (
                    <button
                      onClick={() => clearDtc(dtc.code)}
                      style={{
                        background: 'none', border: '1px solid var(--b1)', cursor: 'pointer',
                        fontSize: 10, color: 'var(--muted)', padding: '2px 8px', borderRadius: 5,
                        transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.borderColor = 'var(--rose)'; b.style.color = 'var(--rose)';
                      }}
                      onMouseLeave={e => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.borderColor = 'var(--b1)'; b.style.color = 'var(--muted)';
                      }}
                      title="Сбросить код"
                    >
                      Сброс
                    </button>
                  )}
                  {dtc.cleared && (
                    <span className="jb" style={{ fontSize: 10, color: 'var(--muted)' }}>OK</span>
                  )}
                </div>
              ))}
            </div>

            {connState !== 'connected' && (
              <div style={{
                marginTop: 14, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--b1)',
                fontSize: 12, color: 'var(--muted)', textAlign: 'center',
              }}>
                Подключите адаптер для считывания актуальных кодов
              </div>
            )}
          </div>

          {/* Live channels */}
          <div className="glass-static" style={{ borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 16 }}>
              Живые данные
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {channels.map((ch, i) => (
                <div
                  key={ch.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 0',
                    borderBottom: i < channels.length - 1 ? '1px solid var(--b1)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{ch.name}</div>
                    <div className="jb" style={{ fontSize: 10, color: 'var(--muted)' }}>{ch.id}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {ch.value !== null ? (
                      <>
                        <div className="jb" style={{ fontSize: 20, fontWeight: 700, color: ch.color, lineHeight: 1 }}>
                          {typeof ch.value === 'number' ? ch.value.toFixed(ch.unit === '%' || ch.unit === 'В' ? 1 : 0) : ch.value}
                        </div>
                        <div className="jb" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{ch.unit}</div>
                      </>
                    ) : (
                      <div className="jb" style={{ fontSize: 16, color: 'var(--subtle)' }}>—</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {connState !== 'connected' && (
              <div style={{
                marginTop: 14, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--b1)',
                fontSize: 12, color: 'var(--muted)', textAlign: 'center',
              }}>
                Данные недоступны — адаптер не подключён
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DiagnosticsPage;
