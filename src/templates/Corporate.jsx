import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactList, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './corporate.css';

const SIDEBAR = ['skills', 'languages', 'certificates'];

export default function Corporate({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));

  return (
    <div className={`resume-page tpl-corporate ${pageClass}`} style={{ padding: 0 }}>
      <header className="corp-bar">
        <div>
          <h1 className="corp-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          <div className="corp-title">{resume.personal.title}</div>
        </div>
        <ContactList items={contactItemsWithIcons(resume.personal)} className="corp-contacts" />
      </header>
      <div className="corp-grid" style={{ gridTemplateColumns: `1fr ${customization.columnRatio}%` }}>
        <main className="corp-main">
          {resume.about && (
            <section className="corp-block">
              <h3 className="res-section-title corp-h">Profile</h3>
              <p className="corp-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="corp-block" key={key}>
              <h3 className="res-section-title corp-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>
        <aside className="corp-side">
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <section className="corp-block" key={key}>
              <h3 className="res-section-title corp-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}
