import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from 'react';
import ResumeContent from './ResumeContent';
import { useUIStore } from '../../store/useUIStore';
import { PAGE_SIZE_PX } from '../../hooks/useFitScale';
import { computeContentBreakOffsets } from '../../utils/paginate';
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
// then slice that rendered result into windows, one per page. Each window is
// a fixed-height, overflow-hidden "sheet" containing a full copy of the
// resume shifted up by that page's break offset, so only that page's slice
// is visible. The offsets themselves come from computeContentBreakOffsets
// (utils/paginate.js), which is the same function the PDF exporter uses on
// the same source node — so a page break always falls between sections (or
// between entries inside an oversized one), never through the middle of
// one, and the live preview and the exported PDF always agree on exactly
// where each page starts.
const PaginatedResume = forwardRef(function PaginatedResume(_, ref) {
  const customization = useUIStore((s) => s.customization);
  const pageSizePx = PAGE_SIZE_PX[customization.pageSize] || PAGE_SIZE_PX.A4;
  const pageHeight = pageSizePx.height;

  const [breaks, setBreaks] = useState([0]);
  const sourceRef = useRef(null);

  useLayoutEffect(() => {
    const el = sourceRef.current;
    if (!el) return;

    function recalc() {
      setBreaks(computeContentBreakOffsets(el, pageHeight));
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
        {breaks.map((offset, i) => (
          <div className="resume-sheet" key={i} style={{ height: pageHeight }}>
            <div className="resume-sheet-inner" style={{ transform: `translateY(-${offset}px)` }}>
              <ResumeContent />
            </div>
            {breaks.length > 1 && (
              <div className="resume-sheet-number">{i + 1} / {breaks.length}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default PaginatedResume;
