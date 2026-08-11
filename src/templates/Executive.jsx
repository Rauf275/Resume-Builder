import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactList, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './executive.css';

export default function Executive({ resume, pageClass }) {
  const sections = useVisibleSections();
  return (
    <div className={`resume-page tpl-executive ${pageClass}`}>
      <header className="exec-header">
        <div className="exec-header-row">
          <h1 className="exec-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          <ContactList items={contactItemsWithIcons(resume.personal)} className="exec-contacts" />
        </div>
        <div className="exec-title">{resume.personal.title}</div>
      </header>
      {resume.about && (
        <section className="exec-block">
          <p className="exec-about res-about">{resume.about}</p>
        </section>
      )}
      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="exec-block" key={key}>
          <h3 className="res-section-title exec-title-h">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
