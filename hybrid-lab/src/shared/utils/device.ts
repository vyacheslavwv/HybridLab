/** Телефон или узкий экран (не десктоп). */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || '';
  const phoneUA = /iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  const narrowScreen = window.matchMedia('(max-width: 768px)').matches;

  return phoneUA || narrowScreen;
}
