import { fullName, contactItems, getSectionTitle, getSectionContent, isSectionEmpty } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './modern.css';

const SIDEBAR = ['skills', 'languages', 'interests', 'certificates'];

export default function Modern({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));
  const sideWidth = customization.columnRatio;

  return (
    <div className={`resume-page tpl-modern ${pageClass}`} style={{ padding: 0 }}>
      <div className="modern-grid" style={{ gridTemplateColumns: `${sideWidth}% 1fr` }}>
        <aside className="modern-side">
          {resume.personal.photo && (
            <img className="modern-photo" src={resume.personal.photo} alt="" />
          )}
          <h1 className="modern-name">{fullName(resume.personal)}</h1>
          <div className="modern-title">{resume.personal.title}</div>
          <div className="modern-contacts">
            {contactItems(resume.personal).map((c, i) => <div key={i}>{c}</div>)}
          </div>
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <div className="modern-side-section" key={key}>
              <h3 className="res-section-title modern-side-title">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </div>
          ))}
        </aside>
        <main className="modern-main">
          {resume.about && (
            <section className="modern-block">
              <h3 className="res-section-title modern-main-title">About</h3>
              <p className="modern-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="modern-block" key={key}>
              <h3 className="res-section-title modern-main-title">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
