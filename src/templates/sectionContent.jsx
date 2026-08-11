import { Mail, Phone, MapPin, Globe, Send } from 'lucide-react';
import { GithubMark, LinkedinMark } from '../components/icons/BrandIcons';

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

// Drop this next to the name in every template's header. Centralizing it
// here means the "Date of birth" line always looks/behaves the same, and —
// paired with the dev-time check in TemplateRenderer.jsx — any new template
// that forgets to render it gets flagged immediately instead of silently
// shipping without a birth date.
export function BirthDateLine({ resume }) {
  if (!resume.personal.birthDate) return null;
  return <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>;
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

// One icon per contact type, used consistently everywhere a resume shows contact info —
// large, bold, and colored with the template's own accent (never a generic small gray
// glyph), so it reads clearly both on screen and in the exported PDF.
export function contactItemsWithIcons(personal) {
  const rows = [
    { key: 'email', Icon: Mail, text: personal.email },
    { key: 'phone', Icon: Phone, text: personal.phone },
    { key: 'address', Icon: MapPin, text: personal.address },
    { key: 'github', Icon: GithubMark, text: personal.github },
    { key: 'linkedin', Icon: LinkedinMark, text: personal.linkedin },
    { key: 'website', Icon: Globe, text: personal.website },
    { key: 'telegram', Icon: Send, text: personal.telegram },
  ];
  return rows.filter((r) => r.text);
}

function ContactItem({ Icon, text, itemClassName = '' }) {
  return (
    <span className={`res-contact-item ${itemClassName}`}>
      <Icon size={15} strokeWidth={2.25} className="res-contact-icon" />
      <span className="res-contact-text">{text}</span>
    </span>
  );
}

// Wrapping horizontal row — for header/banner-style contact lines that used to be a
// plain `.join(' · ')` string.
export function ContactRow({ items, className = '', itemClassName = '' }) {
  return (
    <div className={`res-contact-row ${className}`}>
      {items.map((it) => <ContactItem key={it.key} Icon={it.Icon} text={it.text} itemClassName={itemClassName} />)}
    </div>
  );
}

// One entry per line — for sidebar-style contact blocks that used to `.map` a <div> per line.
export function ContactList({ items, className = '', itemClassName = '' }) {
  return (
    <div className={`res-contact-list ${className}`}>
      {items.map((it) => <ContactItem key={it.key} Icon={it.Icon} text={it.text} itemClassName={itemClassName} />)}
    </div>
  );
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

// Tag-style custom sections (mini colored pills) are opted into via
// `meta.type === 'tags'` and store their values in `resume.customTags`,
// separate from the entry-card sections in `resume.customItems`.
function isCustomTagSection(resume, key) {
  const meta = (resume.customSections || []).find((s) => s.id === key);
  return meta?.type === 'tags';
}

export function getSectionContent(resume, key) {
  if (isCustomKey(key)) {
    if (isCustomTagSection(resume, key)) {
      const tags = (resume.customTags && resume.customTags[key]) || [];
      return <TagList items={tags} />;
    }
    const items = (resume.customItems && resume.customItems[key]) || [];
    return <CustomItems items={items} />;
  }
  return SECTION_RENDERERS[key] ? SECTION_RENDERERS[key](resume) : null;
}

export function isSectionEmpty(resume, key) {
  if (isCustomKey(key)) {
    if (isCustomTagSection(resume, key)) {
      const tags = (resume.customTags && resume.customTags[key]) || [];
      return tags.length === 0;
    }
    const items = (resume.customItems && resume.customItems[key]) || [];
    return items.length === 0;
  }
  const v = resume[key];
  return Array.isArray(v) ? v.length === 0 : !v;
}
