import { Input } from '../ui/Field';
import RepeatableSection from './RepeatableSection';
import { emptyCertificate } from '../../constants/resumeSchema';

export default function CertificatesForm() {
  return (
    <RepeatableSection
      section="certificates"
      emptyItem={emptyCertificate}
      titleOf={(it) => it.name || 'New certificate'}
      subtitleOf={(it) => it.issuer}
      addLabel="Add certificate"
      renderFields={(item, update) => (
        <>
          <Input label="Certificate name" value={item.name} onChange={(e) => update({ name: e.target.value })} />
          <div className="entry-row">
            <Input label="Issuer" value={item.issuer} onChange={(e) => update({ issuer: e.target.value })} />
            <Input label="Date" type="month" value={item.date} onChange={(e) => update({ date: e.target.value })} />
          </div>
        </>
      )}
    />
  );
}
