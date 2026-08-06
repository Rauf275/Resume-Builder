import { forwardRef } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { useUIStore } from '../../store/useUIStore';
import TemplateRenderer from '../../templates/TemplateRenderer';
import { buildResumeCSSVars } from '../../utils/customizationVars';

const ResumePreview = forwardRef(function ResumePreview(_, ref) {
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

export default ResumePreview;
