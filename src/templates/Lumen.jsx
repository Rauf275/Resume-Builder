import { fullName, contactItems, getSectionTitle, getSectionContent, isSectionEmpty, BirthDateLine } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './lumen.css';

export default function Lumen({ resume, pageClass }) {
  const sections = useVisibleSections();
  return (
    <div className={`resume-page tpl-lumen ${pageClass}`}>
      <header className="lum-header">
        {resume.personal.photo ? (
          <img className="lum-photo" src={resume.personal.photo} alt="" />
        ) : (
          <div className="lum-photo lum-photo-empty" />
        )}
        <h1 className="lum-name">{fullName(resume.personal)}</h1>
        <BirthDateLine resume={resume} />
        <span className="lum-title-badge">{resume.personal.title}</span>
        <div className="lum-contacts">{contactItems(resume.personal).join('   ·   ')}</div>
      </header>

      {resume.about && (
        <section className="lum-card">
          <h3 className="res-section-title lum-h">About</h3>
          <p className="lum-about">{resume.about}</p>
        </section>
      )}
      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="lum-card" key={key}>
          <h3 className="res-section-title lum-h">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
