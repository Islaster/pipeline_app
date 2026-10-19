import { useState, type ReactNode } from "react";
import type { ShotgridProject } from "../../../../../shared/types/shotgrid";
import { fetchProjects, fetchSequences } from "../api/shotgridApi";
import { groupShotsByArtist } from "../helpers/groupShotsByArtist";
import { allSequences, type SequenceChoice } from "../helpers/sequenceChoice";
import { useLoadedData } from "../hooks/useLoadedData";
import { useSequenceShots } from "../hooks/useSequenceShots";
import { ArtistShotBoard } from "./ArtistShotBoard";
import { ShotgridFilterSidebar } from "./ShotgridFilterSidebar";

const showAllArtists = "";

interface ProjectBoardProps {
  header: ReactNode;
  projects: ShotgridProject[];
  projectId: number | null;
  onSelectProject: (projectId: number) => void;
}

// One project's board: loads its sequences first, then shots only for the sequence in view.
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
  const [artist, setArtist] = useState(showAllArtists);

  const sequences = sequencesLoad.data ?? [];

  // Opens on the first sequence until the creative lead picks another.
  const sequenceChoice: SequenceChoice | null =
    pickedSequence ?? sequences[0]?.id ?? null;
  const wantedSequenceIds =
    sequenceChoice === allSequences
      ? sequences.map((sequence) => sequence.id)
      : sequenceChoice === null
      ? []
      : [sequenceChoice];

  const shotsLoad = useSequenceShots(wantedSequenceIds);
  const isStillLoading =
    shotsLoad.loadedCount < wantedSequenceIds.length && !shotsLoad.error;

  const allGroups = groupShotsByArtist(shotsLoad.shots);
  const artists = allGroups.flatMap((group) => group.artist ?? []);
  const groups =
    artist === showAllArtists
      ? allGroups
      : allGroups.filter((group) => group.artist === artist);

  const error = sequencesLoad.error ?? shotsLoad.error;
  const hasNoSequences =
    projectId !== null && !sequencesLoad.isLoading && sequences.length === 0;

  return (
    <>
      <ShotgridFilterSidebar
        projects={projects}
        projectId={projectId}
        onSelectProject={onSelectProject}
        sequences={sequences}
        sequenceChoice={sequenceChoice}
        onSelectSequence={setPickedSequence}
        artists={artists}
        artist={artist}
        onSelectArtist={setArtist}
      />

      <main className="shotgrid-page">
        {header}
        {projectId === null && (
          <p className="shotgrid-page__note">Choose a project on the left.</p>
        )}
        {projectId !== null && sequencesLoad.isLoading && (
          <p className="shotgrid-page__note">Loading sequences…</p>
        )}
        {error && <p className="form-error">{error}</p>}
        {hasNoSequences && !error && (
          <p className="shotgrid-page__note">This project has no sequences.</p>
        )}

        {isStillLoading && (
          <p className="shotgrid-page__note">
            {wantedSequenceIds.length === 1
              ? "Loading shots…"
              : `Loaded ${shotsLoad.loadedCount} of ${wantedSequenceIds.length} sequences…`}
          </p>
        )}

        {/* Show what has arrived so far; the "nothing matches" message waits until loading ends. */}
        {wantedSequenceIds.length > 0 &&
          (groups.length > 0 || !isStillLoading) &&
          !error && <ArtistShotBoard groups={groups} />}
      </main>
    </>
  );
}

export function ArtistShotsView({ header }: { header: ReactNode }) {
  const projectsLoad = useLoadedData(fetchProjects);
  const [projectId, setProjectId] = useState<number | null>(null);

  if (projectsLoad.error) {
    return (
      <main className="shotgrid-page">
        {header}
        <p className="form-error">{projectsLoad.error}</p>
      </main>
    );
  }

  return (
    <div className="shotgrid-layout">
      {/* The key starts the board fresh whenever the project changes. */}
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
