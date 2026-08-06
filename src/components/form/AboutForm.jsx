import { TextArea } from '../ui/Field';
import { useResumeStore } from '../../store/useResumeStore';

export default function AboutForm() {
  const about = useResumeStore((s) => s.resume.about);
  const updateAbout = useResumeStore((s) => s.updateAbout);

  return (
    <TextArea
      label="About me"
      rows={5}
      value={about}
      onChange={(e) => updateAbout(e.target.value)}
      placeholder="A short professional summary that shows who you are and what you're great at..."
    />
  );
}
