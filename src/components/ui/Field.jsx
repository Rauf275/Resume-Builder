export function Input({ label, ...props }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <input className="field-input" {...props} />
    </label>
  );
}

export function TextArea({ label, ...props }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <textarea className="field-textarea" {...props} />
    </label>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <select className="field-select" {...props}>
        {children}
      </select>
    </label>
  );
}
