import React, { useState } from 'react';

const TERMS = [
  { term: 'SOC', full: 'State of Charge', ru: 'Состояние заряда', desc: 'Текущий уровень заряда аккумулятора в процентах от полной ёмкости.' },
  { term: 'HEV', full: 'Hybrid Electric Vehicle', ru: 'Гибридный автомобиль', desc: 'Автомобиль, использующий ДВС и электромотор совместно.' },
  { term: 'ICE', full: 'Internal Combustion Engine', ru: 'Двигатель внутреннего сгорания', desc: 'Тепловой двигатель, преобразующий энергию сгорания топлива в механическую работу.' },
  { term: 'PHEV', full: 'Plug-in Hybrid Electric Vehicle', ru: 'Подключаемый гибрид', desc: 'Гибрид с возможностью зарядки от внешней розетки.' },
  { term: 'BEV', full: 'Battery Electric Vehicle', ru: 'Чисто электрический автомобиль', desc: 'Автомобиль с питанием только от тягового аккумулятора, без ДВС.' },
  { term: 'Regen', full: 'Regenerative Braking', ru: 'Рекуперативное торможение', desc: 'Режим, при котором кинетическая энергия торможения преобразуется в электрическую и возвращается в АКБ.' },
  { term: 'OBD', full: 'On-Board Diagnostics', ru: 'Бортовая диагностика', desc: 'Стандартизированная система самодиагностики автомобиля (OBD-II — универсальный протокол).' },
  { term: 'DTC', full: 'Diagnostic Trouble Code', ru: 'Код неисправности', desc: 'Стандартный буквенно-цифровой код, идентифицирующий конкретную неисправность.' },
  { term: 'CAN', full: 'Controller Area Network', ru: 'Протокол CAN-шины', desc: 'Стандарт последовательной шины, используемой для связи ЭБУ внутри автомобиля.' },
  { term: 'ECU', full: 'Electronic Control Unit', ru: 'Электронный блок управления', desc: 'Встроенный компьютер, управляющий агрегатами автомобиля.' },
  { term: 'HV', full: 'High Voltage', ru: 'Высокое напряжение', desc: 'Шина высокого напряжения (обычно 200–800 В) тягового контура гибрида/электромобиля.' },
  { term: 'IPM', full: 'Intelligent Power Module', ru: 'Интеллектуальный силовой модуль', desc: 'Компонент инвертора, содержащий IGBT-транзисторы для управления электромотором.' },
  { term: 'IGBT', full: 'Insulated Gate Bipolar Transistor', ru: 'Биполярный транзистор с изолированным затвором', desc: 'Силовой переключатель в инверторе гибрида, управляющий током тягового мотора.' },
  { term: 'MG1/MG2', full: 'Motor Generator 1 / 2', ru: 'Мотор-генератор 1 / 2', desc: 'В полном гибриде (Toyota HSD): MG1 — стартер-генератор, MG2 — тяговый мотор.' },
  { term: 'PSD', full: 'Power Split Device', ru: 'Планетарный механизм распределения мощности', desc: 'Эпициклический редуктор, распределяющий мощность между ДВС, MG1 и MG2 (Toyota HSD).' },
];

