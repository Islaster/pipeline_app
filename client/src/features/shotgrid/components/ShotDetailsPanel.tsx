import { useState } from "react";
import type { ShotgridShot } from "../../../../../shared/types/shotgrid";
import { fetchShotDetails } from "../api/shotgridApi";
import { useLoadedData } from "../hooks/useLoadedData";
import { ShotDetailsTab } from "./ShotDetailsTab";
import { ShotMediaTab } from "./ShotMediaTab";
import { ShotMediaViewer } from "./ShotMediaViewer";
import { ShotNotesTab } from "./ShotNotesTab";

type PanelTab = "media" | "notes" | "details";

const tabs: { id: PanelTab; label: string }[] = [
  { id: "media", label: "Media" },
  { id: "notes", label: "Notes" },
  { id: "details", label: "Details" },
];

interface ShotDetailsPanelProps {
  shot: ShotgridShot;
  onClose: () => void;
}

export function ShotDetailsPanel({ shot, onClose }: ShotDetailsPanelProps) {
  const {
    data: details,
    isLoading,
    error,
  } = useLoadedData(() => fetchShotDetails(shot.id));
  const [tab, setTab] = useState<PanelTab>("media");
  const [pickedMediaId, setPickedMediaId] = useState<number | null>(null);

  // The latest media shows on top unless another one is picked in the Media tab.
  const media = details?.media ?? [];
  const shownMedia =
    media.find((item) => item.id === pickedMediaId) ?? media[0] ?? null;

  return (
    <aside className="shot-panel">
      <header className="shot-panel__header">
        <h2>{shot.code}</h2>
        {shot.status && (
          <span className="shot-table__status">{shot.status}</span>
        )}
        <button
          type="button"
          className="shot-panel__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </header>

      {isLoading && <p className="shotgrid-page__note">Loading…</p>}
      {error && <p className="form-error">{error}</p>}

      {details && (
        <>
          <ShotMediaViewer media={shownMedia} />

          <nav className="shot-panel__tabs">
            {tabs.map((option) => (
              <button
                type="button"
                key={option.id}
                aria-pressed={tab === option.id}
                className={`shot-panel__tab${
                  tab === option.id ? " shot-panel__tab--active" : ""
                }`}
                onClick={() => setTab(option.id)}
              >
                {option.label}
              </button>
            ))}
          </nav>

          {tab === "media" && (
            <ShotMediaTab
              media={media}
              shownId={shownMedia?.id ?? null}
              onShow={setPickedMediaId}
            />
          )}
          {tab === "notes" && <ShotNotesTab notes={details.notes} />}
          {tab === "details" && <ShotDetailsTab details={details} />}
        </>
      )}
    </aside>
  );
}
