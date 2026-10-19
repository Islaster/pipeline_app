import type {
  ShotgridProject,
  ShotgridSequence,
} from "../../../../../shared/types/shotgrid";
import { ArtistFilter } from "../../shotgrid/components/ArtistFilter";
import {
  allSequences,
  type SequenceChoice,
} from "../../shotgrid/helpers/sequenceChoice";
import "../../filter-sidebar/filterSidebar.css";

interface TasksFilterSidebarProps {
  projects: ShotgridProject[];
  projectId: number | null;
  onSelectProject: (projectId: number) => void;
  sequences: ShotgridSequence[];
  sequenceChoice: SequenceChoice | null;
  onSelectSequence: (choice: SequenceChoice) => void;
  steps: string[];
  step: string;
  onSelectStep: (step: string) => void;
  artists: string[];
  artist: string;
  onSelectArtist: (artist: string) => void;
}

const showAll = "";

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

export function TasksFilterSidebar(props: TasksFilterSidebarProps) {
  const {
    projects,
    projectId,
    onSelectProject,
    sequences,
    sequenceChoice,
    onSelectSequence,
  } = props;
  const { steps, step, onSelectStep, artists, artist, onSelectArtist } = props;

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

          <section>
            <h2 className="filter-sidebar__title">Step</h2>
            <button
              type="button"
              aria-pressed={step === showAll}
              className={optionClass(step === showAll)}
              onClick={() => onSelectStep(showAll)}
            >
              All
            </button>
            {steps.map((name) => (
              <button
                type="button"
                key={name}
                aria-pressed={step === name}
                className={optionClass(step === name)}
                onClick={() => onSelectStep(name)}
              >
                {name}
              </button>
            ))}
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
