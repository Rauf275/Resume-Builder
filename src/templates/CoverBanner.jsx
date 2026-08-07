import { fullName, contactItems, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './coverBanner.css';

const SIDEBAR = ['skills', 'languages', 'certificates'];

export default function CoverBanner({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));

  return (
    <div className={`resume-page tpl-coverbanner ${pageClass}`} style={{ padding: 0 }}>
      <header className="cb-banner">
        {resume.personal.photo ? (
          <img className="cb-photo" src={resume.personal.photo} alt="" />
        ) : (
          <div className="cb-photo cb-photo-empty" />
        )}
        <div className="cb-heading">
          <h1 className="cb-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          <div className="cb-title">{resume.personal.title}</div>
          <div className="cb-contacts">{contactItems(resume.personal).join('   ·   ')}</div>
        </div>
      </header>

      <div className="cb-grid" style={{ gridTemplateColumns: `1fr ${customization.columnRatio}%` }}>
        <main className="cb-main">
          {resume.about && (
            <section className="cb-block">
              <h3 className="res-section-title cb-h">Profile</h3>
              <p className="cb-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="cb-block" key={key}>
              <h3 className="res-section-title cb-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>
        <aside className="cb-side">
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <section className="cb-block" key={key}>
              <h3 className="res-section-title cb-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}
