import { useState } from "react";
import { useAuth } from "../auth/hooks/useAuth";
import { fetchConnectionStatus } from "./api/shotgridApi";
import { ArtistShotsView } from "./components/ArtistShotsView";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { MyAssignments } from "./components/MyAssignments";
import { ProjectPicker } from "./components/ProjectPicker";
import { ShotTable } from "./components/ShotTable";
import { useLoadedData } from "./hooks/useLoadedData";
import "./shotgrid.css";

export function ShotgridPage() {
  const { user } = useAuth();
  const connection = useLoadedData(fetchConnectionStatus);
  const [projectId, setProjectId] = useState<number | null>(null);

  const isConnected =
    !connection.isLoading && (connection.data?.isConnected ?? false);
  const isArtist = user?.role === "artist";

  const header = (
    <header className="shotgrid-page__header">
      <h1>{isArtist ? "My assignments" : "ShotGrid"}</h1>
      <ConnectionStatus
        status={connection.data}
        isChecking={connection.isLoading}
        error={connection.error}
        onCheckAgain={connection.reload}
      />
    </header>
  );

  // Creative leads: filters in a sidebar, shots grouped by artist.
  if (isConnected && user?.role === "creative_lead") {
    return <ArtistShotsView header={header} />;
  }

  return (
    <main className="shotgrid-page">
      {header}

      {!isConnected && !connection.isLoading && (
        <p className="shotgrid-page__note">
          {connection.error ??
            connection.data?.message ??
            "ShotGrid isn't connected."}
        </p>
      )}

      {isConnected && isArtist && <MyAssignments />}

      {isConnected && user?.role === "lead" && (
        <>
          <ProjectPicker selectedId={projectId} onSelect={setProjectId} />
          {/* The key makes the table start fresh whenever the project changes. */}
          {projectId !== null && (
            <ShotTable
              key={projectId}
              projectId={projectId}
              showArtists={false}
            />
          )}
        </>
      )}
    </main>
  );
}
