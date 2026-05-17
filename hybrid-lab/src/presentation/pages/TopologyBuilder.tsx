import React, { useState } from 'react';

export type ComponentType = 'ice' | 'generator' | 'battery' | 'inverter' | 'motor' | 'wheels';

interface ComponentDef {
  type: ComponentType;
  label: string;
  abbr: string;
  color: string;
  cssVar: string;
  dimVar: string;
  borderVar: string;
  description: string;
}

const COMPONENT_DEFS: ComponentDef[] = [
  { type: 'ice',       label: 'ДВС',       abbr: 'ICE',  color: '#f59e0b', cssVar: 'var(--amber)',   dimVar: 'var(--a-dim)', borderVar: 'rgba(251,191,36,0.22)',   description: 'Двигатель внутреннего сгорания. Преобразует топливо в механическую энергию.' },
  { type: 'generator', label: 'Генератор', abbr: 'GEN',  color: '#c084fc', cssVar: 'var(--violet)',  dimVar: 'var(--v-dim)', borderVar: 'rgba(192,132,252,0.22)',   description: 'Преобразует механическую энергию ДВС в электрическую.' },
  { type: 'battery',   label: 'Батарея',   abbr: 'BAT',  color: '#22d3ee', cssVar: 'var(--cyan)',    dimVar: 'var(--c-dim)', borderVar: 'rgba(34,211,238,0.22)',    description: 'Накапливает электрическую энергию.' },
  { type: 'inverter',  label: 'Инвертор',  abbr: 'INV',  color: '#818cf8', cssVar: 'var(--indigo)',  dimVar: 'var(--i-dim)', borderVar: 'rgba(129,140,248,0.22)',   description: 'Преобразует постоянный ток в переменный для мотора.' },
  { type: 'motor',     label: 'Эл. мотор', abbr: 'MOT',  color: '#34d399', cssVar: 'var(--emerald)', dimVar: 'var(--e-dim)', borderVar: 'rgba(52,211,153,0.22)',    description: 'Приводит колёса, работая от инвертора/батареи.' },
  { type: 'wheels',    label: 'Колёса',    abbr: 'WHL',  color: '#94a3b8', cssVar: 'var(--dim)',     dimVar: 'rgba(255,255,255,0.06)', borderVar: 'rgba(255,255,255,0.15)', description: 'Выходной элемент трансмиссии.' },
];

const CORRECT_TOPOLOGY: ComponentType[] = ['ice', 'generator', 'battery', 'inverter', 'motor', 'wheels'];

interface ValidationResult {
  isValid: boolean;
  topologyName: string | null;
  hints: string[];
}

function validate(slots: (ComponentType | null)[]): ValidationResult {
  const hints: string[] = [];
  const idx = (t: ComponentType) => slots.indexOf(t);

  const hasAll = CORRECT_TOPOLOGY.every((t) => slots.includes(t));
  if (!hasAll) {
    const missing = CORRECT_TOPOLOGY.filter((t) => !slots.includes(t));
    hints.push(`Не все компоненты размещены: ${missing.map((t) => t.toUpperCase()).join(', ')}.`);
    return { isValid: false, topologyName: null, hints };
  }

  if (idx('generator') < idx('ice'))    hints.push('Генератор должен идти ПОСЛЕ ДВС — ДВС питает Генератор, а не наоборот.');
  if (idx('battery') < idx('generator')) hints.push('Батарея должна идти ПОСЛЕ Генератора — Генератор заряжает Батарею.');
  if (idx('inverter') < idx('battery')) hints.push('Инвертор работает от Батареи — разместите Инвертор ПОСЛЕ Батареи.');
  if (idx('inverter') > idx('motor'))   hints.push('Инвертор должен стоять ПЕРЕД Мотором — он конвертирует DC→AC для Мотора.');
  if (idx('wheels') !== 5)              hints.push('Колёса — это выходной элемент, они должны быть в конце цепочки.');

  if (hints.length === 0) {
    return { isValid: true, topologyName: 'Последовательный гибрид (Series Hybrid)', hints: [] };
  }
  return { isValid: false, topologyName: null, hints };
}

// ── ComponentCard ─────────────────────────────────────────────────

