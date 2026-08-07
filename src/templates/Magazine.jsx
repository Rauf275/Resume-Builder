import { fullName, contactItems, getSectionTitle, getSectionContent, isSectionEmpty } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './magazine.css';

const SIDEBAR = ['skills', 'languages', 'certificates', 'interests'];

export default function Magazine({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));

  return (
    <div className={`resume-page tpl-magazine ${pageClass}`} style={{ padding: 0 }}>
      <div className="mag-grid" style={{ gridTemplateColumns: `${customization.columnRatio}% 1fr` }}>
        <aside className="mag-photo-col">
          {resume.personal.photo ? (
            <img className="mag-photo" src={resume.personal.photo} alt="" />
          ) : (
            <div className="mag-photo mag-photo-empty" />
          )}
          <div className="mag-photo-overlay">
            <h1 className="mag-name">{fullName(resume.personal)}</h1>
            <div className="mag-title">{resume.personal.title}</div>
          </div>
        </aside>

        <div className="mag-main">
          <div className="mag-contacts">{contactItems(resume.personal).map((c, i) => <span key={i}>{c}</span>)}</div>

          {resume.about && (
            <section className="mag-block">
              <h3 className="res-section-title mag-h">About</h3>
              <p className="mag-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="mag-block" key={key}>
              <h3 className="res-section-title mag-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <section className="mag-block" key={key}>
              <h3 className="res-section-title mag-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
