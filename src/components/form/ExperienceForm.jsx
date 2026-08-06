import { Input, TextArea } from '../ui/Field';
import RepeatableSection from './RepeatableSection';
import { emptyExperience } from '../../constants/resumeSchema';

export default function ExperienceForm() {
  return (
    <RepeatableSection
      section="experience"
      emptyItem={emptyExperience}
      titleOf={(it) => it.position || 'New position'}
      subtitleOf={(it) => it.company}
      addLabel="Add experience"
      renderFields={(item, update) => (
        <>
          <div className="entry-row">
            <Input label="Company" value={item.company} onChange={(e) => update({ company: e.target.value })} />
            <Input label="Position" value={item.position} onChange={(e) => update({ position: e.target.value })} />
          </div>
          <div className="entry-row">
            <Input label="Start date" type="month" value={item.startDate} onChange={(e) => update({ startDate: e.target.value })} />
            <Input
              label="End date"
              type="month"
              value={item.endDate}
              disabled={item.current}
              onChange={(e) => update({ endDate: e.target.value })}
            />
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={item.current} onChange={(e) => update({ current: e.target.checked, endDate: '' })} />
            I currently work here
          </label>
          <TextArea label="Description" rows={3} value={item.description} onChange={(e) => update({ description: e.target.value })} />
        </>
      )}
    />
  );
}
