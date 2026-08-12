// Shared pagination brain for the resume preview (PaginatedResume.jsx) and
// the PDF exporter (exporters.js). Both used to just slice the rendered
// resume into equal-height windows (contentHeight / pageHeight), with no
// idea where one section ended and the next began. That's what produced the
// bug in the report: a page break landing mid-section (half of "Languages"
// stranded at the top of page 2), duplicated-looking content, and
// occasional near-empty trailing pages from rounding.
//
// This computes actual break offsets instead: Y positions (in CSS px,
// relative to the content root) where a new page may safely start without
// slicing through a section or an entry inside one. Both the preview and
// the PDF exporter read the *same* function against the *same* source DOM
// node, so what you see while editing is exactly what comes out of Export.
//
// How a "safe" cut is found:
// 1. Every element carrying `.res-section-title` (every template uses this
//    class for its section headings — see TemplateRenderer's dev-time
//    check for the equivalent convention around birth dates) marks the
//    start of a section. Its nearest `<section>` (or containing block, for
//    templates that use a plain div, e.g. a sidebar list) is one whole
//    breakable "unit" — normally never split.
// 2. Whatever sits above the first section (name/photo/contact header) is
//    an implicit leading unit — always kept with page 1's start.
// 3. Any section with more than one entry (a multi-job Experience list, a
//    multi-school Education list, ...) is expanded into its own direct
//    children so the break can fall between entries instead of forcing the
//    whole section onto one unsplittable block — this applies regardless of
//    whether the section as a whole is taller than a page, since what
//    matters is whether it fits in whatever budget is left on the current
//    page, not against a full page in isolation.
// 4. A candidate Y is only used as a break if it doesn't fall inside *any*
//    unit's vertical range. This also makes multi-column/sidebar templates
//    safe: a cut only happens where it doesn't slice through content in
//    either column, so the taller column effectively governs where pages
//    break (the shorter column just leaves blank space underneath, the way
//    a printed two-column resume would).
const TOLERANCE_PX = 3;

// Continuation pages (page 2, 3, ...) get a blank visual gap above their
// content — see the comment on CONTINUATION_TOP_GAP_PX in
// PaginatedResume.jsx for why. That gap eats into how much a continuation
// page can actually hold, so its usable budget is pageHeight minus the gap,
// not the full pageHeight. Page 1 is unaffected — it already gets its own
// top breathing room from the template's own page padding — so its budget
// stays the full pageHeight. Exported so PaginatedResume.jsx and the PDF
// exporter both size the gap identically instead of each guessing a value.
export const CONTINUATION_TOP_GAP_PX = 0;

function unitsFromRoot(root, rootRect) {
  const titles = Array.from(root.querySelectorAll('.res-section-title'));
  if (titles.length === 0) {
    return [{ top: 0, bottom: rootRect.height }];
  }

  const units = titles.map((title) => {
    const block = title.closest('section') || title.parentElement || title;
    const r = block.getBoundingClientRect();
    return { top: r.top - rootRect.top, bottom: r.bottom - rootRect.top, el: block, parent: block.parentElement };
  });

  // The space above a column's first titled section (a sidebar's photo/name/
  // contact block, or a main column's own lead-in) has no `.res-section-title`
  // of its own, so nothing above marks it as a protected unit — it used to be
  // covered by a single "leading unit" sized from the SHORTEST such gap across
  // every column (Math.min over every unit's top). That's wrong for a
  // multi-column template like Modern: the sidebar's header (photo, name,
  // contacts) runs much deeper than the main column's, which can start almost
  // immediately with its first section title ("About"). Using the main
  // column's short gap as the *only* protected leading region left the
  // sidebar's own, much taller, un-sectioned header completely unprotected —
  // a break could land right after that tiny shared gap and slice straight
  // through the sidebar's photo/name/contacts block, stranding it on the next
  // page while page 1 rendered as basically blank. Computing one leading unit
  // PER column (grouped by each section's shared DOM parent, which is the
  // column's own container) instead means every column's own header is
  // protected using that column's own earliest title, regardless of how much
  // shorter another column's header is.
  const groups = new Map();
  units.forEach((u) => {
    if (!groups.has(u.parent)) groups.set(u.parent, []);
    groups.get(u.parent).push(u);
  });
  groups.forEach((groupUnits) => {
    const earliestTop = Math.min(...groupUnits.map((u) => u.top));
    if (earliestTop > TOLERANCE_PX) {
      units.push({ top: 0, bottom: earliestTop });
    }
  });

  return units;
}

