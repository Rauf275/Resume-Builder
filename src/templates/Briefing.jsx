import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactRow, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './briefing.css';

export default function Briefing({ resume, pageClass }) {
  const sections = useVisibleSections();

  return (
    <div className={`resume-page tpl-briefing ${pageClass}`}>
      <div className="bri-top">
        {resume.personal.photo && <img className="bri-photo" src={resume.personal.photo} alt="" />}
        <div className="bri-heading">
          <h1 className="bri-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          {resume.personal.title && <div className="bri-title">{resume.personal.title}</div>}
        </div>
      </div>

      <div className="bri-strip">
        <ContactRow items={contactItemsWithIcons(resume.personal)} itemClassName="bri-pill" />
      </div>

      {resume.about && (
        <section className="bri-card">
          <h3 className="res-section-title bri-h">About</h3>
          <p className="bri-about res-about">{resume.about}</p>
        </section>
      )}
      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="bri-card" key={key}>
          <h3 className="res-section-title bri-h">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
