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
    // Photos taken straight from a phone camera can be several MB, and stored
    // raw as base64 that easily blows past localStorage's per-origin quota
    // (~5MB in most browsers) once the rest of the resume is added on top —
    // which corrupts the persisted save and can crash the app on next load.
    // Downscale + re-encode as JPEG so a typical photo lands well under 500KB
    // regardless of what the original file looked like.
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 640;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          updatePersonal('photo', canvas.toDataURL('image/jpeg', 0.85));
        } catch {
          updatePersonal('photo', reader.result);
        }
      };
      img.onerror = () => updatePersonal('photo', reader.result);
      img.src = reader.result;
    };
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
        <Input label="Date of birth" type="date" value={personal.birthDate} onChange={(e) => updatePersonal('birthDate', e.target.value)} />
        <Input label="Email" type="email" value={personal.email} onChange={(e) => updatePersonal('email', e.target.value)} />
      </div>
      <div className="entry-row">
        <Input label="Phone" value={personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} />
        <Input label="Address" value={personal.address} onChange={(e) => updatePersonal('address', e.target.value)} />
      </div>
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
