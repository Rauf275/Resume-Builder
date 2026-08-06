import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TemplatesPage from './pages/TemplatesPage';
import BuilderPage from './pages/BuilderPage';
import { useUIStore } from './store/useUIStore';

// HashRouter (not BrowserRouter) is used deliberately: this app is deployed as a static
// site on GitHub Pages, which has no server-side rewrite rules. With BrowserRouter, a
// direct link or a page refresh on e.g. /Resume-Builder/builder returns a real 404 from
// GitHub Pages because no such file exists. HashRouter keeps the route in the URL hash
// (e.g. /Resume-Builder/#/builder), which the browser never sends to the server, so
// GitHub Pages always serves index.html and the app's own router takes over from there.
export default function App() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/builder" element={<BuilderPage />} />
      </Routes>
    </HashRouter>
  );
}
