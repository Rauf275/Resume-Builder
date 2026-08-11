import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactRow, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './twoColumnTech.css';

const LEFT = ['skills', 'languages', 'education', 'certificates'];

export default function TwoColumnTech({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const left = sections.filter((s) => LEFT.includes(s));
  const right = sections.filter((s) => !LEFT.includes(s));

  return (
    <div className={`resume-page tpl-tech ${pageClass}`}>
      <header className="tech-header">
        <h1 className="tech-name">{fullName(resume.personal)}</h1>
        {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
        <div className="tech-title">{resume.personal.title}</div>
        <ContactRow items={contactItemsWithIcons(resume.personal)} className="tech-contacts" />
      </header>
      <div className="tech-grid" style={{ gridTemplateColumns: `${customization.columnRatio}% 1fr` }}>
        <div className="tech-left">
          {left.map((key) => !isSectionEmpty(resume, key) && (
            <section className="tech-block" key={key}>
              <h3 className="res-section-title tech-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </div>
        <div className="tech-right">
          {resume.about && (
            <section className="tech-block">
              <h3 className="res-section-title tech-h">About</h3>
              <p className="tech-about res-about">{resume.about}</p>
            </section>
          )}
          {right.map((key) => !isSectionEmpty(resume, key) && (
            <section className="tech-block" key={key}>
              <h3 className="res-section-title tech-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
