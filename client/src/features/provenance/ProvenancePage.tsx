import { useState } from "react";
import { ProvenanceFilterSidebar } from "./components/ProvenanceFilterSidebar";
import { ShotLineageView } from "./components/ShotLineageView";
import { defaultTreeOptions, type TreeOptions } from "./helpers/treeOptions";
import { useShotList } from "./hooks/useShotList";
import { useProvenanceProjects } from "./hooks/useProvenanceProjects";
import "./provenance.css";

export function ProvenancePage() {
  const [sequence, setSequence] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [shotCode, setShotCode] = useState<string | null>(null);
  const [options, setOptions] = useState<TreeOptions>(defaultTreeOptions);
  const {
    projects,
    projectId,
    setProjectId,
    error: projectsError,
  } = useProvenanceProjects();
  const shotList = useShotList(searchText, sequence, projectId);

  return (
    <div className="provenance-layout">
      <ProvenanceFilterSidebar
        sequences={shotList.sequences}
        sequence={sequence}
        projects={projects}
        projectId={projectId}
        onSelectProject={(picked) => {
          setProjectId(picked);
          setSequence(null);
          setSearchText("");
          setShotCode(null);
        }}
        onSelectSequence={(picked) => {
          setSequence(picked);
          setSearchText(""); // the search applied to the old sequence
        }}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        shots={shotList.shots}
        totalShots={shotList.totalMatches}
        selectedShot={shotCode}
        onSelectShot={setShotCode}
        options={options}
        onOptionsChange={setOptions}
        error={projectsError ?? shotList.error}
      />

      <main className="provenance-page">
        <h1>Provenance{shotCode ? ` · ${shotCode}` : ""}</h1>
        {shotCode ? (
          <ShotLineageView
            key={`${projectId ?? "none"}:${shotCode}`}
            shotCode={shotCode}
            projectId={projectId}
            options={options}
          />
        ) : (
          <p className="provenance-page__note">
            Pick a sequence and a shot on the left to see how its files branched
            out and changed.
          </p>
        )}
      </main>
    </div>
  );
}
