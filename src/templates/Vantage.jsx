import { fullName, getSectionTitle, getSectionContent, isSectionEmpty, BirthDateLine, ContactRow, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './vantage.css';

const SIDEBAR = ['skills', 'languages', 'certificates'];

export default function Vantage({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));

  return (
    <div className={`resume-page tpl-vantage ${pageClass}`} style={{ padding: 0 }}>
      <header className="vtg-header">
        <div className="vtg-diagonal" />
        {resume.personal.photo ? (
          <img className="vtg-photo" src={resume.personal.photo} alt="" />
        ) : (
          <div className="vtg-photo vtg-photo-empty" />
        )}
        <div className="vtg-text">
          <h1 className="vtg-name">{fullName(resume.personal)}</h1>
          <BirthDateLine resume={resume} />
          <div className="vtg-title">{resume.personal.title}</div>
          <ContactRow items={contactItemsWithIcons(resume.personal)} className="vtg-contacts" />
        </div>
      </header>

      <div className="vtg-grid" style={{ gridTemplateColumns: `${customization.columnRatio}% 1fr` }}>
        <aside className="vtg-side">
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <section className="vtg-block" key={key}>
              <h3 className="res-section-title vtg-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </aside>
        <main className="vtg-main">
          {resume.about && (
            <section className="vtg-block">
              <h3 className="res-section-title vtg-h">Profile</h3>
              <p className="vtg-about res-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="vtg-block" key={key}>
              <h3 className="res-section-title vtg-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
