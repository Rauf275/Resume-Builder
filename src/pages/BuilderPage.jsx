import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ZoomIn, ZoomOut, Maximize2, Minimize2, Download,
  FileJson, Upload, FileText, FileType, Palette, PenLine, Grid2x2, Eye, Loader2,
} from 'lucide-react';
import PersonalInfoForm from '../components/form/PersonalInfoForm';
import AboutForm from '../components/form/AboutForm';
import SectionList from '../components/form/SectionList';
import CustomizationPanel from '../components/CustomizationPanel';
import PaginatedResume from '../components/preview/PaginatedResume';
import Button from '../components/ui/Button';
import { useResumeStore } from '../store/useResumeStore';
import { useUIStore } from '../store/useUIStore';
import { TEMPLATES } from '../constants/templates';
import { TEMPLATE_ICONS, DEFAULT_TEMPLATE_ICON } from '../constants/templateIcons';
import { exportPDF, exportHTML, exportJSON, exportDOCX, parseImportedJSON } from '../utils/exporters';
import { useFitScale, PAGE_SIZE_PX } from '../hooks/useFitScale';
import { useMediaQuery } from '../hooks/useMediaQuery';
import './builder.css';

function ExportMenu({ open, onToggle, onClose, menuRef, isExporting, onExportPDF, onExportDOCX, onExportHTML, className = '' }) {
  return (
    <div className={`export-menu-wrap ${className}`} ref={menuRef}>
      <Button
        variant="accent"
        size="sm"
        icon={isExporting ? Loader2 : Download}
        className={isExporting ? 'btn-icon-spin' : ''}
        onClick={onToggle}
        disabled={isExporting}
      >
        {isExporting ? 'Exporting…' : 'Export'}
      </Button>
      {open && (
        <div className="export-menu">
          <button disabled={isExporting} onClick={() => { onClose(); onExportPDF(); }}>
            <FileText size={14} /> PDF
          </button>
          <button disabled={isExporting} onClick={() => { onClose(); onExportDOCX(); }}>
            <FileType size={14} /> DOCX <span className="menu-note">simplified formatting</span>
          </button>
          <button disabled={isExporting} onClick={() => { onClose(); onExportHTML(); }}>
            <Grid2x2 size={14} /> HTML
          </button>
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  const [tab, setTab] = useState('content');
  const [exportOpen, setExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const exportMenuRefMobile = useRef(null);
  const exportMenuRefDesktop = useRef(null);

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

  // On narrow screens the page (A4/Letter, fixed physical size) is wider than the
  // viewport, so the raw zoom value (meant for desktop precision zooming) would force
  // horizontal scrolling to see the whole page width. Cap the actual render scale at
  // whatever fits the container's width — on desktop the fit is comfortably larger
  // than the max zoom, so it has no effect there. Desktop keeps its existing
  // scroll-to-zoom behavior in both the inline and fullscreen preview, since zooming in
  // past 100% there is an intentional feature.
  //
  // Height is deliberately not fit here (0 = width-only): the resume can now render as
  // several stacked page sheets (see PaginatedResume), not always a single page, so
  // there's no one "whole sheet" height to fit to — the scroll container below just
  // scrolls through however many pages there are, the way a PDF viewer would.
  const isMobile = useMediaQuery('(max-width: 900px)');
  const pageSizePx = PAGE_SIZE_PX[customization.pageSize] || PAGE_SIZE_PX.A4;
  const [previewScrollRef, previewFitScale] = useFitScale(pageSizePx.width, 0);
  const [fullscreenScrollRef, fullscreenFitScale] = useFitScale(pageSizePx.width, 0);
  const previewRenderScale = Math.min(previewZoom, previewFitScale);
  const fullscreenRenderScale = Math.min(previewZoom, fullscreenFitScale);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && previewFullscreen) { toggleFullscreen(); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewFullscreen, toggleFullscreen]);

  useEffect(() => {
    function onClickOutside(e) {
      const insideMobile = exportMenuRefMobile.current && exportMenuRefMobile.current.contains(e.target);
      const insideDesktop = exportMenuRefDesktop.current && exportMenuRefDesktop.current.contains(e.target);
      if (!insideMobile && !insideDesktop) setExportOpen(false);
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
      } catch (err) {
        console.error('Import failed:', err);
        alert('That file doesn\'t look like a valid Resume Builder Pro JSON export.');
      }
    };
    reader.onerror = () => {
      alert('That file couldn\'t be read. Please try selecting it again.');
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // Rasterizing the resume (html2canvas) and building the DOCX are both
  // synchronous, CPU-heavy work that blocks the main thread — on a phone
  // this is exactly what made the Export → PDF tap feel like it hung: the
  // button never visibly reacted before the freeze started, so a tap felt
  // ignored (and a second, frustrated tap just queued up another heavy
  // export on top of the first). `runExport` fixes both: it flips on a
  // loading state and lets two animation frames actually paint — closing
  // the menu, disabling the buttons, swapping the Export icon to a spinner
  // — before the heavy work begins, and it ignores taps while one export is
  // already running instead of stacking them.
  async function runExport(fn) {
    if (isExporting) return;
    setIsExporting(true);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    try {
      await fn();
    } finally {
      setIsExporting(false);
    }
  }

  const handleExportPDF = () => runExport(() => exportPDF(previewRef.current, resume, customization.pageSize));
  const handleExportDOCX = () => runExport(() => exportDOCX(resume, sectionOrder, hiddenSections));
  const handleExportHTML = () => runExport(() => exportHTML(previewRef.current, resume));

  return (
    <div className={`builder-page ${previewFullscreen ? 'is-fullscreen' : ''}`}>
      <div className="builder-toolbar">
        {/* Pinned zone: always fully visible, never scrolls out of view. */}
        <div className="toolbar-pinned">
          <Link to="/" className="icon-btn" aria-label="Back home"><ArrowLeft size={15} /></Link>
        </div>

        {/* Scrollable zone: everything else, reachable via horizontal scroll/swipe on narrow screens. */}
        <div className="toolbar-scroll">
          <span className="autosave-note">Autosaved to this device</span>

          <div className="toolbar-spacer" />

          <div className="toolbar-group zoom-controls">
            <button className="icon-btn" onClick={() => setZoom(previewZoom - 0.1)} aria-label="Zoom out"><ZoomOut size={15} /></button>
            <span className="zoom-readout notranslate" translate="no">{Math.round(previewRenderScale * 100)}%</span>
            <button className="icon-btn" onClick={() => setZoom(previewZoom + 0.1)} aria-label="Zoom in"><ZoomIn size={15} /></button>
          </div>
          <button className="icon-btn" onClick={toggleFullscreen} aria-label="Toggle fullscreen preview" title="Preview">
            {previewFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Mobile placement: right next to the fullscreen toggle, since that's the action
              mobile users reach for most. Hidden on desktop, where Export lives pinned right. */}
          <ExportMenu
            className="export-menu-mobile"
            open={exportOpen}
            onToggle={() => setExportOpen((o) => !o)}
            onClose={() => setExportOpen(false)}
            menuRef={exportMenuRefMobile}
            isExporting={isExporting}
            onExportPDF={handleExportPDF}
            onExportDOCX={handleExportDOCX}
            onExportHTML={handleExportHTML}
          />

          {/* accept must list the extension, not just the MIME type: many mobile file
              providers (Android "Files", iOS Files app, Drive/Telegram downloads, etc.)
              report .json files as text/plain or application/octet-stream rather than
              application/json, so an accept filter limited to the MIME type causes the
              native picker to grey out or hide valid JSON files on phones — the import
              button effectively stops working there even though it's fine on desktop. */}
          <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
          <Button variant="ghost" size="sm" icon={Upload} onClick={() => fileInputRef.current.click()}><span className="import-label">Import</span></Button>
          <Button variant="ghost" size="sm" icon={FileJson} onClick={() => exportJSON({ resume, sectionOrder, hiddenSections })}><span className="save-label">Save JSON</span></Button>
        </div>

        {/* Desktop placement: pinned to the far right corner of the toolbar. Hidden on mobile,
            where Export sits inline next to the fullscreen toggle instead. */}
        <div className="toolbar-end">
          <ExportMenu
            className="export-menu-desktop"
            open={exportOpen}
            onToggle={() => setExportOpen((o) => !o)}
            onClose={() => setExportOpen(false)}
            menuRef={exportMenuRefDesktop}
            isExporting={isExporting}
            onExportPDF={handleExportPDF}
            onExportDOCX={handleExportDOCX}
            onExportHTML={handleExportHTML}
          />
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
                  const TplIcon = TEMPLATE_ICONS[t.icon] || DEFAULT_TEMPLATE_ICON;
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

        </aside>

        {!previewFullscreen && (
          <main className="builder-preview-stage">
            <div className="preview-scroll" ref={previewScrollRef}>
              <div className="preview-zoom-wrap" style={{ transform: `scale(${previewRenderScale})` }}>
                <PaginatedResume />
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
            {!isMobile && (
              <div className="toolbar-group">
                <button className="icon-btn" onClick={() => setZoom(previewZoom - 0.1)} aria-label="Zoom out"><ZoomOut size={15} /></button>
                <span className="zoom-readout notranslate" translate="no">{Math.round(fullscreenRenderScale * 100)}%</span>
                <button className="icon-btn" onClick={() => setZoom(previewZoom + 0.1)} aria-label="Zoom in"><ZoomIn size={15} /></button>
              </div>
            )}
            <Button variant="secondary" size="sm" icon={Minimize2} onClick={toggleFullscreen}>Exit fullscreen</Button>
          </div>
          <div className="fullscreen-scroll" ref={fullscreenScrollRef}>
            <div className="preview-zoom-wrap" style={{ transform: `scale(${fullscreenRenderScale})` }}>
              <PaginatedResume />
            </div>
          </div>
        </div>
      )}

      {/* Dedicated, permanently-mounted copy that export (PDF/HTML) and nothing
          else reads from. The two visible previews above are conditionally
          rendered (fullscreen vs. inline) and, on mobile, the inline one sits
          inside `.builder-preview-stage`, which is `display:none` by default —
          an ancestor with `display:none` stops its whole subtree from being
          rendered/painted at all, which used to make html2canvas capture a
          blank/zero-size node (so PDF/HTML export silently failed) whenever a
          phone user tapped Export without first opening the fullscreen preview.
          This copy lives outside both conditional branches and is only ever
          pushed off-screen (see .export-source-only in builder.css), never
          display:none'd, so it stays paintable — and therefore exportable —
          no matter what the visible preview is doing. */}
      <div className="export-source-only" aria-hidden="true">
        <PaginatedResume ref={previewRef} />
      </div>
    </div>
  );
}
