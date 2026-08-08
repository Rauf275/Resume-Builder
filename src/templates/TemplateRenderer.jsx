import { useEffect, useRef } from 'react';
import Modern from './Modern';
import Minimal from './Minimal';
import Harvard from './Harvard';
import Executive from './Executive';
import Dark from './Dark';
import Designer from './Designer';
import Timeline from './Timeline';
import TwoColumnTech from './TwoColumnTech';
import Corporate from './Corporate';
import Contemporary from './Contemporary';
import CompactAts from './CompactAts';
import Student from './Student';
import Elegant from './Elegant';
import GridCards from './GridCards';
import Portrait from './Portrait';
import Bulletin from './Bulletin';
import CoverBanner from './CoverBanner';
import ExecutiveFrame from './ExecutiveFrame';
import Aurora from './Aurora';
import Skyline from './Skyline';
import Halo from './Halo';
import Ledger from './Ledger';
import Briefing from './Briefing';
import Nova from './Nova';
import Monogram from './Monogram';
import Horizon from './Horizon';
import Atlas from './Atlas';
import Vantage from './Vantage';
import Lumen from './Lumen';
import Foundry from './Foundry';
import './resumeBase.css';

const COMPONENTS = {
  modern: Modern,
  minimal: Minimal,
  harvard: Harvard,
  executive: Executive,
  dark: Dark,
  designer: Designer,
  timeline: Timeline,
  twocolumn: TwoColumnTech,
  corporate: Corporate,
  contemporary: Contemporary,
  compactats: CompactAts,
  student: Student,
  elegant: Elegant,
  gridcards: GridCards,
  portrait: Portrait,
  bulletin: Bulletin,
  coverbanner: CoverBanner,
  executiveframe: ExecutiveFrame,
  aurora: Aurora,
  skyline: Skyline,
  halo: Halo,
  ledger: Ledger,
  briefing: Briefing,
  nova: Nova,
  monogram: Monogram,
  horizon: Horizon,
  atlas: Atlas,
  vantage: Vantage,
  lumen: Lumen,
  foundry: Foundry,
};

export default function TemplateRenderer({ templateId, resume, customization, pageClass }) {
  const Component = COMPONENTS[templateId] || Modern;
  const wrapRef = useRef(null);

  // Dev-only safety net: every template is expected to drop <BirthDateLine />
  // (see sectionContent.jsx) next to the name so a filled-in birth date
  // actually shows up. It's easy to forget when wiring up a new template —
  // this catches it immediately in the console instead of the omission
  // going unnoticed the way it did for Atlas/Vantage/Lumen/Monogram/Horizon/
  // Foundry. Only runs in dev builds; no-op in production.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!resume.personal.birthDate) return;
    if (!wrapRef.current) return;
    if (!wrapRef.current.querySelector('.res-birthdate')) {
      console.warn(
        `[TemplateRenderer] Template "${templateId}" doesn't render the birth date. ` +
        `Add <BirthDateLine resume={resume} /> (from ./sectionContent) next to the name.`
      );
    }
  }, [templateId, resume.personal.birthDate]);

  return (
    <div ref={wrapRef}>
      <Component resume={resume} customization={customization} pageClass={pageClass} />
    </div>
  );
}
