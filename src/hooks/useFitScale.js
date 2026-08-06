import { useCallback, useRef, useState } from 'react';

// Returns [setRef, scale]. Attach `setRef` as the `ref` prop of the scrollable
// container the resume page sits in. `scale` is the largest factor that lets a
// `contentWidthPx` x `contentHeightPx` page fit entirely inside that container
// (both dimensions — no horizontal scroll, and the whole page visible top to
// bottom) without upscaling past `maxScale`.
//
// Deliberately uses a callback ref (not a ref object + useEffect) because the
// container this measures is often conditionally rendered — e.g. the mobile
// fullscreen preview only mounts when the user opens it. A plain ref object's
// `.current` changing doesn't retrigger effects, so an effect-based version
// would silently never attach on first open. A callback ref fires exactly when
// the node mounts/unmounts/changes, which is what we need here.
export function useFitScale(contentWidthPx, contentHeightPx, maxScale = 1.4) {
  const [scale, setScale] = useState(maxScale);
  const elRef = useRef(null);
  const roRef = useRef(null);

  const measure = useCallback(() => {
    const el = elRef.current;
    if (!el || !contentWidthPx) return;
    const cs = getComputedStyle(el);
    const paddingX = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
    const paddingY = parseFloat(cs.paddingTop || '0') + parseFloat(cs.paddingBottom || '0');
    const availableW = el.clientWidth - paddingX;
    const availableH = el.clientHeight - paddingY;
    if (availableW <= 0) return;
    const widthScale = availableW / contentWidthPx;
    const heightScale = contentHeightPx > 0 && availableH > 0 ? availableH / contentHeightPx : Infinity;
    setScale(Math.min(maxScale, widthScale, heightScale));
  }, [contentWidthPx, contentHeightPx, maxScale]);

  const setRef = useCallback((node) => {
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    elRef.current = node;
    if (node) {
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(node);
      roRef.current = ro;
    }
  }, [measure]);

  return [setRef, scale];
}

// Natural page sizes (96dpi, matching resumeBase.css's `210mm`/`297mm` and `216mm`/`279mm`).
export const PAGE_SIZE_PX = {
  A4: { width: 793.7, height: 1122.5 },
  Letter: { width: 816.4, height: 1054.5 },
};
