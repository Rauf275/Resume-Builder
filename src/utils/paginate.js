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
// 3. If a single section is itself taller than one full page (a long
//    Experience list, for example), it's expanded into its own direct
//    children so the break can fall between entries instead of forcing the
//    whole section onto one unsplittable block.
// 4. A candidate Y is only used as a break if it doesn't fall inside *any*
//    unit's vertical range. This also makes multi-column/sidebar templates
//    safe: a cut only happens where it doesn't slice through content in
//    either column, so the taller column effectively governs where pages
//    break (the shorter column just leaves blank space underneath, the way
//    a printed two-column resume would).
const TOLERANCE_PX = 3;

function unitsFromRoot(root, rootRect) {
  const titles = Array.from(root.querySelectorAll('.res-section-title'));
  if (titles.length === 0) {
    return [{ top: 0, bottom: rootRect.height }];
  }

  const units = titles.map((title) => {
    const block = title.closest('section') || title.parentElement || title;
    const r = block.getBoundingClientRect();
    return { top: r.top - rootRect.top, bottom: r.bottom - rootRect.top, el: block };
  });

  const earliestTop = Math.min(...units.map((u) => u.top));
  if (earliestTop > TOLERANCE_PX) {
    units.push({ top: 0, bottom: earliestTop });
  }

  return units;
}

function expandOversizedUnits(units, pageHeight, rootRect) {
  const expanded = [];
  units.forEach((u) => {
    const height = u.bottom - u.top;
    if (height > pageHeight && u.el) {
      const kids = Array.from(u.el.children).filter((c) => !c.classList.contains('res-section-title'));
      if (kids.length > 1) {
        kids.forEach((k) => {
          const r = k.getBoundingClientRect();
          expanded.push({ top: r.top - rootRect.top, bottom: r.bottom - rootRect.top });
        });
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

  const units = expandOversizedUnits(unitsFromRoot(root, rootRect), pageHeight, rootRect);

  function isSafe(y) {
    return !units.some((u) => y > u.top + TOLERANCE_PX && y < u.bottom - TOLERANCE_PX);
  }

  const candidates = Array.from(new Set(units.map((u) => u.top))).sort((a, b) => a - b);

  const breaks = [0];
  let pageStart = 0;
  let guard = 0;
  while (pageStart < totalHeight - TOLERANCE_PX && guard < 200) {
    guard += 1;
    const limit = pageStart + pageHeight;
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
