import { fullName, getSectionTitle, getSectionContent, isSectionEmpty, BirthDateLine, ContactList, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './atlas.css';

const SIDEBAR = ['skills', 'languages', 'certificates', 'interests'];

export default function Atlas({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));

  return (
    <div className={`resume-page tpl-atlas ${pageClass}`} style={{ padding: 0 }}>
      <div className="atlas-grid" style={{ gridTemplateColumns: `${customization.columnRatio}% 1fr` }}>
        <aside className="atlas-side">
          <div className="atlas-card">
            {resume.personal.photo ? (
              <img className="atlas-photo" src={resume.personal.photo} alt="" />
            ) : (
              <div className="atlas-photo atlas-photo-empty" />
            )}
            <div className="atlas-name">{fullName(resume.personal)}</div>
            <BirthDateLine resume={resume} />
            <div className="atlas-title">{resume.personal.title}</div>
          </div>
          <ContactList items={contactItemsWithIcons(resume.personal)} className="atlas-contacts" />
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <section className="atlas-block" key={key}>
              <h3 className="res-section-title atlas-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </aside>
        <main className="atlas-main">
          {resume.about && (
            <section className="atlas-block">
              <h3 className="res-section-title atlas-h-main">About</h3>
              <p className="atlas-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="atlas-block" key={key}>
              <h3 className="res-section-title atlas-h-main">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
