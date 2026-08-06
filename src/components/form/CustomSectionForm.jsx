import { Plus } from 'lucide-react';
import Button from '../ui/Button';
import { Input, TextArea } from '../ui/Field';
import EntryCard from './EntryCard';
import { useResumeStore } from '../../store/useResumeStore';
import { emptyCustomItem } from '../../constants/resumeSchema';

export default function CustomSectionForm({ sectionId }) {
  const items = useResumeStore((s) => (s.resume.customItems && s.resume.customItems[sectionId]) || []);
  const addCustomItem = useResumeStore((s) => s.addCustomItem);
  const updateCustomItem = useResumeStore((s) => s.updateCustomItem);
  const removeCustomItem = useResumeStore((s) => s.removeCustomItem);

  return (
    <div className="section-list">
      {items.map((item) => (
        <EntryCard
          key={item.id}
          title={item.title || 'Untitled entry'}
          subtitle={item.subtitle}
          onDelete={() => removeCustomItem(sectionId, item.id)}
        >
          <Input label="Title" value={item.title} onChange={(e) => updateCustomItem(sectionId, item.id, { title: e.target.value })} />
          <div className="entry-row">
            <Input label="Subtitle" value={item.subtitle} onChange={(e) => updateCustomItem(sectionId, item.id, { subtitle: e.target.value })} placeholder="Optional, e.g. issuer, location..." />
            <Input label="Date" value={item.date} onChange={(e) => updateCustomItem(sectionId, item.id, { date: e.target.value })} placeholder="Optional, e.g. 2024" />
          </div>
          <TextArea label="Description" rows={3} value={item.description} onChange={(e) => updateCustomItem(sectionId, item.id, { description: e.target.value })} />
        </EntryCard>
      ))}
      <Button variant="secondary" size="sm" icon={Plus} onClick={() => addCustomItem(sectionId, emptyCustomItem())}>
        Add entry
      </Button>
    </div>
  );
}
