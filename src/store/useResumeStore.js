import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_RESUME, DEFAULT_SECTION_ORDER } from '../constants/resumeSchema';

// A resume with a large embedded photo can push the persisted state past
// localStorage's per-origin quota (~5MB in most browsers, often tighter on
// mobile). Left unguarded, that setItem() throws QuotaExceededError deep
// inside zustand's persist middleware — with no error boundary in the app,
// that crashes the whole render tree to a blank white screen, including on
// every future load, since the store keeps trying to write the same
// oversized state. Swallowing the write failure keeps the app alive; the
// person loses persistence for that session instead of losing the app.
const safeLocalStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (err) {
      console.error('Could not save resume data (storage full or unavailable):', err);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export const useResumeStore = create(
  persist(
    (set, get) => ({
      resume: DEFAULT_RESUME,
      sectionOrder: DEFAULT_SECTION_ORDER,
      hiddenSections: [],

      updateResume(path, value) {
        set((s) => {
          const resume = structuredClone(s.resume);
          let obj = resume;
          for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
          obj[path[path.length - 1]] = value;
          return { resume };
        });
      },

      updatePersonal(field, value) {
        get().updateResume(['personal', field], value);
      },

      updateAbout(value) {
        get().updateResume(['about'], value);
      },

      addListItem(section, item) {
        set((s) => ({
          resume: { ...s.resume, [section]: [...s.resume[section], item] },
        }));
      },

      updateListItem(section, id, patch) {
        set((s) => ({
          resume: {
            ...s.resume,
            [section]: s.resume[section].map((it) => (it.id === id ? { ...it, ...patch } : it)),
          },
        }));
      },

      removeListItem(section, id) {
        set((s) => ({
          resume: { ...s.resume, [section]: s.resume[section].filter((it) => it.id !== id) },
        }));
      },

      reorderListItems(section, fromIndex, toIndex) {
        set((s) => {
          const arr = [...s.resume[section]];
          const [moved] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, moved);
          return { resume: { ...s.resume, [section]: arr } };
        });
      },

      addTag(section, value) {
        if (!value.trim()) return;
        set((s) => ({
          resume: { ...s.resume, [section]: [...s.resume[section], value.trim()] },
        }));
      },

      removeTag(section, index) {
        set((s) => ({
          resume: { ...s.resume, [section]: s.resume[section].filter((_, i) => i !== index) },
        }));
      },

      setSectionOrder(order) {
        set({ sectionOrder: order });
      },

      toggleSectionVisibility(section) {
        set((s) => ({
          hiddenSections: s.hiddenSections.includes(section)
            ? s.hiddenSections.filter((x) => x !== section)
            : [...s.hiddenSections, section],
        }));
      },

      // ---------- Custom (user-defined) sections ----------
      addCustomSection(title, icon, type = 'entries') {
        const id = `custom-${crypto.randomUUID()}`;
        set((s) => ({
          resume: {
            ...s.resume,
            customSections: [...(s.resume.customSections || []), { id, title: title || 'New section', icon: icon || 'Star', type }],
            customItems: { ...(s.resume.customItems || {}), [id]: [] },
            customTags: { ...(s.resume.customTags || {}), [id]: [] },
          },
          sectionOrder: [...s.sectionOrder, id],
        }));
        return id;
      },

      updateCustomSectionMeta(id, patch) {
        set((s) => ({
          resume: {
            ...s.resume,
            customSections: (s.resume.customSections || []).map((sec) => (sec.id === id ? { ...sec, ...patch } : sec)),
          },
        }));
      },

      removeCustomSection(id) {
        set((s) => {
          const customItems = { ...(s.resume.customItems || {}) };
          delete customItems[id];
          const customTags = { ...(s.resume.customTags || {}) };
          delete customTags[id];
          return {
            resume: {
              ...s.resume,
              customSections: (s.resume.customSections || []).filter((sec) => sec.id !== id),
              customItems,
              customTags,
            },
            sectionOrder: s.sectionOrder.filter((k) => k !== id),
            hiddenSections: s.hiddenSections.filter((k) => k !== id),
          };
        });
      },

      addCustomItem(sectionId, item) {
        set((s) => ({
          resume: {
            ...s.resume,
            customItems: {
              ...(s.resume.customItems || {}),
              [sectionId]: [...((s.resume.customItems || {})[sectionId] || []), item],
            },
          },
        }));
      },

      updateCustomItem(sectionId, itemId, patch) {
        set((s) => ({
          resume: {
            ...s.resume,
            customItems: {
              ...(s.resume.customItems || {}),
              [sectionId]: ((s.resume.customItems || {})[sectionId] || []).map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
            },
          },
        }));
      },

      removeCustomItem(sectionId, itemId) {
        set((s) => ({
          resume: {
            ...s.resume,
            customItems: {
              ...(s.resume.customItems || {}),
              [sectionId]: ((s.resume.customItems || {})[sectionId] || []).filter((it) => it.id !== itemId),
            },
          },
        }));
      },

      // Tag-style custom sections (mini colored pills, same as Skills/Interests)
      // store their values in `customTags`, separate from the entry-card
      // sections in `customItems`, since a "tag" is a plain string, not an
      // object with title/subtitle/date/description.
      addCustomTag(sectionId, value) {
        if (!value.trim()) return;
        set((s) => ({
          resume: {
            ...s.resume,
            customTags: {
              ...(s.resume.customTags || {}),
              [sectionId]: [...((s.resume.customTags || {})[sectionId] || []), value.trim()],
            },
          },
        }));
      },

      removeCustomTag(sectionId, index) {
        set((s) => ({
          resume: {
            ...s.resume,
            customTags: {
              ...(s.resume.customTags || {}),
              [sectionId]: ((s.resume.customTags || {})[sectionId] || []).filter((_, i) => i !== index),
            },
          },
        }));
      },

      loadResume(data) {
        set({
          resume: {
            ...DEFAULT_RESUME,
            ...data.resume,
            customSections: data.resume?.customSections ?? [],
            customItems: data.resume?.customItems ?? {},
            customTags: data.resume?.customTags ?? {},
          },
          sectionOrder: data.sectionOrder ?? DEFAULT_SECTION_ORDER,
          hiddenSections: data.hiddenSections ?? [],
        });
      },

      resetResume() {
        set({
          resume: DEFAULT_RESUME,
          sectionOrder: DEFAULT_SECTION_ORDER,
          hiddenSections: [],
        });
      },
    }),
    {
      name: 'resume-builder-pro:data',
      version: 2,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (s) => ({
        resume: s.resume,
        sectionOrder: s.sectionOrder,
        hiddenSections: s.hiddenSections,
      }),
      // Anyone who used the app before custom sections (or before tag-style custom
      // sections) existed has old data in localStorage without `customSections` /
      // `customItems` / `customTags`. Without this, reading `resume.customItems[someKey]`
      // on load throws and the whole page fails to render.
      migrate: (persistedState) => {
        const state = persistedState || {};
        return {
          ...state,
          resume: {
            ...DEFAULT_RESUME,
            ...state.resume,
            customSections: state.resume?.customSections ?? [],
            customItems: state.resume?.customItems ?? {},
            customTags: state.resume?.customTags ?? {},
          },
        };
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState || {};
        return {
          ...currentState,
          ...persisted,
          resume: {
            ...DEFAULT_RESUME,
            ...currentState.resume,
            ...persisted.resume,
            customSections: persisted.resume?.customSections ?? [],
            customItems: persisted.resume?.customItems ?? {},
            customTags: persisted.resume?.customTags ?? {},
          },
        };
      },
    }
  )
);