function ComponentCard({ def, disabled }: { def: ComponentDef; disabled: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => { e.dataTransfer.setData('componentType', def.type); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={def.description}
      style={{
        padding: '10px 12px', borderRadius: 12,
        background: disabled ? 'transparent' : hov ? def.dimVar : 'rgba(255,255,255,0.025)',
        border: `1px solid ${disabled ? 'var(--b1)' : hov ? def.borderVar : 'var(--b1)'}`,
        cursor: disabled ? 'not-allowed' : 'grab',
        opacity: disabled ? 0.3 : 1,
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
    >
      <div className="jb" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: disabled ? 'var(--muted)' : def.cssVar, marginBottom: 3 }}>
        {def.abbr}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{def.label}</div>
    </div>
  );
}

// ── SlotDropZone ──────────────────────────────────────────────────

function SlotDropZone({
  index, component, isCorrect, isWrong, hint, onDrop, onRemove,
}: {
  index: number;
  component: ComponentType | null;
  isCorrect: boolean;
  isWrong: boolean;
  hint?: string;
  onDrop: (index: number, type: ComponentType) => void;
  onRemove: (index: number) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const def = component ? COMPONENT_DEFS.find((d) => d.type === component) : null;

  const borderColor = isCorrect ? 'rgba(52,211,153,0.5)'
    : isWrong   ? 'rgba(248,113,113,0.5)'
    : dragOver  ? 'rgba(129,140,248,0.5)'
    : 'var(--b1)';

  const bgColor = isCorrect ? 'rgba(52,211,153,0.07)'
    : isWrong   ? 'rgba(248,113,113,0.07)'
    : dragOver  ? 'rgba(129,140,248,0.07)'
    : def        ? 'rgba(255,255,255,0.025)'
    : 'transparent';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
      <div className="jb" style={{ fontSize: 9.5, color: 'var(--subtle)', marginBottom: 2 }}>#{index + 1}</div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const type = e.dataTransfer.getData('componentType') as ComponentType;
          if (type) onDrop(index, type);
        }}
        onClick={() => component && onRemove(index)}
        title={component ? 'Нажмите, чтобы убрать' : 'Перетащите компонент сюда'}
        style={{
          width: 80, minHeight: 76,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12, padding: '10px 6px',
          border: `1.5px solid ${borderColor}`,
          background: bgColor,
          cursor: component ? 'pointer' : 'default',
          transition: 'all 0.18s',
        }}
      >
        {def ? (
          <>
            <div className="jb" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: def.cssVar }}>{def.abbr}</div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 4, textAlign: 'center', lineHeight: 1.3 }}>{def.label}</div>
          </>
        ) : (
          <div style={{ fontSize: 10, color: 'var(--subtle)', textAlign: 'center' }}>
            {dragOver ? '↓ бросить' : 'пусто'}
          </div>
        )}
      </div>
      {hint && (
        <div style={{ fontSize: 9.5, color: 'var(--rose)', textAlign: 'center', maxWidth: 80, lineHeight: 1.3 }}>
          {hint}
        </div>
      )}
      {/* Arrow connector */}
      {index < 5 && (
        <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)', fontSize: 14, pointerEvents: 'none' }}>
          →
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────

const TopologyBuilder: React.FC = () => {
  const [slots, setSlots] = useState<(ComponentType | null)[]>(Array(6).fill(null));
  const validation = validate(slots);

  const handleDrop = (index: number, type: ComponentType) => {
    setSlots((prev) => {
      const next = [...prev];
      const existingIdx = next.indexOf(type);
      if (existingIdx !== -1) next[existingIdx] = null;
      next[index] = type;
      return next;
    });
  };

  const handleRemove = (index: number) => {
    setSlots((prev) => { const next = [...prev]; next[index] = null; return next; });
  };

  const handleReset = () => setSlots(Array(6).fill(null));

  const slotHints: (string | undefined)[] = Array(6).fill(undefined);
  if (!validation.isValid && validation.hints.length > 0) {
    slots.forEach((type, i) => {
      if (!type) return;
      if (type === 'generator' && slots.indexOf('ice') > i)       slotHints[i] = '↓ после ICE';
      if (type === 'battery'   && slots.indexOf('generator') > i) slotHints[i] = '↓ после GEN';
      if (type === 'inverter'  && slots.indexOf('battery') > i)   slotHints[i] = '↓ после BAT';
    });
  }

  const usedTypes = new Set(slots.filter(Boolean) as ComponentType[]);
  const filled = slots.filter(Boolean).length;

  return (
    <div className="in-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Практическое задание</div>
        <h1 style={{ fontSize: 32, fontWeight: 720, letterSpacing: '-0.03em', color: '#fff', marginBottom: 8 }}>
          Топология схемы
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Перетащите компоненты в правильном порядке, чтобы собрать последовательный гибрид.
        </p>
      </div>

      {/* Success banner */}
      {validation.isValid && (
        <div style={{
          marginBottom: 20, padding: '14px 20px', borderRadius: 14,
          background: 'var(--e-dim)', border: '1px solid rgba(52,211,153,0.3)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 20, color: 'var(--emerald)' }}>✓</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--emerald)', marginBottom: 2 }}>{validation.topologyName}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              ДВС → Генератор → Батарея → Инвертор → Мотор → Колёса
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14, alignItems: 'stretch' }}>

        {/* ── Palette ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass-static" style={{ borderRadius: 16, padding: 18, flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 14 }}>
              Компоненты
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {COMPONENT_DEFS.map((def) => (
                <ComponentCard key={def.type} def={def} disabled={usedTypes.has(def.type)} />
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 14, lineHeight: 1.6 }}>
              Перетащите в слоты. Нажмите на слот, чтобы убрать.
            </p>
          </div>

          {/* Progress */}
          <div className="glass-static" style={{ borderRadius: 16, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Заполнено</span>
              <span className="jb" style={{ fontSize: 11, color: 'var(--indigo)', fontWeight: 700 }}>{filled}/6</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ height: '100%', borderRadius: 2, background: validation.isValid ? 'var(--emerald)' : 'var(--indigo)', width: `${(filled / 6) * 100}%`, transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          </div>
        </div>

        {/* ── Assembly area ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>

          {/* Slots */}
          <div className="glass-static" style={{ borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 20 }}>
              Схема подключения
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, overflowX: 'auto' }}>
              {slots.map((comp, i) => (
                <div key={i} style={{ position: 'relative', flex: 1 }}>
                  <SlotDropZone
                    index={i}
                    component={comp}
                    isCorrect={validation.isValid && comp !== null}
                    isWrong={!validation.isValid && comp !== null && !!slotHints[i]}
                    hint={slotHints[i]}
                    onDrop={handleDrop}
                    onRemove={handleRemove}
                  />
                  {i < 5 && (
                    <div style={{ position: 'absolute', right: -8, top: '38px', color: 'var(--subtle)', fontSize: 12, pointerEvents: 'none' }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hints */}
          {!validation.isValid && validation.hints.length > 0 && (
            <div className="glass-static" style={{ borderRadius: 16, padding: 20, borderColor: 'rgba(251,191,36,0.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 12 }}>
                Инженерные подсказки
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {validation.hints.map((hint, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
                    <span style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 1, fontWeight: 700 }}>!</span>
                    {hint}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reference — растягивается, заполняет пространство до кнопки */}
          <div className="glass-static" style={{ borderRadius: 16, padding: 20, flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 12 }}>
              Справка — Последовательный гибрид
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
              В последовательном гибриде ДВС не связан механически с колёсами.
              ДВС вращает Генератор → Генератор заряжает Батарею → Батарея питает Инвертор →
              Инвертор управляет Электромотором → Мотор вращает Колёса.
            </p>
          </div>

          <button
            onClick={handleReset}
            style={{
              alignSelf: 'flex-start', marginTop: 'auto',
              padding: '9px 18px', borderRadius: 10,
              background: 'transparent', border: '1px solid var(--b2)',
              color: 'var(--muted)', fontSize: 13, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'var(--s1)'; b.style.color = 'var(--text)'; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'transparent'; b.style.color = 'var(--muted)'; }}
          >
            Сбросить
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopologyBuilder;
