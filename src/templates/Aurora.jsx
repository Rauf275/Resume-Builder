import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactList, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './aurora.css';

const SIDEBAR = ['skills', 'languages', 'interests', 'certificates'];

export default function Aurora({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));
  const sideWidth = customization.columnRatio;

  return (
    <div className={`resume-page tpl-aurora ${pageClass}`} style={{ padding: 0 }}>
      <div className="aur-grid" style={{ gridTemplateColumns: `${sideWidth}% 1fr` }}>
        <aside className="aur-side">
          {resume.personal.photo && (
            <div className="aur-photo-ring">
              <img className="aur-photo" src={resume.personal.photo} alt="" />
            </div>
          )}
          <h1 className="aur-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          {resume.personal.title && <div className="aur-title">{resume.personal.title}</div>}
          <div className="aur-contacts">
            <ContactList items={contactItemsWithIcons(resume.personal)} className="" />
          </div>
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <div className="aur-side-section" key={key}>
              <h3 className="res-section-title aur-side-title">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </div>
          ))}
        </aside>
        <main className="aur-main">
          {resume.about && (
            <section className="aur-block">
              <h3 className="res-section-title aur-main-title">About</h3>
              <p className="aur-about res-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="aur-block" key={key}>
              <h3 className="res-section-title aur-main-title">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
