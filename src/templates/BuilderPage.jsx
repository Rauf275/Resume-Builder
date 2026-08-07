import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Minimize2, Download,
  FileJson, Upload, FileText, FileType, Palette, PenLine, Grid2x2, History as HistoryIcon, Eye,
  PanelLeft, Minus, GraduationCap, Landmark, Moon, PenTool, Milestone,
  Code2, Building2, Layers, ListChecks, BookOpen, Sparkles, LayoutGrid,
  CircleUserRound, GalleryVerticalEnd, Image, Frame,
} from 'lucide-react';
import PersonalInfoForm from '../components/form/PersonalInfoForm';
import AboutForm from '../components/form/AboutForm';
import SectionList from '../components/form/SectionList';
import CustomizationPanel from '../components/CustomizationPanel';
import HistoryPanel from '../components/HistoryPanel';
import ResumePreview from '../components/preview/ResumePreview';
import Button from '../components/ui/Button';
import { useResumeStore } from '../store/useResumeStore';
import { useUIStore } from '../store/useUIStore';
import { useAutoSaveWatcher } from '../hooks/useAutoSaveWatcher';
import { TEMPLATES } from '../constants/templates';
import { exportPDF, exportHTML, exportJSON, exportDOCX, parseImportedJSON } from '../utils/exporters';
import './builder.css';

const TEMPLATE_ICONS = {
  PanelLeft, Minus, GraduationCap, Landmark, Moon, PenTool, Milestone,
  Code2, Building2, Layers, ListChecks, BookOpen, Sparkles, LayoutGrid,
  CircleUserRound, GalleryVerticalEnd, Image, Frame,
};

