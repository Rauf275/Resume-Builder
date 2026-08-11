import { fullName, formatBirthDate, getSectionTitle, getSectionContent, isSectionEmpty, ContactRow, contactItemsWithIcons } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './elegant.css';

export default function Elegant({ resume, pageClass }) {
  const sections = useVisibleSections();
  return (
    <div className={`resume-page tpl-elegant ${pageClass}`}>
      <header className="eleg-header">
        {resume.personal.photo && <img className="eleg-photo" src={resume.personal.photo} alt="" />}
        <h1 className="eleg-name">{fullName(resume.personal)}</h1>
        {resume.personal.birthDate && <div className="res-birthdate">Date of birth: {formatBirthDate(resume.personal.birthDate)}</div>}
        <div className="eleg-title">{resume.personal.title}</div>
        <div className="eleg-rule" />
        <ContactRow items={contactItemsWithIcons(resume.personal)} className="eleg-contacts" />
      </header>
      {resume.about && (
        <section className="eleg-block">
          <p className="eleg-about res-about">{resume.about}</p>
        </section>
      )}
      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="eleg-block" key={key}>
          <h3 className="res-section-title eleg-h"><span>{getSectionTitle(resume, key)}</span></h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
