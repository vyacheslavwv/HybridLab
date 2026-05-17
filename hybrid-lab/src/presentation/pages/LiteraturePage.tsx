import React from 'react';

const BOOKS = [
  {
    title: 'Гибридный автомобиль',
    author: 'Википедия',
    tags: ['Теория', 'ДВС', 'HEV'],
    year: '2024',
    tagColor: 'amber' as const,
    url: 'https://ru.wikipedia.org/wiki/%D0%93%D0%B8%D0%B1%D1%80%D0%B8%D0%B4%D0%BD%D1%8B%D0%B9_%D0%B0%D0%B2%D1%82%D0%BE%D0%BC%D0%BE%D0%B1%D0%B8%D0%BB%D1%8C',
    type: 'wiki' as const,
    desc: 'Базовая статья об устройстве, классификации и принципах работы гибридных автомобилей.',
  },
  {
    title: 'Hybrid & Electric Vehicles — Free Book',
    author: 'CRC Press / Routledge',
    tags: ['EV', 'Гибрид', 'PDF'],
    year: '2023',
    tagColor: 'emerald' as const,
    url: 'https://www.routledge.com/rsc/downloads/CRC_Hybrid_Vehicles_Freebook.pdf',
    type: 'pdf' as const,
    desc: 'Бесплатная англоязычная книга CRC Press по технологиям гибридных и электрических автомобилей.',
  },
  {
    title: 'Тяговый электродвигатель',
    author: 'Википедия',
    tags: ['Мотор', 'Инвертор'],
    year: '2024',
    tagColor: 'indigo' as const,
    url: 'https://ru.wikipedia.org/wiki/%D0%A2%D1%8F%D0%B3%D0%BE%D0%B2%D1%8B%D0%B9_%D1%8D%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%BE%D0%B4%D0%B2%D0%B8%D0%B3%D0%B0%D1%82%D0%B5%D0%BB%D1%8C',
    type: 'wiki' as const,
    desc: 'Устройство и принципы работы тяговых электродвигателей, применяемых в гибридных автомобилях.',
  },
  {
    title: 'Гибридный синергетический привод (HSD)',
    author: 'Википедия',
    tags: ['ECU', 'Toyota HSD'],
    year: '2024',
    tagColor: 'violet' as const,
    url: 'https://ru.wikipedia.org/wiki/%D0%93%D0%B8%D0%B1%D1%80%D0%B8%D0%B4%D0%BD%D1%8B%D0%B9_%D1%81%D0%B8%D0%BD%D0%B5%D1%80%D0%B3%D0%B5%D1%82%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9_%D0%BF%D1%80%D0%B8%D0%B2%D0%BE%D0%B4',
    type: 'wiki' as const,
    desc: 'Детальное описание системы управления Toyota Hybrid Synergy Drive: планетарная передача, MG1, MG2.',
  },
  {
    title: 'Рекуперативное торможение',
    author: 'Википедия',
    tags: ['Рекуперация', 'Физика'],
    year: '2024',
    tagColor: 'cyan' as const,
    url: 'https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D0%BA%D1%83%D0%BF%D0%B5%D1%80%D0%B0%D1%82%D0%B8%D0%B2%D0%BD%D0%BE%D0%B5_%D1%82%D0%BE%D1%80%D0%BC%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5',
    type: 'wiki' as const,
    desc: 'Физика и схемотехника рекуперации кинетической энергии при торможении в гибридных системах.',
  },
  {
    title: 'Литий-ионный аккумулятор',
    author: 'Википедия',
    tags: ['Батарея', 'Химия'],
    year: '2024',
    tagColor: 'emerald' as const,
    url: 'https://ru.wikipedia.org/wiki/%D0%9B%D0%B8%D1%82%D0%B8%D0%B9-%D0%B8%D0%BE%D0%BD%D0%BD%D1%8B%D0%B9_%D0%B0%D0%BA%D0%BA%D1%83%D0%BC%D1%83%D0%BB%D1%8F%D1%82%D0%BE%D1%80',
    type: 'wiki' as const,
    desc: 'Электрохимия, характеристики и применение Li-ion аккумуляторов в тяговых системах электромобилей.',
  },
];

const TAG_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  amber:   { bg: 'var(--a-dim)',  border: 'rgba(251,191,36,0.22)',  color: 'var(--amber)' },
  emerald: { bg: 'var(--e-dim)',  border: 'rgba(52,211,153,0.22)',  color: 'var(--emerald)' },
  indigo:  { bg: 'var(--i-dim)',  border: 'rgba(129,140,248,0.22)', color: 'var(--indigo)' },
  violet:  { bg: 'var(--v-dim)',  border: 'rgba(192,132,252,0.22)', color: 'var(--violet)' },
  cyan:    { bg: 'var(--c-dim)',  border: 'rgba(34,211,238,0.22)',  color: 'var(--cyan)' },
};

const TYPE_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  wiki: { label: 'Wikipedia', color: 'var(--indigo)',  bg: 'var(--i-dim)', border: 'rgba(129,140,248,0.22)' },
  pdf:  { label: 'PDF',       color: 'var(--rose)',    bg: 'var(--r-dim)', border: 'rgba(248,113,113,0.22)' },
};

const extLink = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const bookIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

function BookCard({ title, author, tags, year, tagColor, url, type, desc }: typeof BOOKS[0]) {
  const [hov, setHov] = React.useState(false);
  const c = TAG_STYLES[tagColor];
  const badge = TYPE_BADGE[type];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 14, textDecoration: 'none',
        background: hov ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.022)',
        border: `1px solid ${hov ? 'var(--b2)' : 'var(--b1)'}`,
        borderRadius: 18, padding: '20px 22px',
        transition: 'all 0.18s ease',
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      {/* Tags row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {tags.map(tag => (
          <span key={tag} className="jb" style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 6,
            background: c.bg, border: `1px solid ${c.border}`, color: c.color,
          }}>
            {tag}
          </span>
        ))}
        <span className="jb" style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 6, marginLeft: 'auto',
          background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color,
        }}>
          {badge.label}
        </span>
      </div>

      {/* Title & author */}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: hov ? '#fff' : 'var(--text)', lineHeight: 1.4, marginBottom: 5, letterSpacing: '-0.01em', transition: 'color 0.15s' }}>
          {title}
        </h3>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>{author}</p>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginTop: 8 }}>{desc}</p>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--b1)' }}>
        <span className="jb" style={{ fontSize: 11, color: 'var(--muted)' }}>{year}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: hov ? c.color : 'var(--muted)', transition: 'color 0.15s', fontWeight: 500 }}>
          Открыть {extLink}
        </span>
      </div>
    </a>
  );
}

const LiteraturePage: React.FC = () => {
  return (
    <div className="in-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Библиотека · {BOOKS.length} источников</div>
        <h1 style={{ fontSize: 32, fontWeight: 720, letterSpacing: '-0.03em', color: '#fff', marginBottom: 8 }}>
          Учебные материалы
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Открытые статьи и материалы по гибридным приводам и электрификации транспорта.
        </p>
      </div>

      {/* Info banner */}
      <div className="glass-static" style={{
        borderRadius: 12, padding: '12px 16px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ color: 'var(--cyan)', display: 'flex', flexShrink: 0 }}>{bookIcon}</span>
        <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
          Все ссылки ведут на бесплатные открытые источники.
          Нажмите на карточку, чтобы открыть материал в новой вкладке.
        </span>
      </div>

      {/* Books grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {BOOKS.map((book, i) => (
          <BookCard key={i} {...book} />
        ))}
      </div>
    </div>
  );
};

export default LiteraturePage;
