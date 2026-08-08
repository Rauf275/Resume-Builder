import { fullName, contactItems, getSectionTitle, getSectionContent, isSectionEmpty } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './foundry.css';

const LEFT = ['skills', 'languages', 'certificates'];

export default function Foundry({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const left = sections.filter((s) => LEFT.includes(s));
  const right = sections.filter((s) => !LEFT.includes(s));

  return (
    <div className={`resume-page tpl-foundry ${pageClass}`} style={{ padding: 0 }}>
      <header className="fnd-bar">
        {resume.personal.photo ? (
          <img className="fnd-photo" src={resume.personal.photo} alt="" />
        ) : (
          <div className="fnd-photo fnd-photo-empty" />
        )}
        <div className="fnd-id">
          <div className="fnd-name">{fullName(resume.personal)}</div>
          <div className="fnd-title">{resume.personal.title}</div>
        </div>
        <div className="fnd-contacts">{contactItems(resume.personal).map((c, i) => <div key={i}>{c}</div>)}</div>
      </header>

      <div className="fnd-grid" style={{ gridTemplateColumns: `${customization.columnRatio}% 1fr` }}>
        <div className="fnd-col">
          {left.map((key) => !isSectionEmpty(resume, key) && (
            <section className="fnd-block" key={key}>
              <h3 className="res-section-title fnd-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </div>
        <div className="fnd-col">
          {resume.about && (
            <section className="fnd-block">
              <h3 className="res-section-title fnd-h">About</h3>
              <p className="fnd-about">{resume.about}</p>
            </section>
          )}
          {right.map((key) => !isSectionEmpty(resume, key) && (
            <section className="fnd-block" key={key}>
              <h3 className="res-section-title fnd-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
