import { Link } from 'react-router-dom';
import {
  ArrowRight, Zap, LayoutTemplate, Palette, Download, MousePointer2, ShieldCheck,
} from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import { TEMPLATES } from '../constants/templates';
import { TEMPLATE_ICONS, DEFAULT_TEMPLATE_ICON } from '../constants/templateIcons';
import './landing.css';

const FEATURES = [
  { icon: Zap, title: 'Live preview', text: 'Every keystroke updates your resume on the right — no refresh, no "update" button.' },
  { icon: LayoutTemplate, title: `${TEMPLATES.length} real layouts`, text: `Not ${TEMPLATES.length} recolors of one layout — different columns, headers, and section structure.` },
  { icon: Palette, title: 'Full styling control', text: 'Accent color, font, spacing, and heading scale, tuned live against your own content.' },
  { icon: MousePointer2, title: 'Drag to reorder', text: 'Pick up any section and drop it where it should go. Preview reorders instantly.' },
  { icon: Download, title: 'Export anywhere', text: 'PDF for applications, DOCX for editors that want it, or a shareable HTML page.' },
  { icon: ShieldCheck, title: 'Nothing leaves your browser', text: 'No account, no server. Your resume autosaves to this device only.' },
];

const STEPS = [
  { n: '1', title: 'Fill in your details', text: 'Personal info, experience, education — organized into clear sections.' },
  { n: '2', title: 'Pick a template', text: 'Switch freely. Your content carries over, the layout does not change it.' },
  { n: '3', title: 'Export and apply', text: 'Download a polished PDF in seconds, ready for your next application.' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <Header />

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">No sign-up · Saves to this device</span>
          <h1 className="hero-title">
            A resume that <em>looks</em> like you spent a designer's fee on it.
          </h1>
          <p className="hero-sub">
            Fill in your experience once. Watch it typeset itself across {TEMPLATES.length} distinct layouts,
            export a pixel-accurate PDF, and keep editing whenever you like — it's all saved right here.
          </p>
          <div className="hero-actions">
            <Link to="/builder"><Button variant="accent" size="lg" icon={ArrowRight}>Create your resume</Button></Link>
            <Link to="/templates"><Button variant="secondary" size="lg">Browse templates</Button></Link>
          </div>
        </div>

        <div className="hero-stack" aria-hidden="true">
          {[
            { rot: -9, top: 26, accent: '#B4813F', bar: 62 },
            { rot: 4, top: 6, accent: '#2E4057', bar: 82 },
            { rot: -2, top: 0, accent: '#3E8F63', bar: 48 },
          ].map((card, i) => (
            <div
              key={i}
              className="hero-card"
              style={{ transform: `rotate(${card.rot}deg) translateY(${card.top}px)`, zIndex: 3 - i }}
            >
              <div className="hero-card-head" style={{ background: card.accent }} />
              <div className="hero-card-lines">
                <span style={{ width: '70%' }} />
                <span style={{ width: '55%' }} />
                <span style={{ width: `${card.bar}%`, background: card.accent, opacity: .35 }} />
                <span style={{ width: '90%' }} />
                <span style={{ width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-head">
          <span className="eyebrow">Why it feels different</span>
          <h2>Built like a product, not a form generator</h2>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon"><f.icon size={18} /></div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrap steps-section">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>Three steps, no account needed</h2>
        </div>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div className="step-card" key={s.n}>
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-head">
          <span className="eyebrow">The template catalog</span>
          <h2>{TEMPLATES.length} layouts, each with its own logic</h2>
        </div>
        <div className="template-strip">
          {TEMPLATES.map((t) => {
            const TplIcon = TEMPLATE_ICONS[t.icon] || DEFAULT_TEMPLATE_ICON;
            return (
              <Link to="/templates" key={t.id} className="template-chip">
                <span className="template-chip-icon" style={{ color: t.defaultColor }}>
                  <TplIcon size={18} strokeWidth={2} />
                </span>
                <div>
                  <strong>{t.name}</strong>
                  <p>{t.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="final-cta">
        <h2>Your next resume takes about ten minutes.</h2>
        <p>Everything you write stays on this device until you decide to export it.</p>
        <Link to="/builder"><Button variant="accent" size="lg" icon={ArrowRight}>Start building</Button></Link>
      </section>

      <footer className="landing-footer">
        <span>Resume Builder Pro</span>
        <span>No accounts. No tracking your resume content. Just a fast editor.</span>
      </footer>
    </div>
  );
}
