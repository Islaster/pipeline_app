import { useState } from "react";
import type { ShotgridShot } from "../../../../../shared/types/shotgrid";
import type { ArtistGroup } from "../helpers/groupShotsByArtist";
import { ShotDetailsPanel } from "./ShotDetailsPanel";

export function ArtistShotBoard({ groups }: { groups: ArtistGroup[] }) {
  const [selectedShot, setSelectedShot] = useState<ShotgridShot | null>(null);

  if (groups.length === 0) {
    return <p className="shotgrid-page__note">No shots match these filters.</p>;
  }

  return (
    <section>
      {groups.map((group) => (
        <section key={group.artist ?? "unassigned"} className="artist-group">
          <h2 className="artist-group__name">
            {group.artist ?? "Unassigned"}
            <span className="artist-group__count">
              {group.shots.length} {group.shots.length === 1 ? "shot" : "shots"}
            </span>
          </h2>
          <div className="artist-group__shots">
            {group.shots.map((shot) => (
              <button
                type="button"
                key={shot.id}
                className={`shot-chip${
                  selectedShot?.id === shot.id ? " shot-chip--selected" : ""
                }`}
                onClick={() => setSelectedShot(shot)}
              >
                {shot.code}
                {shot.status && (
                  <span className="shot-table__status">{shot.status}</span>
                )}
              </button>
            ))}
          </div>
        </section>
      ))}

      {/* The key makes the panel start fresh for each shot. */}
      {selectedShot && (
        <ShotDetailsPanel
          key={selectedShot.id}
          shot={selectedShot}
          onClose={() => setSelectedShot(null)}
        />
      )}
    </section>
  );
}
