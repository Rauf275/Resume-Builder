import { fullName, contactItems, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './halo.css';

export default function Halo({ resume, pageClass }) {
  const sections = useVisibleSections();

  return (
    <div className={`resume-page tpl-halo ${pageClass}`}>
      <header className="halo-header">
        {resume.personal.photo && (
          <div className="halo-photo-ring">
            <img className="halo-photo" src={resume.personal.photo} alt="" />
          </div>
        )}
        <h1 className="halo-name">{fullName(resume.personal)}</h1>
        {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
        {resume.personal.title && <div className="halo-title">{resume.personal.title}</div>}
        <div className="halo-contacts">
          {contactItems(resume.personal).map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </header>

      {resume.about && (
        <section className="halo-block">
          <h3 className="res-section-title halo-h">About</h3>
          <p className="halo-about">{resume.about}</p>
        </section>
      )}
      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="halo-block" key={key}>
          <h3 className="res-section-title halo-h">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