const TAG_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  SOC:    { bg: 'var(--e-dim)',  border: 'rgba(52,211,153,0.22)',  color: 'var(--emerald)' },
  HEV:    { bg: 'var(--i-dim)',  border: 'rgba(129,140,248,0.22)', color: 'var(--indigo)' },
  ICE:    { bg: 'var(--a-dim)',  border: 'rgba(251,191,36,0.22)',  color: 'var(--amber)' },
  PHEV:   { bg: 'var(--c-dim)',  border: 'rgba(34,211,238,0.22)',  color: 'var(--cyan)' },
  BEV:    { bg: 'var(--e-dim)',  border: 'rgba(52,211,153,0.22)',  color: 'var(--emerald)' },
  Regen:  { bg: 'var(--c-dim)',  border: 'rgba(34,211,238,0.22)',  color: 'var(--cyan)' },
  OBD:    { bg: 'var(--v-dim)',  border: 'rgba(192,132,252,0.22)', color: 'var(--violet)' },
  DTC:    { bg: 'var(--r-dim)',  border: 'rgba(248,113,113,0.22)', color: 'var(--rose)' },
  CAN:    { bg: 'var(--i-dim)',  border: 'rgba(129,140,248,0.22)', color: 'var(--indigo)' },
  ECU:    { bg: 'var(--a-dim)',  border: 'rgba(251,191,36,0.22)',  color: 'var(--amber)' },
  HV:     { bg: 'var(--r-dim)',  border: 'rgba(248,113,113,0.22)', color: 'var(--rose)' },
  IPM:    { bg: 'var(--v-dim)',  border: 'rgba(192,132,252,0.22)', color: 'var(--violet)' },
  IGBT:   { bg: 'var(--v-dim)',  border: 'rgba(192,132,252,0.22)', color: 'var(--violet)' },
  'MG1/MG2': { bg: 'var(--c-dim)', border: 'rgba(34,211,238,0.22)', color: 'var(--cyan)' },
  PSD:    { bg: 'var(--i-dim)',  border: 'rgba(129,140,248,0.22)', color: 'var(--indigo)' },
};

const searchIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const GlossaryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

  const filtered = TERMS.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.ru.toLowerCase().includes(search.toLowerCase()) ||
      t.full.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="in-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Справочник · {TERMS.length} терминов</div>
        <h1 style={{ fontSize: 32, fontWeight: 720, letterSpacing: '-0.03em', color: '#fff', marginBottom: 8 }}>
          Глоссарий
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Термины и аббревиатуры гибридных электрических транспортных средств.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: focused ? 'var(--indigo)' : 'var(--muted)',
          display: 'flex', alignItems: 'center',
          transition: 'color 0.15s',
          pointerEvents: 'none',
        }}>
          {searchIcon}
        </span>
        <input
          type="text"
          placeholder="Найти термин... (например: SOC, CAN, батарея)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: 'var(--s1)',
            border: `1px solid ${focused ? 'rgba(129,140,248,0.4)' : 'var(--b1)'}`,
            borderRadius: 12,
            padding: '11px 14px 11px 42px',
            fontSize: 13.5,
            color: 'var(--text)',
            outline: 'none',
            transition: 'border-color 0.15s, background 0.15s',
            backdropFilter: 'blur(12px)',
            boxShadow: focused ? '0 0 0 3px rgba(129,140,248,0.08)' : 'none',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--muted)', fontSize: 16, lineHeight: 1, padding: '2px 4px',
              borderRadius: 4,
            }}
            title="Очистить"
          >×</button>
        )}
      </div>

      {/* Table */}
      <div className="glass-static" style={{ borderRadius: 16, overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '90px 1fr 1.4fr',
          padding: '10px 20px',
          borderBottom: '1px solid var(--b1)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {['Акроним', 'Расшифровка', 'Определение'].map(h => (
            <span key={h} style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Нет совпадений по запросу «{search}»
          </div>
        )}

        {filtered.map((t, i) => {
          const c = TAG_COLORS[t.term] ?? { bg: 'var(--i-dim)', border: 'rgba(129,140,248,0.22)', color: 'var(--indigo)' };
          return (
            <div
              key={i}
              style={{
                display: 'grid', gridTemplateColumns: '90px 1fr 1.4fr', gap: 16,
                padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--b1)' : 'none',
                transition: 'background 0.12s',
                alignItems: 'start',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Term badge */}
              <div>
                <span className="jb" style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '3px 9px', borderRadius: 7,
                  fontSize: 11.5, fontWeight: 700,
                  background: c.bg, border: `1px solid ${c.border}`, color: c.color,
                }}>
                  {t.term}
                </span>
              </div>

              {/* Full name */}
              <div>
                <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 3, fontWeight: 500 }}>{t.full}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t.ru}</div>
              </div>

              {/* Definition */}
              <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>{t.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Footer counter */}
      <div style={{ marginTop: 12, textAlign: 'right', fontSize: 11, color: 'var(--muted)' }}>
        <span className="jb">{filtered.length}</span> / <span className="jb">{TERMS.length}</span> терминов
      </div>
    </div>
  );
};

export default GlossaryPage;
