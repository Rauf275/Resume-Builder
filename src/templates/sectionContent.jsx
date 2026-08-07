export function formatMonth(value) {
  if (!value) return '';
  const [y, m] = value.split('-');
  if (!m) return y;
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function dateRange(start, end, current) {
  const s = formatMonth(start);
  const e = current ? 'Present' : formatMonth(end);
  if (!s && !e) return '';
  return `${s} — ${e}`;
}

export function formatBirthDate(value) {
  if (!value) return '';
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return value;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function fullName(personal) {
  return [personal.firstName, personal.lastName].filter(Boolean).join(' ');
}

export function contactItems(personal) {
  return [
    personal.email,
    personal.phone,
    personal.address,
    personal.github,
    personal.linkedin,
    personal.website,
    personal.telegram,
  ].filter(Boolean);
}

export function ExperienceItems({ items }) {
  return items.map((it) => (
    <div className="res-item" key={it.id}>
      <div className="res-item-top">
        <span className="res-item-title">{it.position}</span>
        <span className="res-item-date">{dateRange(it.startDate, it.endDate, it.current)}</span>
      </div>
      <div className="res-item-sub">{it.company}</div>
      {it.description && <p className="res-item-desc">{it.description}</p>}
    </div>
  ));
}

export function EducationItems({ items }) {
  return items.map((it) => (
    <div className="res-item" key={it.id}>
      <div className="res-item-top">
        <span className="res-item-title">{it.school}</span>
        <span className="res-item-date">{dateRange(it.startDate, it.endDate, false)}</span>
      </div>
      <div className="res-item-sub">{[it.degree, it.field].filter(Boolean).join(', ')}</div>
      {it.description && <p className="res-item-desc">{it.description}</p>}
    </div>
  ));
}

export function CertificateItems({ items }) {
  return items.map((it) => (
    <div className="res-item" key={it.id}>
      <div className="res-item-top">
        <span className="res-item-title">{it.name}</span>
        <span className="res-item-date">{formatMonth(it.date)}</span>
      </div>
      <div className="res-item-sub">{it.issuer}</div>
    </div>
  ));
}

export function ProjectItems({ items }) {
  return items.map((it) => (
    <div className="res-item" key={it.id}>
      <div className="res-item-top">
        <span className="res-item-title">{it.name}</span>
      </div>
      {it.description && <p className="res-item-desc">{it.description}</p>}
      <div className="res-item-links">
        {it.github && <span>{it.github}</span>}
        {it.demo && <span>{it.demo}</span>}
      </div>
    </div>
  ));
}

export function LanguageItems({ items }) {
  return (
    <div className="res-lang-list">
      {items.map((it) => (
        <div className="res-lang-item" key={it.id}>
          <span>{it.name}</span>
          <span className="res-lang-level">{it.level}</span>
        </div>
      ))}
    </div>
  );
}

export function TagList({ items }) {
  return (
    <div className="res-tags">
      {items.map((t, i) => (
        <span className="res-tag" key={i}>{t}</span>
      ))}
    </div>
  );
}

export function CustomItems({ items }) {
  return items.map((it) => (
    <div className="res-item" key={it.id}>
      <div className="res-item-top">
        <span className="res-item-title">{it.title}</span>
        {it.date && <span className="res-item-date">{it.date}</span>}
      </div>
      {it.subtitle && <div className="res-item-sub">{it.subtitle}</div>}
      {it.description && <p className="res-item-desc">{it.description}</p>}
    </div>
  ));
}

export const SECTION_RENDERERS = {
  experience: (resume) => <ExperienceItems items={resume.experience} />,
  education: (resume) => <EducationItems items={resume.education} />,
  certificates: (resume) => <CertificateItems items={resume.certificates} />,
  projects: (resume) => <ProjectItems items={resume.projects} />,
  languages: (resume) => <LanguageItems items={resume.languages} />,
  skills: (resume) => <TagList items={resume.skills} />,
  interests: (resume) => <TagList items={resume.interests} />,
};

export const SECTION_TITLES = {
  experience: 'Experience',
  education: 'Education',
  certificates: 'Certificates',
  projects: 'Projects',
  languages: 'Languages',
  skills: 'Skills',
  interests: 'Interests',
};

function isCustomKey(key) {
  return typeof key === 'string' && key.startsWith('custom-');
}

export function getSectionTitle(resume, key) {
  if (isCustomKey(key)) {
    const meta = (resume.customSections || []).find((s) => s.id === key);
    return meta?.title || 'Custom section';
  }
  return SECTION_TITLES[key] || '';
}

export function getSectionContent(resume, key) {
  if (isCustomKey(key)) {
    const items = (resume.customItems && resume.customItems[key]) || [];
    return <CustomItems items={items} />;
  }
  return SECTION_RENDERERS[key] ? SECTION_RENDERERS[key](resume) : null;
}

export function isSectionEmpty(resume, key) {
  if (isCustomKey(key)) {
    const items = (resume.customItems && resume.customItems[key]) || [];
    return items.length === 0;
  }
  const v = resume[key];
  return Array.isArray(v) ? v.length === 0 : !v;
}
