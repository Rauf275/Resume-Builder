import { Input, TextArea } from '../ui/Field';
import RepeatableSection from './RepeatableSection';
import { emptyEducation } from '../../constants/resumeSchema';

export default function EducationForm() {
  return (
    <RepeatableSection
      section="education"
      emptyItem={emptyEducation}
      titleOf={(it) => it.school || 'New school'}
      subtitleOf={(it) => [it.degree, it.field].filter(Boolean).join(', ')}
      addLabel="Add education"
      renderFields={(item, update) => (
        <>
          <Input label="School" value={item.school} onChange={(e) => update({ school: e.target.value })} />
          <div className="entry-row">
            <Input label="Degree" value={item.degree} onChange={(e) => update({ degree: e.target.value })} placeholder="B.A., M.S...." />
            <Input label="Field of study" value={item.field} onChange={(e) => update({ field: e.target.value })} />
          </div>
          <div className="entry-row">
            <Input label="Start date" type="month" value={item.startDate} onChange={(e) => update({ startDate: e.target.value })} />
            <Input label="End date" type="month" value={item.endDate} onChange={(e) => update({ endDate: e.target.value })} />
          </div>
          <TextArea label="Description" rows={2} value={item.description} onChange={(e) => update({ description: e.target.value })} />
        </>
      )}
    />
  );
}
