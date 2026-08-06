import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, FileStack } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import Button from './ui/Button';
import './header.css';

export default function Header() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const { pathname } = useLocation();

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-mark"><FileStack size={18} /></span>
        <span className="brand-name">Resume Builder <em>Pro</em></span>
      </Link>
      <nav className="site-nav">
        <Link to="/templates" className={pathname === '/templates' ? 'active' : ''}>Templates</Link>
        <Link to="/builder" className={pathname === '/builder' ? 'active' : ''}>Builder</Link>
      </nav>
      <div className="header-actions">
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>
        <Link to="/builder">
          <Button variant="accent" size="sm">Create resume</Button>
        </Link>
      </div>
    </header>
  );
}
