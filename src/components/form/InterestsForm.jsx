import TagInput from '../ui/TagInput';
import { useResumeStore } from '../../store/useResumeStore';

export default function InterestsForm() {
  const interests = useResumeStore((s) => s.resume.interests);
  const addTag = useResumeStore((s) => s.addTag);
  const removeTag = useResumeStore((s) => s.removeTag);

  return (
    <TagInput
      tags={interests}
      onAdd={(v) => addTag('interests', v)}
      onRemove={(i) => removeTag('interests', i)}
      placeholder="e.g. Photography, Chess..."
    />
  );
}
