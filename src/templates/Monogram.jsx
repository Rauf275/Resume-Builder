import { fullName, contactItems, getSectionTitle, getSectionContent, isSectionEmpty, BirthDateLine } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './monogram.css';

export default function Monogram({ resume, pageClass }) {
  const sections = useVisibleSections();
  return (
    <div className={`resume-page tpl-monogram ${pageClass}`}>
      <header className="mono-header">
        {resume.personal.photo ? (
          <img className="mono-photo" src={resume.personal.photo} alt="" />
        ) : (
          <div className="mono-photo mono-photo-empty" />
        )}
        <div className="mono-text">
          <h1 className="mono-name">{fullName(resume.personal)}</h1>
          <BirthDateLine resume={resume} />
          <div className="mono-title">{resume.personal.title}</div>
          <div className="mono-contacts">{contactItems(resume.personal).join('   ·   ')}</div>
        </div>
      </header>
      <div className="mono-rule" />

      {resume.about && (
        <section className="mono-block">
          <h3 className="res-section-title mono-h">Profile</h3>
          <p className="mono-about">{resume.about}</p>
        </section>
      )}
      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="mono-block" key={key}>
          <h3 className="res-section-title mono-h">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
