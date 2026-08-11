import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactRow, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './contemporary.css';

const SIDEBAR = ['skills', 'languages', 'interests'];

export default function Contemporary({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));

  return (
    <div className={`resume-page tpl-contemporary ${pageClass}`} style={{ padding: 0 }}>
      <header className="cont-banner">
        {resume.personal.photo && <img className="cont-photo" src={resume.personal.photo} alt="" />}
        <h1 className="cont-name">{fullName(resume.personal)}</h1>
        {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
        <div className="cont-title">{resume.personal.title}</div>
        <ContactRow items={contactItemsWithIcons(resume.personal)} className="cont-contacts" />
      </header>
      <div className="cont-grid" style={{ gridTemplateColumns: `1fr ${customization.columnRatio}%` }}>
        <main className="cont-main">
          {resume.about && (
            <section className="cont-block">
              <h3 className="res-section-title cont-h">About</h3>
              <p className="cont-about res-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="cont-block" key={key}>
              <h3 className="res-section-title cont-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>
        <aside className="cont-side">
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <section className="cont-block" key={key}>
              <h3 className="res-section-title cont-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}
