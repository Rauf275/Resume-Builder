import { forwardRef } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { useUIStore } from '../../store/useUIStore';
import TemplateRenderer from '../../templates/TemplateRenderer';
import { buildResumeCSSVars } from '../../utils/customizationVars';

// This is exactly the node ResumePreview used to render directly. Pulling it
// out lets PaginatedResume mount it more than once: one off-screen copy that
// stays the single source of truth for export/measurement, and one clipped
// copy per visible page sheet — see PaginatedResume.jsx.
const ResumeContent = forwardRef(function ResumeContent(_, ref) {
  const resume = useResumeStore((s) => s.resume);
  const templateId = useUIStore((s) => s.templateId);
  const customization = useUIStore((s) => s.customization);

  const style = buildResumeCSSVars(customization);

  return (
    <div ref={ref} style={style}>
      <TemplateRenderer
        templateId={templateId}
        resume={resume}
        customization={customization}
        pageClass={customization.pageSize === 'Letter' ? 'page-letter' : ''}
      />
    </div>
  );
});

export default ResumeContent;
