import { useEffect, useState, type MouseEvent } from 'react';
import { isMobileDevice } from '../../shared/utils/device';

/** Показываем предупреждение при каждой полной загрузке страницы на мобильном; закрытие только до следующей перезагрузки. */
export default function UnsupportedDeviceModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setOpen(isMobileDevice());
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const dismiss = () => {
    setOpen(false);
  };

  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(4, 5, 10, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsupported-device-title"
        onClick={stopPropagation}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 360,
          borderRadius: 18,
          padding: '24px 22px 20px',
          background: 'rgba(18, 20, 32, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(129, 140, 248, 0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              flexShrink: 0,
              background: 'linear-gradient(145deg, rgba(244, 63, 94, 0.25) 0%, rgba(244, 63, 94, 0.08) 100%)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              id="unsupported-device-title"
              style={{ fontSize: 16, fontWeight: 650, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}
            >
              Устройство не поддерживается
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
              Hybrid Lab рассчитан на экран компьютера. Откройте платформу на ПК для полноценной работы с симулятором и осциллографом.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Закрыть"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: 'none',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <button
          type="button"
          onClick={dismiss}
          style={{
            width: '100%',
            marginTop: 6,
            padding: '11px 16px',
            borderRadius: 11,
            border: '1px solid rgba(129, 140, 248, 0.35)',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--indigo)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
