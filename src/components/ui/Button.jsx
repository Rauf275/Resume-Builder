import { forwardRef } from 'react';
import './ui.css';

const Button = forwardRef(function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconOnly = false,
  className = '',
  ...props
}, ref) {
  return (
    <button
      ref={ref}
      className={`btn btn-${variant} btn-${size} ${iconOnly ? 'btn-icon-only' : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2} />}
      {!iconOnly && children}
    </button>
  );
});

export default Button;
