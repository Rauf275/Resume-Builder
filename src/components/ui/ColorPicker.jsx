import { useEffect, useRef, useState } from 'react';
import './colorPicker.css';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16) || 0;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function isValidHex(value) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

function normalizeHex(value) {
  if (value.length === 4) {
    return '#' + value.slice(1).split('').map((c) => c + c).join('');
  }
  return value;
}

// A fully custom picker (saturation/value square + hue strip + hex field) instead of
// `<input type="color">`. The native control hands off to whatever color UI the OS
// provides — a small popup on desktop, but a completely different full-screen picker on
// Android/iOS — so the same markup ends up looking and behaving nothing alike across
// devices. Building the picker ourselves means there is only ever one UI, identical on
// every platform, driven by the Pointer Events API so mouse drags and touch drags are
// handled the exact same way.
export default function ColorPicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value);
  const [hsv, setHsv] = useState(() => {
    const { r, g, b } = hexToRgb(value);
    return rgbToHsv(r, g, b);
  });
  const wrapRef = useRef(null);
  const svRef = useRef(null);
  const hueRef = useRef(null);

  // Stay in sync when the value changes from outside this component (e.g. "Reset styling"
  // or switching templates, which loads a different saved color).
  useEffect(() => {
    if (value.toLowerCase() === hex.toLowerCase()) return;
    setHex(value);
    const { r, g, b } = hexToRgb(value);
    setHsv(rgbToHsv(r, g, b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', onOutside);
    return () => document.removeEventListener('pointerdown', onOutside);
  }, [open]);

  function commit(nextHsv) {
    setHsv(nextHsv);
    const { r, g, b } = hsvToRgb(nextHsv.h, nextHsv.s, nextHsv.v);
    const nextHex = rgbToHex(r, g, b);
    setHex(nextHex);
    onChange(nextHex);
  }

  function svValueFromEvent(e) {
    const rect = svRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    commit({ ...hsv, s: x, v: 1 - y });
  }

  function hueValueFromEvent(e) {
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    commit({ ...hsv, h: x * 360 });
  }

  function startDrag(readValue) {
    return (e) => {
      e.preventDefault();
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);
      readValue(e);
      function onMove(ev) { readValue(ev); }
      function onUp() {
        el.releasePointerCapture(e.pointerId);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
      }
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
    };
  }

  function handleHexInput(e) {
    const next = e.target.value;
    setHex(next);
    if (isValidHex(next)) {
      const normalized = normalizeHex(next);
      const { r, g, b } = hexToRgb(normalized);
      setHsv(rgbToHsv(r, g, b));
      onChange(normalized);
    }
  }

  const hueColor = `hsl(${hsv.h}, 100%, 50%)`;

  return (
    <div className="color-picker" ref={wrapRef}>
      <button
        type="button"
        className="color-picker-trigger"
        style={{ background: hex }}
        onClick={() => setOpen((o) => !o)}
        aria-label={label || 'Pick color'}
        aria-expanded={open}
      />
      <span className="color-picker-hex">{hex}</span>

      {open && (
        <div className="color-picker-popover">
          <div
            className="color-picker-sv"
            ref={svRef}
            style={{
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), ${hueColor}`,
            }}
            onPointerDown={startDrag(svValueFromEvent)}
          >
            <div
              className="color-picker-sv-thumb"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
            />
          </div>

          <div className="color-picker-hue" ref={hueRef} onPointerDown={startDrag(hueValueFromEvent)}>
            <div className="color-picker-hue-thumb" style={{ left: `${(hsv.h / 360) * 100}%` }} />
          </div>

          <input
            type="text"
            className="color-picker-hex-input notranslate"
            translate="no"
            value={hex}
            onChange={handleHexInput}
            maxLength={7}
            spellCheck={false}
            aria-label="Hex color value"
          />
        </div>
      )}
    </div>
  );
}
