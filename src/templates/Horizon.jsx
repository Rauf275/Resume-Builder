import { fullName, getSectionTitle, getSectionContent, isSectionEmpty, BirthDateLine, ContactRow, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './horizon.css';

const SIDEBAR = ['skills', 'languages', 'certificates', 'interests'];

export default function Horizon({ resume, customization, pageClass }) {
  const sections = useVisibleSections();
  const main = sections.filter((s) => !SIDEBAR.includes(s));
  const side = sections.filter((s) => SIDEBAR.includes(s));

  return (
    <div className={`resume-page tpl-horizon ${pageClass}`} style={{ padding: 0 }}>
      <div className="hz-banner" />
      <div className="hz-identity">
        {resume.personal.photo ? (
          <img className="hz-photo" src={resume.personal.photo} alt="" />
        ) : (
          <div className="hz-photo hz-photo-empty" />
        )}
        <h1 className="hz-name">{fullName(resume.personal)}</h1>
        <BirthDateLine resume={resume} />
        <div className="hz-title">{resume.personal.title}</div>
        <ContactRow items={contactItemsWithIcons(resume.personal)} className="hz-contacts" />
      </div>

      <div className="hz-grid" style={{ gridTemplateColumns: `1fr ${customization.columnRatio}%` }}>
        <main className="hz-main">
          {resume.about && (
            <section className="hz-block">
              <h3 className="res-section-title hz-h">About</h3>
              <p className="hz-about res-about">{resume.about}</p>
            </section>
          )}
          {main.map((key) => !isSectionEmpty(resume, key) && (
            <section className="hz-block" key={key}>
              <h3 className="res-section-title hz-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </main>
        <aside className="hz-side">
          {side.map((key) => !isSectionEmpty(resume, key) && (
            <section className="hz-block" key={key}>
              <h3 className="res-section-title hz-h">{getSectionTitle(resume, key)}</h3>
              {getSectionContent(resume, key)}
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}
