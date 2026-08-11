import { forwardRef } from 'react';
import ResumeContent from './ResumeContent';

// Kept as a thin alias around ResumeContent for anything that still wants a
// single, unpaginated render of the resume (e.g. a future non-builder use).
// The builder page itself uses PaginatedResume instead — see that file.
const ResumePreview = forwardRef(function ResumePreview(_, ref) {
  return <ResumeContent ref={ref} />;
});

export default ResumePreview;
