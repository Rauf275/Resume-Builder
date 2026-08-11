import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { formatMonth, formatBirthDate, contactItems } from '../templates/sectionContent';
import { PAGE_SIZE_PX } from '../hooks/useFitScale';
import { computeContentBreakOffsets } from './paginate';

function fileName(resume, ext) {
  const name = [resume.personal.firstName, resume.personal.lastName].filter(Boolean).join('-') || 'resume';
  return `${name.toLowerCase().replace(/\s+/g, '-')}.${ext}`;
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

    // Work out where each page is allowed to break *before* rasterizing —
    // computeContentBreakOffsets reads the live, unrasterized DOM (the same
    // source node the on-screen preview measures — see PaginatedResume.jsx),
    // so the cut points always fall between sections/entries instead of
    // through the middle of one. Previously this just rasterized the whole
    // resume once and sliced the resulting image every `pageHeight` mm, with
    // no idea what content lived at that Y position — that's what could
    // split a section across the page boundary or leave a near-blank
    // trailing page from rounding.
    const pageSizePx = PAGE_SIZE_PX[pageSize] || PAGE_SIZE_PX.A4;
    const nodeCssHeight = node.getBoundingClientRect().height;
    const breaksPx = computeContentBreakOffsets(node, pageSizePx.height);

    const canvas = await html2canvas(node, { scale, useCORS: true, backgroundColor: '#ffffff' });
    // Actual rasterized px per CSS px — should equal `scale`, but derived
    // from the real canvas/node widths so any rounding html2canvas does
    // internally doesn't drift the slice math below.
    const pxPerCssPx = canvas.width / node.getBoundingClientRect().width;

    const pdf = new jsPDF({ unit: 'mm', format: pageSize.toLowerCase() === 'letter' ? 'letter' : 'a4' });
    const pageWidthMm = pdf.internal.pageSize.getWidth();
    const mmPerCanvasPx = pageWidthMm / canvas.width;

    for (let i = 0; i < breaksPx.length; i += 1) {
      const startPx = breaksPx[i];
      const endPx = i + 1 < breaksPx.length ? breaksPx[i + 1] : nodeCssHeight;
      const sy = Math.round(startPx * pxPerCssPx);
      const sh = Math.max(1, Math.round((endPx - startPx) * pxPerCssPx));

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sh;
      const ctx = pageCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.96);
      const pageImgHeightMm = sh * mmPerCanvasPx;

      if (i > 0) pdf.addPage();
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pageWidthMm, pageImgHeightMm);
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
