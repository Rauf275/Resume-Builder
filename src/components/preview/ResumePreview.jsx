import { forwardRef, useRef } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { useUIStore } from '../../store/useUIStore';
import TemplateRenderer from '../../templates/TemplateRenderer';
import { buildResumeCSSVars } from '../../utils/customizationVars';
import PageBreakLines from './PageBreakLines';
import './resumePreview.css';

const ResumePreview = forwardRef(function ResumePreview(_, ref) {
  const resume = useResumeStore((s) => s.resume);
  const templateId = useUIStore((s) => s.templateId);
  const customization = useUIStore((s) => s.customization);
  const contentRef = useRef(null);

  const style = buildResumeCSSVars(customization);

  return (
    <div ref={ref} style={{ ...style, position: 'relative' }}>
      <div ref={contentRef}>
        <TemplateRenderer
          templateId={templateId}
          resume={resume}
          customization={customization}
          pageClass={customization.pageSize === 'Letter' ? 'page-letter' : ''}
        />
      </div>
      <PageBreakLines contentRef={contentRef} pageSize={customization.pageSize} />
    </div>
  );
});

export default ResumePreview;
