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
      // Each template keeps its own customization object, keyed by template id,
      // so changing colors/fonts on one template never bleeds into another.
      customizationByTemplate: {},
      // Mirrors customizationByTemplate[templateId] for the currently active
      // template — kept in sync so existing consumers can keep reading
      // `customization` directly instead of looking it up by id everywhere.
      customization: DEFAULT_CUSTOMIZATION,
      previewZoom: 1,
      previewFullscreen: false,

      toggleTheme() {
        set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' }));
      },

      setTemplate(id, defaultColor) {
        set((s) => {
          const existing = s.customizationByTemplate[id];
          // First time this template is opened: seed it from the defaults,
          // using the template's own suggested accent color if it has one.
          const initial = existing || {
            ...DEFAULT_CUSTOMIZATION,
            ...(defaultColor ? { accentColor: defaultColor } : {}),
          };
          return {
            templateId: id,
            customization: initial,
            customizationByTemplate: existing
              ? s.customizationByTemplate
              : { ...s.customizationByTemplate, [id]: initial },
          };
        });
      },

      setCustomization(patch) {
        set((s) => {
          const updated = { ...s.customization, ...patch };
          return {
            customization: updated,
            customizationByTemplate: { ...s.customizationByTemplate, [s.templateId]: updated },
          };
        });
      },

      resetCustomization() {
        set((s) => ({
          customization: DEFAULT_CUSTOMIZATION,
          customizationByTemplate: { ...s.customizationByTemplate, [s.templateId]: DEFAULT_CUSTOMIZATION },
        }));
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
        const customizationByTemplate = persisted.customizationByTemplate || {};
        const templateId = persisted.templateId || currentState.templateId;
        return {
          ...currentState,
          ...persisted,
          customizationByTemplate,
          // Rehydrate the active template's customization from its own bucket
          // (falling back to legacy single-`customization` saves, then defaults).
          customization: {
            ...DEFAULT_CUSTOMIZATION,
            ...(customizationByTemplate[templateId] || persisted.customization),
          },
        };
      },
    }
  )
);
