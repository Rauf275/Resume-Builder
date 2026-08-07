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
};

export default function TemplateRenderer({ templateId, resume, customization, pageClass }) {
  const Component = COMPONENTS[templateId] || Modern;
  return <Component resume={resume} customization={customization} pageClass={pageClass} />;
}
