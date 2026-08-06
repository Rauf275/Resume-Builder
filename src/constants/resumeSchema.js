export const SECTION_TYPES = {
  PERSONAL: 'personal',
  ABOUT: 'about',
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  SKILLS: 'skills',
  LANGUAGES: 'languages',
  CERTIFICATES: 'certificates',
  PROJECTS: 'projects',
  INTERESTS: 'interests',
};

export const CUSTOM_SECTION_ICONS = [
  'Star', 'FileText', 'Award', 'Heart', 'Globe', 'Bookmark',
  'Flag', 'Trophy', 'Users', 'Link2', 'Mic', 'Quote',
];

export const SECTION_META = {
  [SECTION_TYPES.EXPERIENCE]: { label: 'Experience', icon: 'Briefcase' },
  [SECTION_TYPES.EDUCATION]: { label: 'Education', icon: 'GraduationCap' },
  [SECTION_TYPES.SKILLS]: { label: 'Skills', icon: 'Sparkles' },
  [SECTION_TYPES.LANGUAGES]: { label: 'Languages', icon: 'Languages' },
  [SECTION_TYPES.CERTIFICATES]: { label: 'Certificates', icon: 'Award' },
  [SECTION_TYPES.PROJECTS]: { label: 'Projects', icon: 'FolderGit2' },
  [SECTION_TYPES.INTERESTS]: { label: 'Interests', icon: 'Heart' },
};

export const DEFAULT_SECTION_ORDER = [
  SECTION_TYPES.EXPERIENCE,
  SECTION_TYPES.EDUCATION,
  SECTION_TYPES.SKILLS,
  SECTION_TYPES.PROJECTS,
  SECTION_TYPES.LANGUAGES,
  SECTION_TYPES.CERTIFICATES,
  SECTION_TYPES.INTERESTS,
];

export const emptyExperience = () => ({
  id: crypto.randomUUID(),
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
});

export const emptyEducation = () => ({
  id: crypto.randomUUID(),
  school: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  description: '',
});

export const emptyCertificate = () => ({
  id: crypto.randomUUID(),
  name: '',
  issuer: '',
  date: '',
});

export const emptyProject = () => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  github: '',
  demo: '',
});

export const emptyCustomItem = () => ({
  id: crypto.randomUUID(),
  title: '',
  subtitle: '',
  date: '',
  description: '',
});

export const emptyLanguage = () => ({
  id: crypto.randomUUID(),
  name: '',
  level: 'Intermediate',
});

// Used only to populate template thumbnails/previews in the template gallery,
// so users can see what a filled-in resume looks like in each style. Never used
// as the starting state for a real, editable resume — see DEFAULT_RESUME below.
export const DEMO_RESUME = {
  personal: {
    photo: '',
    firstName: 'Alex',
    lastName: 'Morgan',
    title: 'Senior Product Designer',
    email: 'alex.morgan@email.com',
    phone: '+1 (415) 555-0142',
    address: 'San Francisco, CA',
    github: '',
    linkedin: 'linkedin.com/in/alexmorgan',
    website: '',
    telegram: '',
  },
  about:
    'Product designer with 7+ years crafting design systems and B2B SaaS products. I turn ambiguous problems into clear, usable interfaces, and I care as much about the engineering handoff as the pixel.',
  experience: [
    {
      id: crypto.randomUUID(),
      company: 'Northwind Labs',
      position: 'Senior Product Designer',
      startDate: '2022-03',
      endDate: '',
      current: true,
      description:
        'Leading design for the core platform team. Shipped a new design system adopted across 6 product squads, cutting design-to-dev handoff time by 40%.',
    },
    {
      id: crypto.randomUUID(),
      company: 'Fieldstone',
      position: 'Product Designer',
      startDate: '2019-06',
      endDate: '2022-02',
      current: false,
      description:
        'Owned onboarding and billing flows for a fintech product. Ran quarterly usability studies that informed the 2021 redesign.',
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      school: 'University of Washington',
      degree: 'B.A.',
      field: 'Human-Computer Interaction',
      startDate: '2015-09',
      endDate: '2019-05',
      description: '',
    },
  ],
  skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'React', 'Accessibility'],
  languages: [
    { id: crypto.randomUUID(), name: 'English', level: 'Native' },
    { id: crypto.randomUUID(), name: 'Spanish', level: 'Professional' },
  ],
  certificates: [
    { id: crypto.randomUUID(), name: 'Certified Usability Analyst', issuer: 'HFI', date: '2021-04' },
  ],
  projects: [
    {
      id: crypto.randomUUID(),
      name: 'Compass Design System',
      description: 'Open-source component library used by 4 internal teams.',
      github: 'github.com/alexmorgan/compass',
      demo: '',
    },
  ],
  interests: ['Ceramics', 'Trail running', 'Analog photography'],
  customSections: [],
  customItems: {},
};

// The actual starting state for a new (or reset) resume in the editor — fully blank,
// so the user isn't left deleting sample content before they can start.
export const DEFAULT_RESUME = {
  personal: {
    photo: '',
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    github: '',
    linkedin: '',
    website: '',
    telegram: '',
  },
  about: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certificates: [],
  projects: [],
  interests: [],
  // User-defined sections beyond the built-in ones.
  // customSections: [{ id: 'custom-xxx', title: 'Publications', icon: 'FileText' }]
  // customItems: { 'custom-xxx': [{ id, title, subtitle, date, description }] }
  customSections: [],
  customItems: {},
};
