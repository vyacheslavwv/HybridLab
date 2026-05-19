/** Телефон или узкий touch-экран (не десктоп). */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || '';
  const phoneUA = /iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  const narrowTouch =
    window.matchMedia('(max-width: 640px)').matches &&
    window.matchMedia('(pointer: coarse)').matches;

  return phoneUA || narrowTouch;
}
