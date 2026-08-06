import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, ChevronDown, Trash2, Briefcase, GraduationCap, Sparkles, Languages, Award, FolderGit2, Heart } from 'lucide-react';
import { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { SECTION_META } from '../../constants/resumeSchema';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';
import SkillsForm from './SkillsForm';
import LanguagesForm from './LanguagesForm';
import CertificatesForm from './CertificatesForm';
import ProjectsForm from './ProjectsForm';
import InterestsForm from './InterestsForm';
import CustomSectionForm from './CustomSectionForm';
import AddCustomSectionForm, { CUSTOM_ICON_MAP } from './AddCustomSectionForm';

const ICONS = { Briefcase, GraduationCap, Sparkles, Languages, Award, FolderGit2, Heart };

const FORM_COMPONENTS = {
  experience: ExperienceForm,
  education: EducationForm,
  skills: SkillsForm,
  languages: LanguagesForm,
  certificates: CertificatesForm,
  projects: ProjectsForm,
  interests: InterestsForm,
};

function isCustomKey(key) {
  return typeof key === 'string' && key.startsWith('custom-');
}

function SortableBlock({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="form-section-wrapper">
      {children({ attributes, listeners })}
    </div>
  );
}

export default function SectionList() {
  const sectionOrder = useResumeStore((s) => s.sectionOrder);
  const setSectionOrder = useResumeStore((s) => s.setSectionOrder);
  const hiddenSections = useResumeStore((s) => s.hiddenSections);
  const toggleSectionVisibility = useResumeStore((s) => s.toggleSectionVisibility);
  const customSections = useResumeStore((s) => s.resume.customSections || []);
  const updateCustomSectionMeta = useResumeStore((s) => s.updateCustomSectionMeta);
  const removeCustomSection = useResumeStore((s) => s.removeCustomSection);
  const [collapsed, setCollapsed] = useState({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionOrder.indexOf(active.id);
    const newIndex = sectionOrder.indexOf(over.id);
    setSectionOrder(arrayMove(sectionOrder, oldIndex, newIndex));
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          {sectionOrder.map((sectionKey) => {
            const custom = isCustomKey(sectionKey);
            const customMeta = custom ? customSections.find((s) => s.id === sectionKey) : null;
            if (custom && !customMeta) return null;

            const label = custom ? customMeta.title : SECTION_META[sectionKey].label;
            const Icon = custom ? (CUSTOM_ICON_MAP[customMeta.icon] || CUSTOM_ICON_MAP.Star) : ICONS[SECTION_META[sectionKey].icon];
            const FormComponent = custom ? null : FORM_COMPONENTS[sectionKey];
            const isHidden = hiddenSections.includes(sectionKey);
            const isCollapsed = collapsed[sectionKey];

            return (
              <SortableBlock key={sectionKey} id={sectionKey}>
                {({ attributes, listeners }) => (
                  <div className="section-block" style={{ opacity: isHidden ? 0.5 : 1 }}>
                    <div className="section-block-head">
                      <div className="section-block-head-left">
                        <span className="entry-drag-handle" {...attributes} {...listeners}>
                          <GripVertical size={16} />
                        </span>
                        <span className="section-block-icon">
                          <Icon size={15} />
                        </span>
                        {custom ? (
                          <input
                            className="custom-section-title-input"
                            value={customMeta.title}
                            onChange={(e) => updateCustomSectionMeta(sectionKey, { title: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="section-block-title"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setCollapsed((c) => ({ ...c, [sectionKey]: !c[sectionKey] }))}
                          >
                            {label}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {custom && (
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => removeCustomSection(sectionKey)}
                            aria-label="Delete section"
                            title="Delete this section"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => toggleSectionVisibility(sectionKey)}
                          aria-label={isHidden ? 'Show section' : 'Hide section'}
                          title={isHidden ? 'Hidden in preview' : 'Visible in preview'}
                        >
                          {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setCollapsed((c) => ({ ...c, [sectionKey]: !c[sectionKey] }))}
                        >
                          <ChevronDown size={14} style={{ transform: isCollapsed ? 'none' : 'rotate(180deg)', transition: 'transform .15s' }} />
                        </button>
                      </div>
                    </div>
                    {!isCollapsed && (custom ? <CustomSectionForm sectionId={sectionKey} /> : <FormComponent />)}
                  </div>
                )}
              </SortableBlock>
            );
          })}
        </SortableContext>
      </DndContext>
      <div className="form-section-wrapper" style={{ borderBottom: 'none' }}>
        <AddCustomSectionForm />
      </div>
    </>
  );
}
