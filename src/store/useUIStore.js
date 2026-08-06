import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_CUSTOMIZATION = {
  accentColor: '#B4813F',
  secondaryColor: '#2E4057',
  font: 'Public Sans',
  fontSize: 15,
  fontWeight: 400,
  lineHeight: 1.5,
  headingScale: 1,
  photoPosition: 'left',
  columnRatio: 34,
  pageSize: 'A4',
};

export const useUIStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      templateId: 'modern',
      customization: DEFAULT_CUSTOMIZATION,
      previewZoom: 1,
      previewFullscreen: false,

      toggleTheme() {
        set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' }));
      },

      setTemplate(id, defaultColor) {
        set((s) => ({
          templateId: id,
          customization: defaultColor
            ? { ...s.customization, accentColor: defaultColor }
            : s.customization,
        }));
      },

      setCustomization(patch) {
        set((s) => ({ customization: { ...s.customization, ...patch } }));
      },

      resetCustomization() {
        set({ customization: DEFAULT_CUSTOMIZATION });
      },

      setZoom(z) {
        set({ previewZoom: Math.min(1.4, Math.max(0.4, z)) });
      },

      toggleFullscreen() {
        set((s) => ({ previewFullscreen: !s.previewFullscreen }));
      },
    }),
    { name: 'resume-builder-pro:ui',
      merge: (persistedState, currentState) => {
        const persisted = persistedState || {};
        return {
          ...currentState,
          ...persisted,
          customization: { ...DEFAULT_CUSTOMIZATION, ...persisted.customization },
        };
      },
    }
  )
);