export default function BuilderPage() {
  const [tab, setTab] = useState('content');
  const [exportOpen, setExportOpen] = useState(false);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const exportMenuRef = useRef(null);

  useAutoSaveWatcher();

  const undo = useResumeStore((s) => s.undo);
  const redo = useResumeStore((s) => s.redo);
  const canUndo = useResumeStore((s) => s.past.length > 0);
  const canRedo = useResumeStore((s) => s.future.length > 0);
  const resume = useResumeStore((s) => s.resume);
  const sectionOrder = useResumeStore((s) => s.sectionOrder);
  const hiddenSections = useResumeStore((s) => s.hiddenSections);
  const loadResume = useResumeStore((s) => s.loadResume);

  const templateId = useUIStore((s) => s.templateId);
  const setTemplate = useUIStore((s) => s.setTemplate);
  const customization = useUIStore((s) => s.customization);
  const previewZoom = useUIStore((s) => s.previewZoom);
  const setZoom = useUIStore((s) => s.setZoom);
  const previewFullscreen = useUIStore((s) => s.previewFullscreen);
  const toggleFullscreen = useUIStore((s) => s.toggleFullscreen);

  useEffect(() => {
    function onKeyDown(e) {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (meta && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === 'Escape' && previewFullscreen) { toggleFullscreen(); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo, previewFullscreen, toggleFullscreen]);

  useEffect(() => {
    function onClickOutside(e) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) setExportOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = parseImportedJSON(reader.result);
        loadResume(data);
      } catch {
        alert('That file doesn\'t look like a valid Resume Builder Pro JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className={`builder-page ${previewFullscreen ? 'is-fullscreen' : ''}`}>
      <div className="builder-toolbar">
        {/* Pinned zone: always fully visible, never scrolls out of view. Export leads because
            it's the action mobile users reach for most. */}
        <div className="toolbar-pinned">
          <Link to="/" className="icon-btn" aria-label="Back home"><ArrowLeft size={15} /></Link>
          <div className="export-menu-wrap" ref={exportMenuRef}>
            <Button variant="accent" size="sm" icon={Download} onClick={() => setExportOpen((o) => !o)}>Export</Button>
            {exportOpen && (
              <div className="export-menu">
                <button onClick={() => { exportPDF(previewRef.current, resume, customization.pageSize); setExportOpen(false); }}>
                  <FileText size={14} /> PDF
                </button>
                <button onClick={() => { exportDOCX(resume, sectionOrder, hiddenSections); setExportOpen(false); }}>
                  <FileType size={14} /> DOCX <span className="menu-note">simplified formatting</span>
                </button>
                <button onClick={() => { exportHTML(previewRef.current, resume); setExportOpen(false); }}>
                  <Grid2x2 size={14} /> HTML
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable zone: everything else, reachable via horizontal scroll on narrow screens. */}
        <div className="toolbar-scroll">
          <div className="toolbar-group">
            <button className="icon-btn" onClick={undo} disabled={!canUndo} aria-label="Undo"><Undo2 size={15} /></button>
            <button className="icon-btn" onClick={redo} disabled={!canRedo} aria-label="Redo"><Redo2 size={15} /></button>
          </div>
          <span className="autosave-note">Autosaved to this device</span>

          <div className="toolbar-spacer" />

          <div className="toolbar-group">
            <button className="icon-btn" onClick={() => setZoom(previewZoom - 0.1)} aria-label="Zoom out"><ZoomOut size={15} /></button>
            <span className="zoom-readout notranslate" translate="no">{Math.round(previewZoom * 100)}%</span>
            <button className="icon-btn" onClick={() => setZoom(previewZoom + 0.1)} aria-label="Zoom in"><ZoomIn size={15} /></button>
            <button className="icon-btn" onClick={toggleFullscreen} aria-label="Toggle fullscreen preview" title="Preview">
              {previewFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>

          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImport} />
          <Button variant="ghost" size="sm" icon={Upload} onClick={() => fileInputRef.current.click()}><span className="import-label">Import</span></Button>
          <Button variant="ghost" size="sm" icon={FileJson} onClick={() => exportJSON({ resume, sectionOrder, hiddenSections })}><span className="save-label">Save JSON</span></Button>
        </div>
      </div>

      <div className="builder-body">
        <aside className="builder-panel">
          <div className="panel-tabs">
            <button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>
              <PenLine size={14} /> Content
            </button>
            <button className={tab === 'design' ? 'active' : ''} onClick={() => setTab('design')}>
              <Palette size={14} /> Design
            </button>
            <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
              <HistoryIcon size={14} /> History
            </button>
          </div>

          {tab === 'content' && (
            <div className="builder-form-panel">
              <div className="form-section-wrapper">
                <div className="section-block-title" style={{ marginBottom: 14 }}>Personal information</div>
                <PersonalInfoForm />
              </div>
              <div className="form-section-wrapper">
                <div className="section-block-title" style={{ marginBottom: 14 }}>About me</div>
                <AboutForm />
              </div>
              <SectionList />
            </div>
          )}

          {tab === 'design' && (
            <div className="design-panel">
              <div className="section-block-title" style={{ marginBottom: 6 }}>Template</div>
              <div className="template-mini-grid">
                {TEMPLATES.map((t) => {
                  const TplIcon = TEMPLATE_ICONS[t.icon] || PanelLeft;
                  return (
                    <button
                      key={t.id}
                      className={`template-mini ${templateId === t.id ? 'active' : ''}`}
                      onClick={() => setTemplate(t.id, t.defaultColor)}
                      title={t.name}
                    >
                      <span className="template-mini-icon" style={{ color: t.defaultColor }}>
                        <TplIcon size={15} strokeWidth={2} />
                      </span>
                      {t.name}
                    </button>
                  );
                })}
              </div>
              <Link to="/templates" className="see-all-link">Browse full catalog →</Link>
              <div className="design-divider" />
              <div className="section-block-title" style={{ marginBottom: 6 }}>Styling</div>
              <CustomizationPanel />
            </div>
          )}

          {tab === 'history' && (
            <div className="design-panel">
              <HistoryPanel />
            </div>
          )}
        </aside>

        {!previewFullscreen && (
          <main className="builder-preview-stage">
            <div className="preview-scroll">
              <div className="preview-zoom-wrap" style={{ transform: `scale(${previewZoom})` }}>
                <ResumePreview ref={previewRef} />
              </div>
            </div>
          </main>
        )}

        {/* Mobile-only affordance: the preview is hidden by default on small screens (the
            editing panel takes the full viewport), so this floating button is the obvious
            way in, in addition to the toolbar's fullscreen icon next to the zoom controls. */}
        {!previewFullscreen && (
          <button className="mobile-preview-fab" onClick={toggleFullscreen} aria-label="Open preview">
            <Eye size={16} /> Preview
          </button>
        )}
      </div>

      {previewFullscreen && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-bar">
            <span className="fullscreen-title">Preview — fullscreen</span>
            <div className="toolbar-group">
              <button className="icon-btn" onClick={() => setZoom(previewZoom - 0.1)} aria-label="Zoom out"><ZoomOut size={15} /></button>
              <span className="zoom-readout notranslate" translate="no">{Math.round(previewZoom * 100)}%</span>
              <button className="icon-btn" onClick={() => setZoom(previewZoom + 0.1)} aria-label="Zoom in"><ZoomIn size={15} /></button>
            </div>
            <Button variant="secondary" size="sm" icon={Minimize2} onClick={toggleFullscreen}>Exit fullscreen</Button>
          </div>
          <div className="fullscreen-scroll">
            <div className="preview-zoom-wrap" style={{ transform: `scale(${previewZoom})` }}>
              <ResumePreview ref={previewRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
