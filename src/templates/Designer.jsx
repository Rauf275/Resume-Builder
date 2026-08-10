import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactList, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './designer.css';

const SIDEBAR = ['skills', 'languages', 'interests'];
const DEFAULT_CUSTOMIZATION = { columnRatio: 34 };

export default function Designer({ resume, customization, pageClass }) {
  const safeCustomization = customization ?? DEFAULT_CUSTOMIZATION;
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));

  return (
    <div className={`resume-page tpl-designer ${pageClass}`} style={{ padding: 0 }}>
      <header className="designer-header">
        <div className="designer-header-accent" />
        {resume.personal.photo && <img className="designer-photo" src={resume.personal.photo} alt="" />}
        <div>
          <h1 className="designer-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          <div className="designer-title">{resume.personal.title}</div>
        </div>
      </header>
      <div className="designer-body" style={{ gridTemplateColumns: `1fr ${safeCustomization.columnRatio}%` }}>
        <div className="designer-main">
          {resume.about && (
            <section className="designer-block">
              <h3 className="res-section-title designer-h">Profile</h3>
              <p className="designer-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="designer-block" key={key}>
              <h3 className="res-section-title designer-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </div>
        <aside className="designer-side">
          <div className="designer-contacts">
            <ContactList items={contactItemsWithIcons(resume.personal)} className="" />
          </div>
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <div className="designer-block" key={key}>
              <h3 className="res-section-title designer-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
