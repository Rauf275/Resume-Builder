import { Input, TextArea } from '../ui/Field';
import RepeatableSection from './RepeatableSection';
import { emptyProject } from '../../constants/resumeSchema';

export default function ProjectsForm() {
  return (
    <RepeatableSection
      section="projects"
      emptyItem={emptyProject}
      titleOf={(it) => it.name || 'New project'}
      subtitleOf={(it) => it.github || it.demo}
      addLabel="Add project"
      renderFields={(item, update) => (
        <>
          <Input label="Project name" value={item.name} onChange={(e) => update({ name: e.target.value })} />
          <TextArea label="Description" rows={2} value={item.description} onChange={(e) => update({ description: e.target.value })} />
          <div className="entry-row">
            <Input label="GitHub" value={item.github} onChange={(e) => update({ github: e.target.value })} placeholder="github.com/user/repo" />
            <Input label="Demo" value={item.demo} onChange={(e) => update({ demo: e.target.value })} placeholder="project-demo.com" />
          </div>
        </>
      )}
    />
  );
}
