import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactList, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './ledger.css';

const SIDEBAR = ['skills', 'languages', 'certificates', 'interests'];

export default function Ledger({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));
  const sideWidth = customization.columnRatio;

  return (
    <div className={`resume-page tpl-ledger ${pageClass}`} style={{ padding: 0 }}>
      <div className="led-grid" style={{ gridTemplateColumns: `${sideWidth}% 1fr` }}>
        <aside className="led-side">
          <div className="led-id-card">
            {resume.personal.photo && <img className="led-photo" src={resume.personal.photo} alt="" />}
            <h1 className="led-name">{fullName(resume.personal)}</h1>
            {resume.personal.birthDate && <div className="res-birthdate led-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
            {resume.personal.title && <div className="led-title">{resume.personal.title}</div>}
          </div>

          <div className="led-contacts">
            <ContactList items={contactItemsWithIcons(resume.personal)} className="led-contact-row" />
          </div>

          {side.map((key) => !isSectionEmpty(resume, key) && (
            <div className="led-side-section" key={key}>
              <h3 className="res-section-title led-side-title">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </div>
          ))}
        </aside>

        <main className="led-main">
          {resume.about && (
            <section className="led-block">
              <h3 className="res-section-title led-h">About</h3>
              <p className="led-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="led-block" key={key}>
              <h3 className="res-section-title led-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
