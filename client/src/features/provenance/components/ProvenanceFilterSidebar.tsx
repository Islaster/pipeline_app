import type { TreeOptions } from "../helpers/treeOptions";
import type { ProvenanceProject } from "../api/provenanceApi";
import "../../filter-sidebar/filterSidebar.css";

interface ProvenanceFilterSidebarProps {
  sequences: string[];
  sequence: string | null;
  onSelectSequence: (sequence: string | null) => void;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  shots: string[];
  totalShots: number;
  selectedShot: string | null;
  onSelectShot: (shotCode: string) => void;
  options: TreeOptions;
  onOptionsChange: (options: TreeOptions) => void;
  error: string | null;
  projects: ProvenanceProject[];
  projectId: number | null;
  onSelectProject: (projectId: number) => void;
}

function chipClass(isActive: boolean): string {
  return `filter-sidebar__chip${
    isActive ? " filter-sidebar__chip--active" : ""
  }`;
}

function optionClass(isActive: boolean): string {
  return `filter-sidebar__option${
    isActive ? " filter-sidebar__option--active" : ""
  }`;
}

export function ProvenanceFilterSidebar(props: ProvenanceFilterSidebarProps) {
  const {
    shots,
    totalShots,
    selectedShot,
    onSelectShot,
    options,
    onOptionsChange,
    error,
    sequences,
    sequence,
    onSelectSequence,
    searchText,
    onSearchTextChange,
    projects,
    projectId,
    onSelectProject,
  } = props;
  const hiddenCount = totalShots - shots.length;

  return (
    <aside className="filter-sidebar">
      {projects.length > 0 && (
        <section>
          <h2 className="filter-sidebar__title">Project</h2>
          {projects.map((project) => (
            <button
              type="button"
              key={project.id}
              title={project.name}
              aria-pressed={project.id === projectId}
              className={optionClass(project.id === projectId)}
              onClick={() => {
                onSelectProject(project.id);
              }}
            >
              {project.name}
            </button>
          ))}
        </section>
      )}
      <section>
        <h2 className="filter-sidebar__title">sequence_ids</h2>
        <div className="filter-sidebar__chips">
          <button
            type="button"
            aria-pressed={sequence === null}
            className={chipClass(sequence === null)}
            onClick={() => onSelectSequence(null)}
          >
            All
          </button>
          {sequences.map((name) => (
            <button
              type="button"
              key={name}
              title={name}
              aria-pressed={sequence === name}
              className={chipClass(sequence === name)}
              onClick={() => onSelectSequence(name)}
            >
              {name}
            </button>
          ))}
        </div>
        {sequences.length === 0 && (
          <p className="filter-sidebar__empty">No sequences found.</p>
        )}
      </section>

      <section>
        <h2 className="filter-sidebar__title">Shot</h2>
        <input
          type="search"
          className="text-input filter-sidebar__search"
          placeholder={
            sequence ? `Search ${sequence}…` : "Search shots, e.g. 0820"
          }
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
        />
        {error && <p className="form-error">{error}</p>}
        {shots.map((shotCode) => (
          <button
            type="button"
            key={shotCode}
            aria-pressed={shotCode === selectedShot}
            className={optionClass(shotCode === selectedShot)}
            onClick={() => onSelectShot(shotCode)}
          >
            {shotCode}
          </button>
        ))}
        {shots.length === 0 && !error && (
          <p className="filter-sidebar__empty">No shots match.</p>
        )}
        {hiddenCount > 0 && (
          <p className="filter-sidebar__more">
            {hiddenCount} more. Pick a sequence or type part of a shot code.
          </p>
        )}
      </section>

      <section>
        <h2 className="filter-sidebar__title">Show</h2>
        <button
          type="button"
          aria-pressed={options.showFilesOnlyStages}
          className={optionClass(options.showFilesOnlyStages)}
          onClick={() =>
            onOptionsChange({
              ...options,
              showFilesOnlyStages: !options.showFilesOnlyStages,
            })
          }
        >
          Stages with files only
        </button>
        <button
          type="button"
          aria-pressed={options.showReviews}
          className={optionClass(options.showReviews)}
          onClick={() =>
            onOptionsChange({ ...options, showReviews: !options.showReviews })
          }
        >
          Reviews
        </button>
      </section>
    </aside>
  );
}
