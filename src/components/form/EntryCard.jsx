import { useState } from 'react';
import { ChevronDown, Trash2, GripVertical } from 'lucide-react';
import './form.css';

export default function EntryCard({ title, subtitle, onDelete, children, defaultOpen = false, dragHandleProps }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="entry-card">
      <div className="entry-card-head" onClick={() => setOpen((o) => !o)}>
        {dragHandleProps && (
          <span
            className="entry-drag-handle"
            onClick={(e) => e.stopPropagation()}
            {...dragHandleProps}
          >
            <GripVertical size={15} />
          </span>
        )}
        <div className="entry-card-titles">
          <span className="entry-card-title">{title || 'Untitled'}</span>
          {subtitle && <span className="entry-card-subtitle">{subtitle}</span>}
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete entry"
        >
          <Trash2 size={14} />
        </button>
        <ChevronDown size={16} className={`entry-chevron ${open ? 'open' : ''}`} />
      </div>
      {open && <div className="entry-card-body">{children}</div>}
    </div>
  );
}
