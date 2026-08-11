import { fullName, formatBirthDate, dateRange, formatMonth, getSectionTitle, getSectionContent, isSectionEmpty, ContactRow, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './timeline.css';

export default function Timeline({ resume, pageClass }) {
  const sections = useVisibleSections().filter((s) => s !== 'experience' && s !== 'education');

  return (
    <div className={`resume-page tpl-timeline ${pageClass}`}>
      <header className="tl-header">
        {resume.personal.photo && <img className="tl-photo" src={resume.personal.photo} alt="" />}
        <div>
          <h1 className="tl-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          <div className="tl-title">{resume.personal.title}</div>
          <ContactRow items={contactItemsWithIcons(resume.personal)} className="tl-contacts" />
        </div>
      </header>

      {resume.about && (
        <section className="tl-block">
          <p className="tl-about res-about">{resume.about}</p>
        </section>
      )}

      {resume.experience.length > 0 && (
        <section className="tl-block">
          <h3 className="res-section-title tl-h">Experience</h3>
          <div className="tl-line">
            {resume.experience.map((it) => (
              <div className="tl-node" key={it.id}>
                <div className="tl-dot" />
                <div className="tl-node-date">{dateRange(it.startDate, it.endDate, it.current)}</div>
                <div className="tl-node-title">{it.position}</div>
                <div className="tl-node-sub">{it.company}</div>
                {it.description && <p className="tl-node-desc">{it.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.education.length > 0 && (
        <section className="tl-block">
          <h3 className="res-section-title tl-h">Education</h3>
          <div className="tl-line">
            {resume.education.map((it) => (
              <div className="tl-node" key={it.id}>
                <div className="tl-dot" />
                <div className="tl-node-date">{formatMonth(it.endDate) || dateRange(it.startDate, it.endDate)}</div>
                <div className="tl-node-title">{it.school}</div>
                <div className="tl-node-sub">{[it.degree, it.field].filter(Boolean).join(', ')}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="tl-block" key={key}>
          <h3 className="res-section-title tl-h">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
