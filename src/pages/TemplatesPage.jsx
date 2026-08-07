import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check, Image as ImageIcon, Columns2, Columns3 } from 'lucide-react';
import Header from '../components/Header';
import { TEMPLATES, TEMPLATE_STYLES } from '../constants/templates';
import { DEMO_RESUME } from '../constants/resumeSchema';
import TemplateRenderer from '../templates/TemplateRenderer';
import { useUIStore } from '../store/useUIStore';
import { buildResumeCSSVars } from '../utils/customizationVars';
import { useFitScale, PAGE_SIZE_PX } from '../hooks/useFitScale';
import './templates.css';

const DEFAULT_CUSTOM = { columnRatio: 34 };

// The thumbnail's scale depends on the card's actual rendered width, which changes with
// viewport size and how many cards fit per row (the grid uses `auto-fill, minmax(...)`,
// so card width is never a single fixed number). A hardcoded CSS scale only matches one
// assumed width; whenever the real width is narrower, the page overflows the frame and
// its right edge gets clipped by `overflow: hidden`. Measuring the frame's own width via
// useFitScale and applying that exact scale keeps the whole page visible at any width.
function TemplateThumb({ t }) {
  const [thumbRef, scale] = useFitScale(PAGE_SIZE_PX.A4.width, 0);
  return (
    <div className="template-thumb-frame" ref={thumbRef}>
      <div
        className="template-thumb-scale"
        style={{
          ...buildResumeCSSVars({
            accentColor: t.defaultColor,
            secondaryColor: '#2E4057',
            font: 'Public Sans',
            fontSize: 15,
            lineHeight: 1.5,
            headingScale: 1,
            fontWeight: 400,
          }),
          transform: `scale(${scale})`,
        }}
      >
        <TemplateRenderer templateId={t.id} resume={DEMO_RESUME} customization={{ ...DEFAULT_CUSTOM, accentColor: t.defaultColor, secondaryColor: '#2E4057', fontSize: 15, lineHeight: 1.5, headingScale: 1 }} pageClass="" />
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState('All');
  const [columns, setColumns] = useState('All');
  const [photoOnly, setPhotoOnly] = useState(false);
  const setTemplate = useUIStore((s) => s.setTemplate);
  const activeId = useUIStore((s) => s.templateId);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      if (query && !`${t.name} ${t.style}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (style !== 'All' && t.style !== style) return false;
      if (columns !== 'All' && String(t.columns) !== columns) return false;
      if (photoOnly && !t.hasPhoto) return false;
      return true;
    });
  }, [query, style, columns, photoOnly]);

  function choose(t) {
    setTemplate(t.id, t.defaultColor);
    navigate('/builder');
  }

  return (
    <div className="templates-page">
      <Header />
      <div className="templates-wrap">
        <div className="templates-intro">
          <span className="eyebrow">Catalog</span>
          <h1>Find the layout that fits your story</h1>
          <p>{TEMPLATES.length} distinct templates — different columns, headers, and section logic, not just recolors.</p>
        </div>

        <div className="templates-filters">
          <div className="search-box">
            <Search size={15} />
            <input placeholder="Search templates…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="field-select" value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="All">All styles</option>
            {TEMPLATE_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="field-select" value={columns} onChange={(e) => setColumns(e.target.value)}>
            <option value="All">Any columns</option>
            <option value="1">1 column</option>
            <option value="2">2 columns</option>
          </select>
          <label className="photo-filter">
            <input type="checkbox" checked={photoOnly} onChange={(e) => setPhotoOnly(e.target.checked)} />
            Photo layouts only
          </label>
        </div>

        <div className="templates-grid">
          {filtered.map((t) => (
            <div key={t.id} className={`template-card ${activeId === t.id ? 'active' : ''}`}>
              <TemplateThumb t={t} />
              <div className="template-card-body">
                <div className="template-card-head">
                  <strong>{t.name}</strong>
                  {activeId === t.id && <span className="active-badge"><Check size={12} /> Active</span>}
                </div>
                <p>{t.description}</p>
                <div className="template-meta">
                  <span>{t.columns === 2 ? <Columns2 size={12} /> : <Columns3 size={12} style={{ opacity: 0 }} />} {t.columns} col</span>
                  <span><ImageIcon size={12} /> {t.hasPhoto ? 'Photo' : 'No photo'}</span>
                  <span className="template-style-tag">{t.style}</span>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 10 }} onClick={() => choose(t)}>
                  Use this template
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="templates-empty">No templates match those filters.</div>}
        </div>
      </div>
    </div>
  );
}
