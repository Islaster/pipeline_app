import { useState, type ReactNode } from "react";
import type { ShotgridProject } from "../../../../../shared/types/shotgrid";
import { fetchProjects, fetchSequences } from "../../shotgrid/api/shotgridApi";
import {
  allSequences,
  type SequenceChoice,
} from "../../shotgrid/helpers/sequenceChoice";
import { useLoadedData } from "../../shotgrid/hooks/useLoadedData";
import {
  artistsIn,
  filterTasks,
  showAll,
  stepsIn,
} from "../helpers/taskFilters";
import { useSequenceTasks } from "../hooks/useSequenceTasks";
import { TaskBoard } from "./TaskBoard";
import { TasksFilterSidebar } from "./TasksFilterSidebar";
import { useAuth } from "../../auth/hooks/useAuth";

interface ProjectBoardProps {
  header: ReactNode;
  projects: ShotgridProject[];
  projectId: number | null;
  onSelectProject: (projectId: number) => void;
}

// One project's board: loads its sequences first, then tasks only for the sequence in view.
function ProjectBoard({
  header,
  projects,
  projectId,
  onSelectProject,
}: ProjectBoardProps) {
  const sequencesLoad = useLoadedData(() =>
    projectId === null ? Promise.resolve([]) : fetchSequences(projectId)
  );
  const [pickedSequence, setPickedSequence] = useState<SequenceChoice | null>(
    null
  );
  const [step, setStep] = useState(showAll);
  const [artist, setArtist] = useState(showAll);

  const sequences = sequencesLoad.data ?? [];
  const sequenceChoice: SequenceChoice | null =
    pickedSequence ?? sequences[0]?.id ?? null;
  const wantedSequenceIds =
    sequenceChoice === allSequences
      ? sequences.map((sequence) => sequence.id)
      : sequenceChoice === null
      ? []
      : [sequenceChoice];

  const tasksLoad = useSequenceTasks(wantedSequenceIds);
  const isStillLoading =
    tasksLoad.loadedCount < wantedSequenceIds.length && !tasksLoad.error;
  const tasks = filterTasks(tasksLoad.tasks, artist, step);
  const error = sequencesLoad.error ?? tasksLoad.error;
  const { user } = useAuth();
  const canChangeStatus = user?.role === "creative_lead";

  return (
    <>
      <TasksFilterSidebar
        projects={projects}
        projectId={projectId}
        onSelectProject={onSelectProject}
        sequences={sequences}
        sequenceChoice={sequenceChoice}
        onSelectSequence={setPickedSequence}
        steps={stepsIn(tasksLoad.tasks)}
        step={step}
        onSelectStep={setStep}
        artists={artistsIn(tasksLoad.tasks)}
        artist={artist}
        onSelectArtist={setArtist}
      />

      <main className="tasks-page">
        {header}
        {projectId === null && (
          <p className="tasks-page__note">Choose a project on the left.</p>
        )}
        {projectId !== null && sequencesLoad.isLoading && (
          <p className="tasks-page__note">Loading sequences…</p>
        )}
        {error && <p className="form-error">{error}</p>}
        {isStillLoading && (
          <p className="tasks-page__note">
            {wantedSequenceIds.length === 1
              ? "Loading tasks…"
              : `Loaded ${tasksLoad.loadedCount} of ${wantedSequenceIds.length} sequences…`}
          </p>
        )}
        {wantedSequenceIds.length > 0 &&
          !error &&
          (tasks.length > 0 || !isStillLoading) && (
            <TaskBoard
              tasks={tasks}
              showAssignees
              canChangeStatus={canChangeStatus}
              onTaskChanged={tasksLoad.replaceTask}
            />
          )}
      </main>
    </>
  );
}

export function ProjectTasksView({ header }: { header: ReactNode }) {
  const projectsLoad = useLoadedData(fetchProjects);
  const [projectId, setProjectId] = useState<number | null>(null);

  if (projectsLoad.error) {
    return (
      <main className="tasks-page">
        {header}
        <p className="form-error">{projectsLoad.error}</p>
      </main>
    );
  }

  return (
    <div className="tasks-layout">
      <ProjectBoard
        key={projectId ?? "none"}
        header={header}
        projects={projectsLoad.data ?? []}
        projectId={projectId}
        onSelectProject={setProjectId}
      />
    </div>
  );
}
