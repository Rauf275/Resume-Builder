import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ tags, onAdd, onRemove, placeholder = 'Type and press Enter' }) {
  const [value, setValue] = useState('');

  function commit() {
    if (value.trim()) {
      onAdd(value);
      setValue('');
    }
  }

  return (
    <div className="tag-input-wrap">
      {tags.map((tag, i) => (
        <span className="tag-pill" key={`${tag}-${i}`}>
          {tag}
          <button type="button" onClick={() => onRemove(i)} aria-label={`Remove ${tag}`}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        className="tag-input-field"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Backspace' && !value && tags.length) {
            onRemove(tags.length - 1);
          }
        }}
        onBlur={commit}
      />
    </div>
  );
}
