import TagInput from '../ui/TagInput';
import { useResumeStore } from '../../store/useResumeStore';

export default function SkillsForm() {
  const skills = useResumeStore((s) => s.resume.skills);
  const addTag = useResumeStore((s) => s.addTag);
  const removeTag = useResumeStore((s) => s.removeTag);

  return (
    <TagInput
      tags={skills}
      onAdd={(v) => addTag('skills', v)}
      onRemove={(i) => removeTag('skills', i)}
      placeholder="e.g. Figma, React, Leadership..."
    />
  );
}
