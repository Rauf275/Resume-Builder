import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ResumeContent from './ResumeContent';
import { useUIStore } from '../../store/useUIStore';
import { PAGE_SIZE_PX } from '../../hooks/useFitScale';
import { computeContentBreakOffsets, CONTINUATION_TOP_GAP_PX } from '../../utils/paginate';
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
          affects the visible layout but is still fully paintable for export.

          Portaled straight to <body> rather than rendered in place: the
          preview wraps everything (this source copy included) in a
          `.preview-zoom-wrap` that carries a `transform: scale(...)` for the
          on-screen zoom/fit level. Per the CSS spec, an ancestor with ANY
          transform (even scale(1)) becomes the containing block for its
          `position: fixed` descendants — so without the portal, this node's
          "fixed" positioning silently stopped being relative to the real
          viewport and started being relative to that scaled wrapper instead,
          and its on-screen box (what getBoundingClientRect(), and therefore
          computeContentBreakOffsets, actually measures) got scaled down right
          along with it. That's harmless-looking at 100% desktop zoom (scale
          is 1, nothing visibly shrinks), but the mobile fullscreen preview
          fits a 793px-wide page into a ~390px screen with a scale well under
          1 — so the "canonical" copy was being measured at roughly half its
          real size there, the resulting page count came out lower than the
          PDF's, and it silently drifted further from the export on any
          desktop zoom level too. Portaling to <body> — outside every
          transformed ancestor — keeps this copy's real viewport-fixed
          position and true, unscaled page width no matter what zoom level
          the visible sheets are rendered at. */}
      {createPortal(
        <div className="paginated-resume-source-wrap" aria-hidden="true">
          <ResumeContent ref={setSourceRefs} />
        </div>,
        document.body
      )}

      {/* Visible sheets: one per page, each a fixed-height window onto an
          independent copy of the same content, shifted up by that page's
          offset so only its slice shows through.

          Each sheet is two nested boxes, not one: the outer `.resume-sheet`
          is always a full `pageHeight` tall — that's the physical A4/Letter
          sheet, and what gives every page (including a mostly-empty last
          page) its real on-screen size. The inner `.resume-sheet-clip` is
          only as tall as *this page's actual content* — from this page's
          offset up to the next page's offset (or, on the last page, up to
          pageHeight). Without that inner clip, the outer box's own
          `overflow: hidden` was the only thing cutting the content off, and
          it always cut at a full pageHeight — well past the next page's
          break offset, since a break is only ever chosen where it fits
          *inside* pageHeight (see computeContentBreakOffsets). So the slice
          of content between "where the next page starts" and "this page's
          pageHeight-tall bottom edge" rendered twice: once, trailing and cut
          off, at the bottom of this page, and again, complete, at the top of
          the next one — the "Certificates clones onto page 2" bug. Clipping
          to the narrower of the two heights removes that overlap; any
          leftover space below a page's real content is just blank, same as
          a printed page whose next section didn't quite fit. */}
      <div className="paginated-resume-sheets">
        {breaks.map((offset, i) => {
          const nextOffset = i + 1 < breaks.length ? breaks[i + 1] : null;
          // Page 1 starts right at the top of its sheet — it already gets
          // its own breathing room from the template's own page padding
          // (15mm, baked into .resume-page in resumeBase.css). A
          // continuation page (i > 0) has no such padding of its own: its
          // slice of content was sitting mid-flow on the *unclipped* source
          // copy, so without help it renders flush against the sheet's top
          // edge — a section title landing right on the fold looks cramped
          // and, worse, visually indistinguishable from a page that simply
          // continues an unfinished paragraph. Reserving a blank gap here
          // (padding-top, counted inside the clip's own height via
          // box-sizing: border-box in the CSS) gives every continuation
          // page the same kind of top margin page 1 gets "for free".
          // computeContentBreakOffsets already accounts for this same gap
          // when deciding how much content a continuation page can safely
          // hold (see CONTINUATION_TOP_GAP_PX in utils/paginate.js), so the
          // two stay in sync: extra padding-top for a continuation page
          // was empty space nobody planned for on that page (this is what
          // could cause overflow or a phantom near-empty trailing page).
          const gap = i > 0 ? CONTINUATION_TOP_GAP_PX : 0;
          const clipHeight = nextOffset != null
            ? Math.max(1, Math.min(pageHeight, (nextOffset - offset) + gap))
            : pageHeight;
          // The gap above is a real, content-free spacer (a plain sibling
          // div with no children) rather than padding-top on the
          // overflow:hidden clip box. padding-top on a clipped box doesn't
          // create truly empty space for a translateY-shifted child: the
          // overflow clip region is the box's full padding box, so it
          // still includes the padding-top strip, and the transformed
          // .resume-sheet-inner's *layout* top sits right after that
          // padding regardless of the transform — only its paint position
          // moves. The result was that pixels belonging to the *previous*
          // page (content between offset-gap and offset) painted into that
          // reserved top strip and showed through, since the clip never
          // actually excluded that strip. Giving the gap its own
          // non-clipping spacer, and clipping only in a separate
          // `.resume-sheet-crop` sized to exactly the content height,
          // means the clip region no longer overlaps the gap area at all.
          const cropHeight = Math.max(1, clipHeight - gap);
          return (
            <div className="resume-sheet" key={i} style={{ height: pageHeight }}>
              <div className="resume-sheet-clip" style={{ height: clipHeight }}>
                {gap > 0 && <div className="resume-sheet-gap" style={{ height: gap }} />}
                <div className="resume-sheet-crop" style={{ height: cropHeight }}>
                  <div className="resume-sheet-inner" style={{ transform: `translateY(-${offset}px)` }}>
                    <ResumeContent />
                  </div>
                </div>
              </div>
              {breaks.length > 1 && (
                <div className="resume-sheet-number">{i + 1} / {breaks.length}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default PaginatedResume;
