import { Plus } from 'lucide-react';
import Button from '../ui/Button';
import { Input, TextArea } from '../ui/Field';
import TagInput from '../ui/TagInput';
import EntryCard from './EntryCard';
import { useResumeStore } from '../../store/useResumeStore';
import { emptyCustomItem } from '../../constants/resumeSchema';

// Zustand/useSyncExternalStore compares selected values by reference. A selector
// that falls back to a freshly-allocated `[]` when the key is missing returns a
// *new* array on every single render, which reads as "changed" forever — that's
// an infinite render loop (React eventually throws "Maximum update depth
// exceeded" and, with no recovery, the whole app crashes to a blank screen).
// This bites any 'entries'-type custom section, since those never populate
// customTags at all, so `customTags[sectionId]` is always undefined. Reusing
// one shared empty array keeps the reference stable across renders.
const EMPTY_ARRAY = [];

export default function CustomSectionForm({ sectionId }) {
  const sectionType = useResumeStore((s) => {
    const meta = (s.resume.customSections || []).find((sec) => sec.id === sectionId);
    return meta?.type || 'entries';
  });

  const tags = useResumeStore((s) => (s.resume.customTags && s.resume.customTags[sectionId]) || EMPTY_ARRAY);
  const addCustomTag = useResumeStore((s) => s.addCustomTag);
  const removeCustomTag = useResumeStore((s) => s.removeCustomTag);

  const items = useResumeStore((s) => (s.resume.customItems && s.resume.customItems[sectionId]) || EMPTY_ARRAY);
  const addCustomItem = useResumeStore((s) => s.addCustomItem);
  const updateCustomItem = useResumeStore((s) => s.updateCustomItem);
  const removeCustomItem = useResumeStore((s) => s.removeCustomItem);

  if (sectionType === 'tags') {
    return (
      <TagInput
        tags={tags}
        onAdd={(v) => addCustomTag(sectionId, v)}
        onRemove={(i) => removeCustomTag(sectionId, i)}
        placeholder="Type and press Enter..."
      />
    );
  }

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
