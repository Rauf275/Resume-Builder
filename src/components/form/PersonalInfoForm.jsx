import { useRef } from 'react';
import { User, Upload, X } from 'lucide-react';
import { Input } from '../ui/Field';
import Button from '../ui/Button';
import { useResumeStore } from '../../store/useResumeStore';
import { useUIStore } from '../../store/useUIStore';
import { TEMPLATES } from '../../constants/templates';

export default function PersonalInfoForm() {
  const personal = useResumeStore((s) => s.resume.personal);
  const updatePersonal = useResumeStore((s) => s.updatePersonal);
  const templateId = useUIStore((s) => s.templateId);
  const fileRef = useRef(null);

  const activeTemplate = TEMPLATES.find((t) => t.id === templateId);
  const supportsPhoto = activeTemplate ? activeTemplate.hasPhoto : true;

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updatePersonal('photo', reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="section-block">
      <div className="photo-upload">
        <div className="photo-upload-preview">
          {supportsPhoto && personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <User size={24} />
          )}
        </div>
        {supportsPhoto ? (
          <>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
            <Button variant="secondary" size="sm" icon={Upload} onClick={() => fileRef.current.click()}>
              Upload photo
            </Button>
            {personal.photo && (
              <Button variant="ghost" size="sm" icon={X} onClick={() => updatePersonal('photo', '')}>
                Remove
              </Button>
            )}
          </>
        ) : (
          <span className="photo-disabled-note">
            {activeTemplate?.name || 'This template'} doesn't display a photo
          </span>
        )}
      </div>

      <div className="entry-row">
        <Input label="First name" value={personal.firstName} onChange={(e) => updatePersonal('firstName', e.target.value)} />
        <Input label="Last name" value={personal.lastName} onChange={(e) => updatePersonal('lastName', e.target.value)} />
      </div>
      <Input label="Job title" value={personal.title} onChange={(e) => updatePersonal('title', e.target.value)} />
      <div className="entry-row">
        <Input label="Email" type="email" value={personal.email} onChange={(e) => updatePersonal('email', e.target.value)} />
        <Input label="Phone" value={personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} />
      </div>
      <Input label="Address" value={personal.address} onChange={(e) => updatePersonal('address', e.target.value)} />
      <div className="entry-row">
        <Input label="GitHub" value={personal.github} onChange={(e) => updatePersonal('github', e.target.value)} placeholder="github.com/username" />
        <Input label="LinkedIn" value={personal.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} placeholder="linkedin.com/in/username" />
      </div>
      <div className="entry-row">
        <Input label="Website" value={personal.website} onChange={(e) => updatePersonal('website', e.target.value)} placeholder="yoursite.com" />
        <Input label="Telegram" value={personal.telegram} onChange={(e) => updatePersonal('telegram', e.target.value)} placeholder="@username" />
      </div>
    </div>
  );
}
