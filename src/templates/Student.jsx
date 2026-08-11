import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactRow, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './student.css';

export default function Student({ resume, pageClass }) {
  const sections = useVisibleSections();
  // Education-first ordering: pull education to the front regardless of user's global order.
  const ordered = ['education', ...sections.filter((s) => s !== 'education')];

  return (
    <div className={`resume-page tpl-student ${pageClass}`}>
      <header className="stu-header">
        {resume.personal.photo && <img className="stu-photo" src={resume.personal.photo} alt="" />}
        <div>
          <h1 className="stu-name">{fullName(resume.personal)}</h1>
          {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
          <div className="stu-title">{resume.personal.title}</div>
          <ContactRow items={contactItemsWithIcons(resume.personal)} className="stu-contacts" />
        </div>
      </header>
      {resume.about && (
        <section className="stu-block">
          <h3 className="res-section-title stu-h">About me</h3>
          <p className="stu-about res-about">{resume.about}</p>
        </section>
      )}
      {ordered.map((key) => !isSectionEmpty(resume, key) && (
        <section className="stu-block" key={key}>
          <h3 className="res-section-title stu-h">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
