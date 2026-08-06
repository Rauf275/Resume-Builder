import { fullName, contactItems, getSectionTitle, getSectionContent, isSectionEmpty } from './sectionContent';
import { useVisibleSections } from './useVisibleSections';
import './harvard.css';

export default function Harvard({ resume, pageClass }) {
  const sections = useVisibleSections();
  return (
    <div className={`resume-page tpl-harvard ${pageClass}`}>
      <header className="harvard-header">
        <h1 className="harvard-name">{fullName(resume.personal)}</h1>
        <div className="harvard-contacts">{contactItems(resume.personal).join(' | ')}</div>
      </header>
      {resume.about && (
        <section className="harvard-block">
          <h3 className="res-section-title harvard-title">Summary</h3>
          <p className="harvard-about">{resume.about}</p>
        </section>
      )}
      {sections.map((key) => !isSectionEmpty(resume, key) && (
        <section className="harvard-block" key={key}>
          <h3 className="res-section-title harvard-title">{getSectionTitle(resume, key)}</h3>
          {getSectionContent(resume, key)}
        </section>
      ))}
    </div>
  );
}
