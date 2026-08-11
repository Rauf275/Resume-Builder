import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from 'react';
import ResumeContent from './ResumeContent';
import { useUIStore } from '../../store/useUIStore';
import { PAGE_SIZE_PX } from '../../hooks/useFitScale';
import './paginatedResume.css';

// The "create resume" preview used to render the resume as one continuously
// growing div: as soon as the content passed one physical page, it just kept
// getting taller on screen with no visual break, even though exportPDF (see
// utils/exporters.js) already slices that same content into separate PDF
// pages. So a two-page resume looked like a single long page while editing,
// and only actually showed as two pages once exported — this component makes
// the live preview match the export instead.
//
// It does this the same way the PDF export does: render the full resume once,
// then slice that rendered result into fixed-height windows, one per page.
// Each window is a fixed-height, overflow-hidden "sheet" containing a full
// copy of the resume shifted up by however many page-heights come before it,
// so only that page's slice is visible — a plain CSS crop, not a real
// re-flow, which is exactly what the raster PDF export does too. That keeps
// preview and PDF output pixel-for-pixel consistent, and it works for every
// template without any of them needing to know about pagination.
//
// A page is only added once content genuinely overflows the previous one —
// see the OVERFLOW_TOLERANCE_PX note below for why a plain height/pageHeight
// comparison isn't enough to guarantee that on its own.
const OVERFLOW_TOLERANCE_PX = 3;

const PaginatedResume = forwardRef(function PaginatedResume(_, ref) {
  const customization = useUIStore((s) => s.customization);
  const pageSizePx = PAGE_SIZE_PX[customization.pageSize] || PAGE_SIZE_PX.A4;
  const pageHeight = pageSizePx.height;

  const [pageCount, setPageCount] = useState(1);
  const sourceRef = useRef(null);

  useLayoutEffect(() => {
    const el = sourceRef.current;
    if (!el) return;

    function recalc() {
      // getBoundingClientRect gives the real, fractional rendered height.
      // scrollHeight (used originally) is rounded to a whole pixel by the
      // browser, and `.resume-page`'s `min-height: 297mm` sits so close to
      // that exact page height that the rounding alone was enough to tip
      // scrollHeight a fraction of a pixel past pageHeight — which made
      // Math.ceil() report a second page for basically every resume, even
      // ones with plenty of room left on page one.
      const contentHeight = el.getBoundingClientRect().height;
      // A few px of tolerance absorbs that kind of rounding/sub-pixel jitter
      // (and things like a barely-open text cursor) without masking a real
      // overflow, which is always much bigger than a few pixels — a whole
      // extra line of text, at minimum.
      const overflow = Math.max(0, contentHeight - pageHeight - OVERFLOW_TOLERANCE_PX);
      setPageCount(1 + Math.ceil(overflow / pageHeight));
    }

    recalc();
    // Catches every edit that can change the resume's rendered height —
    // typing, adding/removing a section, switching template, tweaking font
    // size or line height, changing page size — without having to list each
    // of those as a manual dependency.
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    // Fonts finishing their (async) load after first paint can shift text
    // height slightly; recheck once they're actually ready.
    document.fonts?.ready?.then(recalc);
    return () => ro.disconnect();
  }, [pageHeight]);

  // Memoized (rather than a plain inline function) so React doesn't call it
  // with null-then-node again on every single render — a new function
  // identity each render is treated as a ref change even though the actual
  // DOM node hasn't.
  const setSourceRefs = useCallback((node) => {
    sourceRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  return (
    <div className="paginated-resume">
      {/* Canonical, unclipped copy — this is the node the export utilities
          (PDF/HTML) and the height measurement above both read from. Its
          wrapper is positioned off-screen (not display:none/visibility:hidden
          — those would also make html2canvas render it blank) so it never
          affects the visible layout but is still fully paintable for export. */}
      <div className="paginated-resume-source-wrap" aria-hidden="true">
        <ResumeContent ref={setSourceRefs} />
      </div>

      {/* Visible sheets: one per page, each a fixed-height window onto an
          independent copy of the same content, shifted up by that page's
          offset so only its slice shows through. */}
      <div className="paginated-resume-sheets">
        {Array.from({ length: pageCount }, (_, i) => (
          <div className="resume-sheet" key={i} style={{ height: pageHeight }}>
            <div className="resume-sheet-inner" style={{ transform: `translateY(-${i * pageHeight}px)` }}>
              <ResumeContent />
            </div>
            {pageCount > 1 && (
              <div className="resume-sheet-number">{i + 1} / {pageCount}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default PaginatedResume;
