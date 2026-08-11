import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactList, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './bulletin.css';

const SIDEBAR = ['skills', 'languages', 'certificates', 'interests'];

export default function Bulletin({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));
  const sideWidth = customization.columnRatio;

  return (
    <div className={`resume-page tpl-bulletin ${pageClass}`} style={{ padding: 0 }}>
      <div className="bul-grid" style={{ gridTemplateColumns: `${sideWidth}% 1fr` }}>
        <aside className="bul-side">
          {resume.personal.photo && (
            <div className="bul-photo-card">
              <img className="bul-photo" src={resume.personal.photo} alt="" />
            </div>
          )}
          <h1 className="bul-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          {resume.personal.title && <div className="bul-title">{resume.personal.title}</div>}
          <div className="bul-contacts">
            <ContactList items={contactItemsWithIcons(resume.personal)} className="" />
          </div>
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <div className="bul-side-section" key={key}>
              <h3 className="res-section-title bul-side-title">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </div>
          ))}
        </aside>
        <main className="bul-main">
          {resume.about && (
            <section className="bul-block">
              <h3 className="res-section-title bul-h">About</h3>
              <p className="bul-about res-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="bul-block" key={key}>
              <h3 className="res-section-title bul-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
