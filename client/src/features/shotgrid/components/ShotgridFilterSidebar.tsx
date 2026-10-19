import type {
  ShotgridProject,
  ShotgridSequence,
} from "../../../../../shared/types/shotgrid";
import { allSequences, type SequenceChoice } from "../helpers/sequenceChoice";
import { ArtistFilter } from "./ArtistFilter";

interface ShotgridFilterSidebarProps {
  projects: ShotgridProject[];
  projectId: number | null;
  onSelectProject: (projectId: number) => void;
  sequences: ShotgridSequence[];
  sequenceChoice: SequenceChoice | null;
  onSelectSequence: (choice: SequenceChoice) => void;
  artists: string[];
  artist: string; // "" means all
  onSelectArtist: (artist: string) => void;
}

function optionClass(isActive: boolean): string {
  return `filter-sidebar__option${
    isActive ? " filter-sidebar__option--active" : ""
  }`;
}

function chipClass(isActive: boolean): string {
  return `filter-sidebar__chip${
    isActive ? " filter-sidebar__chip--active" : ""
  }`;
}

export function ShotgridFilterSidebar({
  projects,
  projectId,
  onSelectProject,
  sequences,
  sequenceChoice,
  onSelectSequence,
  artists,
  artist,
  onSelectArtist,
}: ShotgridFilterSidebarProps) {
  return (
    <aside className="filter-sidebar">
      <section>
        <h2 className="filter-sidebar__title">Project</h2>
        {projects.map((project) => (
          <button
            type="button"
            key={project.id}
            title={project.name}
            aria-pressed={project.id === projectId}
            className={optionClass(project.id === projectId)}
            onClick={() => onSelectProject(project.id)}
          >
            {project.name}
          </button>
        ))}
        {projects.length === 0 && (
          <p className="filter-sidebar__empty">No projects found.</p>
        )}
      </section>

      {/* Sequences and artists belong to a project, so they appear once one is chosen. */}
      {projectId !== null && (
        <>
          <section>
            <h2 className="filter-sidebar__title">sequence_ids</h2>
            <div className="filter-sidebar__chips">
              <button
                type="button"
                aria-pressed={sequenceChoice === allSequences}
                className={chipClass(sequenceChoice === allSequences)}
                onClick={() => onSelectSequence(allSequences)}
              >
                All
              </button>
              {sequences.map((sequence) => (
                <button
                  type="button"
                  key={sequence.id}
                  title={sequence.name}
                  aria-pressed={sequenceChoice === sequence.id}
                  className={chipClass(sequenceChoice === sequence.id)}
                  onClick={() => onSelectSequence(sequence.id)}
                >
                  {sequence.name}
                </button>
              ))}
            </div>
          </section>

          <ArtistFilter
            artists={artists}
            artist={artist}
            onSelectArtist={onSelectArtist}
          />
        </>
      )}
    </aside>
  );
}
