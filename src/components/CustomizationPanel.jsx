import { Select } from './ui/Field';
import { useUIStore } from '../store/useUIStore';
import { RotateCcw } from 'lucide-react';
import Button from './ui/Button';
import ColorPicker from './ui/ColorPicker';
import './customizationPanel.css';

const FONT_GROUPS = [
  { label: 'Sans-serif', fonts: ['Public Sans', 'Inter', 'Manrope', 'DM Sans', 'Source Sans 3', 'IBM Plex Sans', 'Lato', 'Nunito Sans'] },
  { label: 'Serif', fonts: ['Fraunces', 'Merriweather', 'Georgia'] },
  { label: 'Monospace', fonts: ['JetBrains Mono'] },
];

// Google Translate rewrites text nodes in the DOM. Because these labels include a value
// that changes on every slider tick, React and Google Translate end up fighting over the
// same text node, which can throw and silently break the input's event handling.
// `translate="no"` (plus the `notranslate` class as a fallback for older GT versions)
// tells Google Translate to leave this whole panel alone.
export default function CustomizationPanel() {
  const customization = useUIStore((s) => s.customization);
  const setCustomization = useUIStore((s) => s.setCustomization);
  const resetCustomization = useUIStore((s) => s.resetCustomization);

  return (
    <div className="customization-panel notranslate" translate="no">
      <div className="cust-row">
        <label className="cust-label">Accent color</label>
        <ColorPicker
          label="Accent color"
          value={customization.accentColor}
          onChange={(hex) => setCustomization({ accentColor: hex })}
        />
      </div>
      <div className="cust-row">
        <label className="cust-label">Secondary color</label>
        <ColorPicker
          label="Secondary color"
          value={customization.secondaryColor}
          onChange={(hex) => setCustomization({ secondaryColor: hex })}
        />
      </div>

      <Select label="Font" value={customization.font} onChange={(e) => setCustomization({ font: e.target.value })}>
        {FONT_GROUPS.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.fonts.map((f) => <option key={f} value={f}>{f}</option>)}
          </optgroup>
        ))}
      </Select>

      <div className="cust-row">
        <label className="cust-label">Text size <b>({customization.fontSize}px)</b></label>
        <input type="range" min="12" max="18" value={customization.fontSize} onChange={(e) => setCustomization({ fontSize: Number(e.target.value) })} />
      </div>
      <div className="cust-row">
        <label className="cust-label">Font weight <b>({customization.fontWeight})</b></label>
        <input
          type="range" min="400" max="700" step="100"
          value={customization.fontWeight}
          onChange={(e) => setCustomization({ fontWeight: Number(e.target.value) })}
        />
      </div>
      <div className="cust-row">
        <label className="cust-label">Line height <b>({customization.lineHeight})</b></label>
        <input type="range" min="1.2" max="1.9" step="0.05" value={customization.lineHeight} onChange={(e) => setCustomization({ lineHeight: Number(e.target.value) })} />
      </div>
      <div className="cust-row">
        <label className="cust-label">Heading scale <b>({customization.headingScale}×)</b></label>
        <input type="range" min="0.85" max="1.25" step="0.05" value={customization.headingScale} onChange={(e) => setCustomization({ headingScale: Number(e.target.value) })} />
      </div>
      <div className="cust-row">
        <label className="cust-label">Column width <b>({customization.columnRatio}%)</b></label>
        <input type="range" min="24" max="46" value={customization.columnRatio} onChange={(e) => setCustomization({ columnRatio: Number(e.target.value) })} />
      </div>

      <Select label="Page size" value={customization.pageSize} onChange={(e) => setCustomization({ pageSize: e.target.value })}>
        <option value="A4">A4</option>
        <option value="Letter">Letter</option>
      </Select>

      <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetCustomization}>Reset styling</Button>
    </div>
  );
}
