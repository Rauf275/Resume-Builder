import { fullName, contactItems, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './dark.css';

const SIDEBAR = ['skills', 'languages', 'interests', 'certificates'];

export default function Dark({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));

  return (
    <div className={`resume-page tpl-dark ${pageClass}`} style={{ padding: 0 }}>
      <div className="dark-grid" style={{ gridTemplateColumns: `1fr ${customization.columnRatio}%` }}>
        <main className="dark-main">
          <h1 className="dark-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          <div className="dark-title">{resume.personal.title}</div>
          {resume.about && (
            <section className="dark-block">
              <h3 className="res-section-title dark-h">About</h3>
              <p className="dark-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="dark-block" key={key}>
              <h3 className="res-section-title dark-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>
        <aside className="dark-side">
          {resume.personal.photo && <img className="dark-photo" src={resume.personal.photo} alt="" />}
          <div className="dark-contacts">
            {contactItems(resume.personal).map((c, i) => <div key={i}>{c}</div>)}
          </div>
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <div className="dark-side-section" key={key}>
              <h3 className="res-section-title dark-side-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
