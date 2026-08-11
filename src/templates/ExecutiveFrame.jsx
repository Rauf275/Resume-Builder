import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactList, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './executiveFrame.css';

export default function ExecutiveFrame({ resume, pageClass }) {
  const sections = useVisibleSections();
  return (
    <div className={`resume-page tpl-execframe ${pageClass}`}>
      <header className="ef-header">
        <div className="ef-text">
          <h1 className="ef-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          <div className="ef-title">{resume.personal.title}</div>
          <ContactList items={contactItemsWithIcons(resume.personal)} className="ef-contacts" />
        </div>
        <div className="ef-frame">
          {resume.personal.photo ? (
            <img className="ef-photo" src={resume.personal.photo} alt="" />
          ) : (
            <div className="ef-photo ef-photo-empty" />
          )}
        </div>
      </header>
      <div className="ef-rule" />

      {resume.about && (
        <section className="ef-block">
          <p className="ef-about res-about">{resume.about}</p>
        </section>
      )}

      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="ef-block" key={key}>
          <h3 className="res-section-title ef-h">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