// Splits any section that has more than one entry (Experience, Education,
// Certificates, ...) into one unit per entry, so a break can land between
// entries instead of being forced to treat the whole section as one
// unsplittable block.
//
// This used to only kick in once a section's total height exceeded a full
// page — reasonable-sounding, but wrong: what actually matters isn't a
// section's height against a FULL page, it's its height against whatever
// budget is LEFT on the page a break is being attempted on. A section that's
// merely a bit shorter than a full page (say, three Education entries just
// under 1050px, next to a ~1122px page) will almost never fit in the space
// that's actually left after a header or a previous section already ate
// into that page's budget — so it still can't be kept as one block, and
// with no per-entry units to fall back on, the whole section (and
// everything after it, since nothing "safe" exists in between) got pushed
// to the next page, leaving the current one mostly blank. Expanding every
// multi-entry section unconditionally removes that gap: it costs nothing
// when a section DOES fit as one block (its own top is still a candidate,
// since that's where its first entry starts), and it's what makes the
// tight-budget case above split cleanly between entries instead of wasting
// the rest of the page.
//
// A handful of section types (Skills/Interests tag pills, Languages,
// contact lists) render their content as ONE wrapper div holding many small
// items, rather than several sibling `.res-item`/`.entry-card` blocks — so
// the check below (`kids.length > 1`) never fires for them, and the whole
// list was being treated as a single unsplittable unit. That's harmless
// when the list is short, but once it was too tall to fit in whatever
// budget was left on a page, the *entire* list (and every section after
// it, since nothing safe existed in between) got deferred whole to the
// next page — leaving a large unused strip at the bottom of the page it
// didn't fit on, most visible in a sidebar column, whose own content is
// often exactly this kind of list. Recognizing these specific wrapper
// classes lets a break land BETWEEN two tags/list rows instead, the same
// way it's already allowed to land between two Experience/Education
// entries.
const LIST_WRAPPER_CLASSES = ['res-tags', 'res-lang-list', 'res-contact-list', 'res-contact-row'];

function expandMultiEntryUnits(units, rootRect) {
  const expanded = [];
  units.forEach((u) => {
    if (u.el) {
      let kids = Array.from(u.el.children).filter((c) => !c.classList.contains('res-section-title'));
      // Only reach one level deeper when that single child is a recognized
      // list wrapper — never for a section whose one child is a single
      // `.res-item`/`.entry-card` (e.g. one Education entry), where the
      // "children" are that entry's own title/date/description parts and
      // must stay glued together as one unsplittable block.
      if (kids.length === 1 && LIST_WRAPPER_CLASSES.some((cls) => kids[0].classList.contains(cls))) {
        const inner = Array.from(kids[0].children);
        if (inner.length > 1) kids = inner;
      }
      if (kids.length > 1) {
        const kidRects = kids.map((k) => {
          const r = k.getBoundingClientRect();
          return { top: r.top - rootRect.top, bottom: r.bottom - rootRect.top };
        });
        // Keep the section's heading glued to its first entry — without
        // this, the gap between the title and the first child would be
        // unprotected, and a break could land there and strand the heading
        // alone at the bottom of a page with none of its own content.
        const firstChildTop = kidRects[0].top;
        if (firstChildTop > u.top + TOLERANCE_PX) {
          expanded.push({ top: u.top, bottom: firstChildTop });
        }
        kidRects.forEach((r) => expanded.push(r));
        return;
      }
    }
    expanded.push(u);
  });
  return expanded.sort((a, b) => a.top - b.top);
}

// Returns an ascending array of Y offsets (CSS px, relative to `root`'s own
// top) — one per page, always starting with 0. A single-page resume returns
// just [0].
export function computeContentBreakOffsets(root, pageHeight) {
  if (!root || !pageHeight) return [0];

  const rootRect = root.getBoundingClientRect();
  const totalHeight = rootRect.height;
  if (totalHeight - pageHeight <= TOLERANCE_PX) return [0];

  const units = expandMultiEntryUnits(unitsFromRoot(root, rootRect), rootRect);

  function isSafe(y) {
    return !units.some((u) => y > u.top + TOLERANCE_PX && y < u.bottom - TOLERANCE_PX);
  }

  const candidates = Array.from(new Set(units.map((u) => u.top))).sort((a, b) => a - b);

  const breaks = [0];
  let pageStart = 0;
  let guard = 0;
  while (pageStart < totalHeight - TOLERANCE_PX && guard < 200) {
    guard += 1;
    // pageStart === 0 is page 1, budgeted with the full pageHeight. Every
    // page after that (pageStart > 0) is a continuation page, which loses
    // CONTINUATION_TOP_GAP_PX of usable height to its own top gap — without
    // this, a section could be judged "fits" against the full pageHeight
    // and then actually get clipped once that gap is rendered in.
    const budget = pageStart === 0 ? pageHeight : pageHeight - CONTINUATION_TOP_GAP_PX;
    const limit = pageStart + budget;
    if (limit >= totalHeight - TOLERANCE_PX) break;

    // Prefer the furthest safe candidate that still fits within this page.
    const fitting = candidates.filter((c) => c > pageStart + TOLERANCE_PX && c <= limit + TOLERANCE_PX && isSafe(c));
    let next = fitting.length ? fitting[fitting.length - 1] : undefined;

    if (next === undefined) {
      // Nothing safe fits inside a normal page height — a unit runs longer
      // than one page (or no candidate lines up across columns). Push past
      // the limit to the next safe candidate rather than cutting mid-unit.
      next = candidates.find((c) => c > pageStart + TOLERANCE_PX && isSafe(c));
    }

    if (next === undefined || next <= pageStart + TOLERANCE_PX) break;

    breaks.push(next);
    pageStart = next;
  }

  return breaks;
}
