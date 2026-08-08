import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Pipette } from 'lucide-react';
import { clamp, hexToHsv, hsvToHex, hexToRgb, rgbToHex, normalizeHex, isValidHex } from '../../utils/color';
import './colorPicker.css';

const POPOVER_W = 232;
const POPOVER_H = 356;
const MARGIN = 10;

export default function ColorPickerPopover({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [hexDraft, setHexDraft] = useState(value);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const svRef = useRef(null);
  const hueRef = useRef(null);
  const draggingRef = useRef(null);

  const hsv = hexToHsv(value);
  const rgb = hexToRgb(value);
  const supportsEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  useEffect(() => {
    setHexDraft(value);
  }, [value]);

  // Position the popover next to wherever the trigger actually is, flipping above/below
  // and clamping to the viewport so it's never rendered partly off-screen — the whole
  // point of moving off the native <input type="color"> picker.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < POPOVER_H + MARGIN && rect.top > POPOVER_H + MARGIN;

    let top = openUp ? rect.top - POPOVER_H - 8 : rect.bottom + 8;
    top = clamp(top, MARGIN, window.innerHeight - POPOVER_H - MARGIN);

    let left = rect.left;
    left = clamp(left, MARGIN, window.innerWidth - POPOVER_W - MARGIN);

    setPos({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocDown(e) {
      if (popoverRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onReflow() {
      setOpen(false);
    }
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [open]);

  function commitHsv(nextHsv) {
    onChange(hsvToHex({ ...hsv, ...nextHsv }));
  }

  function svPointToHsv(clientX, clientY) {
    const rect = svRef.current.getBoundingClientRect();
    const s = clamp((clientX - rect.left) / rect.width, 0, 1);
    const v = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
    return { s, v };
  }

  function huePointToHue(clientX) {
    const rect = hueRef.current.getBoundingClientRect();
    return clamp((clientX - rect.left) / rect.width, 0, 1) * 360;
  }

  function handlePointerMove(e) {
    if (draggingRef.current === 'sv') commitHsv(svPointToHsv(e.clientX, e.clientY));
    else if (draggingRef.current === 'hue') commitHsv({ h: huePointToHue(e.clientX) });
  }

  function endDrag() {
    draggingRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', endDrag);
  }

  function startDrag(type, e) {
    draggingRef.current = type;
    if (type === 'sv') commitHsv(svPointToHsv(e.clientX, e.clientY));
    else commitHsv({ h: huePointToHue(e.clientX) });
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', endDrag);
  }

  function handleHexInput(v) {
    setHexDraft(v);
    const withHash = v.startsWith('#') ? v : `#${v}`;
    if (isValidHex(withHash)) onChange(normalizeHex(withHash));
  }

  function handleHexBlur() {
    setHexDraft(normalizeHex(hexDraft));
  }

  function handleRgbChange(channel, raw) {
    const n = clamp(Number(raw) || 0, 0, 255);
    onChange(rgbToHex({ ...rgb, [channel]: n }));
  }

  async function handleEyeDropper() {
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) onChange(normalizeHex(result.sRGBHex));
    } catch {
      // User cancelled the pick (Escape) — nothing to do.
    }
  }

  const pureHueHex = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="color-swatch-trigger"
        style={{ background: value }}
        onClick={() => setOpen((o) => !o)}
        aria-label={`${label}: ${value}`}
      />
      {open && pos && (
        <div
          ref={popoverRef}
          className="color-popover notranslate"
          translate="no"
          style={{ top: pos.top, left: pos.left, width: POPOVER_W }}
        >
          <div
            ref={svRef}
            className="color-sv-square"
            style={{ background: pureHueHex }}
            onPointerDown={(e) => startDrag('sv', e)}
          >
            <div className="color-sv-white" />
            <div className="color-sv-black" />
            <div
              className="color-sv-thumb"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: value }}
            />
          </div>

          <div ref={hueRef} className="color-hue-slider" onPointerDown={(e) => startDrag('hue', e)}>
            <div className="color-hue-thumb" style={{ left: `${(hsv.h / 360) * 100}%`, background: pureHueHex }} />
          </div>

          <div className="color-fields-row">
            <div className="color-hex-field">
              <span>#</span>
              <input
                value={hexDraft.replace('#', '')}
                onChange={(e) => handleHexInput(e.target.value)}
                onBlur={handleHexBlur}
                maxLength={6}
                spellCheck={false}
              />
            </div>
            {supportsEyeDropper && (
              <button type="button" className="color-eyedropper-btn" onClick={handleEyeDropper} aria-label="Pick color from screen" title="Pick color from screen">
                <Pipette size={15} />
              </button>
            )}
          </div>

          <div className="color-rgb-row">
            {['r', 'g', 'b'].map((ch) => (
              <label key={ch} className="color-rgb-field">
                <span>{ch.toUpperCase()}</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[ch]}
                  onChange={(e) => handleRgbChange(ch, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
