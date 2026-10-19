import { fetchProjects } from "../api/shotgridApi";
import { useLoadedData } from "../hooks/useLoadedData";

interface ProjectPickerProps {
  selectedId: number | null;
  onSelect: (projectId: number | null) => void;
}

export function ProjectPicker({ selectedId, onSelect }: ProjectPickerProps) {
  const { data: projects, isLoading, error } = useLoadedData(fetchProjects);

  if (isLoading)
    return <p className="shotgrid-page__note">Loading projects…</p>;
  if (error) return <p className="form-error">{error}</p>;

  return (
    <label className="form-field shotgrid-page__picker">
      Project
      <select
        className="text-input"
        value={selectedId ?? ""}
        onChange={(event) =>
          onSelect(event.target.value ? Number(event.target.value) : null)
        }
      >
        <option value="">Choose a project…</option>
        {(projects ?? []).map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </label>
  );
}
