import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactRow, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './skyline.css';

export default function Skyline({ resume, pageClass }) {
  const sections = useVisibleSections();
  return (
    <div className={`resume-page tpl-skyline ${pageClass}`}>
      <header className="sky-header">
        {resume.personal.photo && <img className="sky-photo" src={resume.personal.photo} alt="" />}
        <div className="sky-identity">
          <h1 className="sky-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          {resume.personal.title && <div className="sky-title">{resume.personal.title}</div>}
          <div className="sky-contacts">
            <ContactRow items={contactItemsWithIcons(resume.personal)} className="" />
          </div>
        </div>
      </header>

      {resume.about && (
        <section className="sky-block">
          <p className="sky-about res-about">{resume.about}</p>
        </section>
      )}

      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="sky-block" key={key}>
          <h3 className="res-section-title sky-h">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
