import { Plus } from 'lucide-react';
import Button from '../ui/Button';
import EntryCard from './EntryCard';
import { useResumeStore } from '../../store/useResumeStore';

export default function RepeatableSection({
  section,
  emptyItem,
  titleOf,
  subtitleOf,
  addLabel,
  renderFields,
}) {
  const items = useResumeStore((s) => s.resume[section]);
  const addListItem = useResumeStore((s) => s.addListItem);
  const updateListItem = useResumeStore((s) => s.updateListItem);
  const removeListItem = useResumeStore((s) => s.removeListItem);

  return (
    <div className="section-list">
      {items.map((item) => (
        <EntryCard
          key={item.id}
          title={titleOf(item)}
          subtitle={subtitleOf(item)}
          onDelete={() => removeListItem(section, item.id)}
        >
          {renderFields(item, (patch) => updateListItem(section, item.id, patch))}
        </EntryCard>
      ))}
      <Button variant="secondary" size="sm" icon={Plus} onClick={() => addListItem(section, emptyItem())}>
        {addLabel}
      </Button>
    </div>
  );
}
