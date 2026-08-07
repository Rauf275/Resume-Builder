import {
  PanelLeft, Minus, GraduationCap, Landmark, Moon, PenTool, Milestone,
  Code2, Building2, Layers, ListChecks, BookOpen, Sparkles, LayoutGrid,
  Sun, Rows3, CircleUserRound, Newspaper, Image, Frame,
  CircleDot, IdCard, FileBadge, Hexagon,
} from 'lucide-react';

// Single source of truth for template -> lucide icon, keyed by TEMPLATES[].icon.
// Used everywhere a template's icon is rendered (landing page, builder's template
// picker, ...) so every part of the app always shows the exact same SVG for a
// given template — no more risk of one screen's copy drifting from another's.
export const TEMPLATE_ICONS = {
  PanelLeft, Minus, GraduationCap, Landmark, Moon, PenTool, Milestone,
  Code2, Building2, Layers, ListChecks, BookOpen, Sparkles, LayoutGrid,
  Sun, Rows3, CircleUserRound, Newspaper, Image, Frame,
  CircleDot, IdCard, FileBadge, Hexagon,
};

export const DEFAULT_TEMPLATE_ICON = PanelLeft;
