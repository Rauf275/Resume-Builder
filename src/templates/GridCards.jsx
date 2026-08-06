import { fullName, contactItems, getSectionTitle, getSectionContent, isSectionEmpty } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './gridCards.css';

const WIDE = ['experience', 'education', 'projects'];

export default function GridCards({ resume, pageClass }) {
  const sections = useVisibleSections();
  return (
    <div className={`resume-page tpl-gridcards ${pageClass}`}>
      <header className="gc-header">
        {resume.personal.photo && <img className="gc-photo" src={resume.personal.photo} alt="" />}
        <div>
          <h1 className="gc-name">{fullName(resume.personal)}</h1>
          <div className="gc-title">{resume.personal.title}</div>
          <div className="gc-contacts">{contactItems(resume.personal).join('  ·  ')}</div>
        </div>
      </header>

      {resume.about && (
        <div className="gc-card gc-wide">
          <h3 className="res-section-title gc-h">About</h3>
          <p className="gc-about">{resume.about}</p>
        </div>
      )}

      <div className="gc-grid">
        {sections.map((key) => !isSectionEmpty(resume, key) && (
          <div className={`gc-card ${WIDE.includes(key) ? 'gc-wide' : ''}`} key={key}>
            <h3 className="res-section-title gc-h">{getSectionTitle(resume, key)}</h3>
            {getSectionContent(resume, key)}
          </div>
        ))}
      </div>
    </div>
  );
}
