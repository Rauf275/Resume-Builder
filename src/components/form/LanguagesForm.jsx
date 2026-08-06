import { Input, Select } from '../ui/Field';
import RepeatableSection from './RepeatableSection';
import { emptyLanguage } from '../../constants/resumeSchema';

const LEVELS = ['Beginner', 'Intermediate', 'Professional', 'Fluent', 'Native'];

export default function LanguagesForm() {
  return (
    <RepeatableSection
      section="languages"
      emptyItem={emptyLanguage}
      titleOf={(it) => it.name || 'New language'}
      subtitleOf={(it) => it.level}
      addLabel="Add language"
      renderFields={(item, update) => (
        <div className="entry-row">
          <Input label="Language" value={item.name} onChange={(e) => update({ name: e.target.value })} />
          <Select label="Level" value={item.level} onChange={(e) => update({ level: e.target.value })}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
        </div>
      )}
    />
  );
}
