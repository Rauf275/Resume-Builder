import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactList, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './nova.css';

const SIDEBAR = ['skills', 'languages', 'certificates', 'interests'];

export default function Nova({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));
  const sideWidth = customization.columnRatio;

  return (
    <div className={`resume-page tpl-nova ${pageClass}`} style={{ padding: 0 }}>
      <header className="nova-headerbar">
        <h1 className="nova-name">{fullName(resume.personal)}</h1>
        {resume.personal.birthDate && <div className="res-birthdate nova-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
        {resume.personal.title && <div className="nova-title">{resume.personal.title}</div>}
      </header>

      <div className="nova-grid" style={{ gridTemplateColumns: `1fr ${sideWidth}%` }}>
        <main className="nova-main">
          {resume.about && (
            <section className="nova-block">
              <h3 className="res-section-title nova-h">About</h3>
              <p className="nova-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="nova-block" key={key}>
              <h3 className="res-section-title nova-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>

        <aside className="nova-side">
          {resume.personal.photo && (
            <div className="nova-photo-ring">
              <img className="nova-photo" src={resume.personal.photo} alt="" />
            </div>
          )}
          <div className="nova-contacts">
            <ContactList items={contactItemsWithIcons(resume.personal)} className="" />
          </div>
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <div className="nova-side-section" key={key}>
              <h3 className="res-section-title nova-side-title">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
