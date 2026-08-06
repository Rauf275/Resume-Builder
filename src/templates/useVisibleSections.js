import { useResumeStore } from '../store/useResumeStore';

export function useVisibleSections() {
  const sectionOrder = useResumeStore((s) => s.sectionOrder);
  const hidden = useResumeStore((s) => s.hiddenSections);
  return sectionOrder.filter((k) => !hidden.includes(k));
}
