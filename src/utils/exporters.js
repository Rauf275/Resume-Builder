import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { formatMonth, formatBirthDate } from '../templates/sectionContent';

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
  if (document.fonts?.ready) { await document.fonts.ready; }
  const canvas = await html2canvas(node, { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/jpeg', 0.96);

  const pdf = new jsPDF({ unit: 'mm', format: pageSize.toLowerCase() === 'letter' ? 'letter' : 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidthMm = pageWidth;
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

  let heightLeft = imgHeightMm;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidthMm, imgHeightMm);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeightMm;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidthMm, imgHeightMm);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName(resume, 'pdf'));
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
      children: [
        new TextRun(
          [resume.personal.email, resume.personal.phone, resume.personal.address, resume.personal.linkedin, resume.personal.github]
            .filter(Boolean)
            .join('  |  ')
        ),
      ],
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
      const items = (resume.customItems && resume.customItems[key]) || [];
      if (!meta || items.length === 0) return;
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
