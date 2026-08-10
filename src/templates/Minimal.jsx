import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactRow, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './minimal.css';

export default function Minimal({ resume, pageClass }) {
  const sections = useVisibleSections();
  return (
    <div className={`resume-page tpl-minimal ${pageClass}`}>
      <header className="minimal-header">
        <h1 className="minimal-name">{fullName(resume.personal)}</h1>
        {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
        <div className="minimal-title">{resume.personal.title}</div>
        <ContactRow items={contactItemsWithIcons(resume.personal)} className="minimal-contacts" />
      </header>
      {resume.about && (
        <section className="minimal-block">
          <p className="minimal-about">{resume.about}</p>
        </section>
      )}
      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="minimal-block" key={key}>
          <h3 className="res-section-title minimal-title">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
