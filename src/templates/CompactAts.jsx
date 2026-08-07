import { fullName, contactItems, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './compactAts.css';

export default function CompactAts({ resume, pageClass }) {
  const sections = useVisibleSections();
  return (
    <div className={`resume-page tpl-compact ${pageClass}`}>
      <header className="cmp-header">
        <h1 className="cmp-name">{fullName(resume.personal)}</h1>
        {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
        <div className="cmp-title">{resume.personal.title}</div>
        <div className="cmp-contacts">{contactItems(resume.personal).join(' | ')}</div>
      </header>
      {resume.about && (
        <section className="cmp-block">
          <h3 className="res-section-title cmp-h">Summary</h3>
          <p className="cmp-about">{resume.about}</p>
        </section>
      )}
      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="cmp-block" key={key}>
          <h3 className="res-section-title cmp-h">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
