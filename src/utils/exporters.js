import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { formatMonth, formatBirthDate, contactItems } from '../templates/sectionContent';

function fileName(resume, ext) {
  const name = [resume.personal.firstName, resume.personal.lastName].filter(Boolean).join('-') || 'resume';
  return `${name.toLowerCase().replace(/\s+/g, '-')}.${ext}`;
}

// Parses a computed `rgb(...)`/`rgba(...)` color string into a [r, g, b]
// array for jsPDF's setFillColor, which wants numeric channels rather than a
// CSS color string. Falls back to white if the format is ever unrecognized
// (e.g. `transparent`), rather than throwing mid-export.
function parseRGB(colorStr) {
  const m = colorStr && colorStr.match(/rgba?\(([^)]+)\)/);
  if (!m) return [255, 255, 255];
  const [r, g, b] = m[1].split(',').map((s) => parseFloat(s.trim()));
  return [r || 0, g || 0, b || 0];
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------- PDF ----------
export async function exportPDF(node, resume, pageSize = 'A4') {
  try {
    if (document.fonts?.ready) { await document.fonts.ready; }
    // Let the caller's loading state (spinner, disabled buttons) actually paint
    // before the heavy synchronous rasterization below blocks the main thread —
    // without this, the tap that triggered the export can feel like it did
    // nothing right up until the freeze ends. Harmless if the caller already
    // yielded a frame itself.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    // html2canvas's cost scales with the square of `scale` — 2.5x renders ~64%
    // more pixels than 2x. On phones (slower CPUs, and where this rasterization
    // is most noticeable as UI jank since there's no other tab/window to absorb
    // the freeze) a lower scale cuts that work down substantially while still
    // producing a crisp, print-quality PDF (2x is ~180dpi at these page sizes).
    // Desktops keep the higher-fidelity 2.5x since they have the headroom for it.
    const scale = window.innerWidth < 700 ? 2 : 2.5;
    const canvas = await html2canvas(node, { scale, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    const pdf = new jsPDF({ unit: 'mm', format: pageSize.toLowerCase() === 'letter' ? 'letter' : 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidthMm = pageWidth;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    // Page 1 needs no adjustment — the resume's own top/bottom padding
    // already reads as margin there. Every page after that used to be cut at
    // a raw pageHeight multiple with no such padding, jamming continued text
    // against the page edge — the same crop-boundary issue the live preview
    // has (see PaginatedResume.jsx, which this mirrors so the PDF keeps
    // matching what was previewed). Reserve that same padding as blank
    // margin around every page break here too: measure it from the rendered
    // `.resume-page`, convert from its CSS px to PDF mm using the image's own
    // px→mm scale, then leave that much space at the top and bottom of every
    // page after the first.
    const pageEl = node.querySelector('.resume-page') || node;
    const pageStyle = getComputedStyle(pageEl);
    const pxToMm = imgWidthMm / node.getBoundingClientRect().width;
    const marginTopMm = (parseFloat(pageStyle.paddingTop) || 0) * pxToMm;
    const marginBottomMm = (parseFloat(pageStyle.paddingBottom) || 0) * pxToMm;
    const usableMm = Math.max(1, pageHeight - marginTopMm - marginBottomMm);
    const bg = parseRGB(pageStyle.backgroundColor);

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthMm, imgHeightMm);
    let coveredMm = pageHeight;

    // Sub-millimeter tolerance: without it, an image whose height lands even
    // a hair over an exact multiple of usableMm (easy to happen from
    // rounding in the canvas → mm conversion above) would trigger one more
    // near-blank trailing page in the PDF.
    const PAGE_OVERFLOW_TOLERANCE_MM = 1;
    while (imgHeightMm - coveredMm > PAGE_OVERFLOW_TOLERANCE_MM) {
      pdf.addPage();
      // Shifts the (whole, unmodified) image up so that content starting at
      // `coveredMm` in the source lands at `marginTopMm` from this page's
      // top edge — the same offset math PaginatedResume.jsx uses for the
      // on-screen crop window.
      const position = marginTopMm - coveredMm;
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidthMm, imgHeightMm);
      // The position shift alone isn't enough: rows from the *previous*
      // page's tail can still land inside this page's top margin band (and,
      // on the last page, rows past the real content can land in the bottom
      // band). Painting over both bands with the page's own background color
      // blanks them cleanly, matching the preview's actual blank gap instead
      // of leaking a sliver of duplicated text into it.
      pdf.setFillColor(...bg);
      pdf.rect(0, 0, pageWidth, marginTopMm, 'F');
      pdf.rect(0, pageHeight - marginBottomMm, pageWidth, marginBottomMm, 'F');
      coveredMm += usableMm;
    }

    pdf.save(fileName(resume, 'pdf'));
  } catch (err) {
    // Previously a failure here (e.g. an unsupported CSS color function
    // reaching html2canvas) would throw silently — the button just did
    // nothing and no file appeared, with no indication anything went wrong.
    console.error('PDF export failed:', err);
    window.alert('Sorry, the PDF could not be generated. Please try again, or use the HTML export instead.');
  }
}

// ---------- Standalone HTML ----------
export function exportHTML(node, resume) {
  const cssText = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${resume.personal.firstName} ${resume.personal.lastName} — Resume</title>
<style>
  body { margin: 0; padding: 24px; background: #ececec; display: flex; justify-content: center; }
  ${cssText}
</style>
</head>
<body>
${node.outerHTML}
</body>
</html>`;

  download(new Blob([html], { type: 'text/html' }), fileName(resume, 'html'));
}

// ---------- JSON ----------
export function exportJSON(state) {
  const json = JSON.stringify(state, null, 2);
  download(new Blob([json], { type: 'application/json' }), fileName(state.resume, 'json'));
}

export function parseImportedJSON(text) {
  const data = JSON.parse(text);
  if (!data.resume) throw new Error('Invalid resume file');
  return data;
}

// ---------- DOCX (simplified formatting) ----------
function dateRangeText(start, end, current) {
  const s = formatMonth(start);
  const e = current ? 'Present' : formatMonth(end);
  return [s, e].filter(Boolean).join(' — ');
}

export async function exportDOCX(resume, sectionOrder, hiddenSections) {
  try {
    return await exportDOCXInner(resume, sectionOrder, hiddenSections);
  } catch (err) {
    console.error('DOCX export failed:', err);
    window.alert('Sorry, the Word document could not be generated. Please try again.');
  }
}

async function exportDOCXInner(resume, sectionOrder, hiddenSections) {
  const visible = sectionOrder.filter((s) => !hiddenSections.includes(s));
  const children = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: `${resume.personal.firstName} ${resume.personal.lastName}`, bold: true })],
    }),
    new Paragraph({ children: [new TextRun({ text: resume.personal.title, italics: true, color: '888888' })] }),
    ...(resume.personal.birthDate
      ? [new Paragraph({
          children: [new TextRun({ text: `Date of birth: ${formatBirthDate(resume.personal.birthDate)}`, bold: true })],
          spacing: { after: 100 },
        })]
      : []),
    new Paragraph({
      children: [new TextRun(contactItems(resume.personal).join('  |  '))],
      spacing: { after: 200 },
    })
  );

  if (resume.about) {
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'About' }),
      new Paragraph({ text: resume.about, spacing: { after: 200 } })
    );
  }

  const sectionBuilders = {
    experience: () => {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Experience' }));
      resume.experience.forEach((it) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${it.position} — ${it.company}`, bold: true }),
              new TextRun({ text: `   ${dateRangeText(it.startDate, it.endDate, it.current)}`, color: '888888' }),
            ],
          }),
          new Paragraph({ text: it.description || '', spacing: { after: 150 } })
        );
      });
    },
    education: () => {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Education' }));
      resume.education.forEach((it) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${it.school}`, bold: true }),
              new TextRun({ text: `   ${dateRangeText(it.startDate, it.endDate, false)}`, color: '888888' }),
            ],
          }),
          new Paragraph({ text: [it.degree, it.field].filter(Boolean).join(', '), spacing: { after: 150 } })
        );
      });
    },
    skills: () => {
      children.push(
        new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Skills' }),
        new Paragraph({ text: resume.skills.join('  ·  '), spacing: { after: 200 } })
      );
    },
    languages: () => {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Languages' }));
      resume.languages.forEach((it) => {
        children.push(new Paragraph({ text: `${it.name} — ${it.level}` }));
      });
    },
    certificates: () => {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Certificates' }));
      resume.certificates.forEach((it) => {
        children.push(new Paragraph({ text: `${it.name} — ${it.issuer} (${formatMonth(it.date)})` }));
      });
    },
    projects: () => {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Projects' }));
      resume.projects.forEach((it) => {
        children.push(
          new Paragraph({ children: [new TextRun({ text: it.name, bold: true })] }),
          new Paragraph({ text: it.description || '', spacing: { after: 150 } })
        );
      });
    },
    interests: () => {
      children.push(
        new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Interests' }),
        new Paragraph({ text: resume.interests.join('  ·  ') })
      );
    },
  };

  visible.forEach((key) => {
    if (sectionBuilders[key]) {
      sectionBuilders[key]();
      return;
    }
    if (typeof key === 'string' && key.startsWith('custom-')) {
      const meta = (resume.customSections || []).find((s) => s.id === key);
      if (!meta) return;

      if (meta.type === 'tags') {
        const tags = (resume.customTags && resume.customTags[key]) || [];
        if (tags.length === 0) return;
        children.push(
          new Paragraph({ heading: HeadingLevel.HEADING_2, text: meta.title }),
          new Paragraph({ text: tags.join('  ·  '), spacing: { after: 150 } })
        );
        return;
      }

      const items = (resume.customItems && resume.customItems[key]) || [];
      if (items.length === 0) return;
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: meta.title }));
      items.forEach((it) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: it.title, bold: true }),
              ...(it.date ? [new TextRun({ text: `   ${it.date}`, color: '888888' })] : []),
            ],
          }),
          ...(it.subtitle ? [new Paragraph({ children: [new TextRun({ text: it.subtitle, italics: true })] })] : []),
          new Paragraph({ text: it.description || '', spacing: { after: 150 } })
        );
      });
    }
  });

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  download(blob, fileName(resume, 'docx'));
}
