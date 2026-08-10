import { useLayoutEffect, useRef, useState } from 'react';

// 1mm is defined by the CSS spec as exactly 96/25.4 reference px, regardless of the
// device's real DPI — this is the same math the browser itself uses to turn the `mm`
// units in resumeBase.css into on-screen pixels, so it stays correct at any zoom level.
const MM_TO_PX = 96 / 25.4;

function pageHeightPx(pageSize) {
  const mm = pageSize === 'Letter' ? 279 : 297;
  return mm * MM_TO_PX;
}

// Renders a thin divider only at the page boundaries the content actually reaches —
// e.g. one line if the resume spills a little onto page 2, two lines if it reaches
// page 3, and nothing at all for a resume that fits on a single page. Previously this
// was a repeating CSS background pattern with a fixed 297mm period, which always drew
// a line at the very bottom edge even for single-page content (and visibly slid up or
// down the page whenever font size changed the box's height) — this measures the
// element's real content height instead, so it can't produce a false line.
export function usePageBreakCount(contentRef, pageSize) {
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    function measure() {
      const pageH = pageHeightPx(pageSize);
      const n = Math.max(0, Math.floor((node.scrollHeight - 1) / pageH));
      setCount(n);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [contentRef, pageSize]);

  return count;
}

export default function PageBreakLines({ contentRef, pageSize }) {
  const count = usePageBreakCount(contentRef, pageSize);
  if (count === 0) return null;

  const pageH = pageHeightPx(pageSize);
  return (
    <div className="page-break-overlay" aria-hidden="true" data-html2canvas-ignore="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="page-break-line" style={{ top: `${pageH * (i + 1)}px` }} />
      ))}
    </div>
  );
}
