import { useState } from 'react';
import {
  Plus, Star, FileText, Award, Heart, Globe, Bookmark, Flag, Trophy, Users, Link2, Mic, Quote,
  Rows3, Tags,
} from 'lucide-react';
import Button from '../ui/Button';
import { Input } from '../ui/Field';
import { useResumeStore } from '../../store/useResumeStore';
import { CUSTOM_SECTION_ICONS } from '../../constants/resumeSchema';

export const CUSTOM_ICON_MAP = { Star, FileText, Award, Heart, Globe, Bookmark, Flag, Trophy, Users, Link2, Mic, Quote };

const SECTION_TYPE_OPTIONS = [
  { value: 'entries', label: 'Entries', hint: 'Title, date, description', Icon: Rows3 },
  { value: 'tags', label: 'Tags', hint: 'Colored pills, like Skills', Icon: Tags },
];

export default function AddCustomSectionForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('Star');
  const [type, setType] = useState('entries');
  const addCustomSection = useResumeStore((s) => s.addCustomSection);

  function handleAdd() {
    if (!title.trim()) return;
    addCustomSection(title.trim(), icon, type);
    setTitle('');
    setIcon('Star');
    setType('entries');
    setOpen(false);
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" icon={Plus} onClick={() => setOpen(true)} style={{ marginTop: 4 }}>
        Add custom section
      </Button>
    );
  }

  return (
    <div className="custom-section-creator">
      <Input
        label="Section name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Publications, Volunteering, References..."
        autoFocus
      />
      <div className="field">
        <span className="field-label">Section type</span>
        <div className="section-type-picker">
          {SECTION_TYPE_OPTIONS.map(({ value, label, hint, Icon }) => (
            <button
              key={value}
              type="button"
              className={`section-type-option ${type === value ? 'active' : ''}`}
              onClick={() => setType(value)}
            >
              <Icon size={16} />
              <span className="section-type-option-text">
                <strong>{label}</strong>
                <small>{hint}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span className="field-label">Icon</span>
        <div className="icon-picker">
          {CUSTOM_SECTION_ICONS.map((name) => {
            const IconComp = CUSTOM_ICON_MAP[name];
            return (
              <button
                key={name}
                type="button"
                className={`icon-picker-option ${icon === name ? 'active' : ''}`}
                onClick={() => setIcon(name)}
                aria-label={name}
              >
                <IconComp size={16} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="custom-section-creator-actions">
        <Button variant="accent" size="sm" onClick={handleAdd} disabled={!title.trim()}>Add section</Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}
