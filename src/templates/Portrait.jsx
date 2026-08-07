import { fullName, contactItems, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './portrait.css';

export default function Portrait({ resume, pageClass }) {
  const sections = useVisibleSections();
  return (
    <div className={`resume-page tpl-portrait ${pageClass}`}>
      <header className="port-header">
        {resume.personal.photo ? (
          <img className="port-photo" src={resume.personal.photo} alt="" />
        ) : (
          <div className="port-photo port-photo-empty" />
        )}
        <h1 className="port-name">{fullName(resume.personal)}</h1>
        {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
        <div className="port-title">{resume.personal.title}</div>
        <div className="port-rule" />
        <div className="port-contacts">{contactItems(resume.personal).join('   ·   ')}</div>
      </header>

      {resume.about && (
        <section className="port-block">
          <h3 className="res-section-title port-h">About</h3>
          <p className="port-about">{resume.about}</p>
        </section>
      )}

      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="port-block" key={key}>
          <h3 className="res-section-title port-h">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
