import { useState } from "react";
import { fetchShotArtists, fetchShots } from "../api/shotgridApi";
import { useLoadedData } from "../hooks/useLoadedData";

const showAll = "";

interface ShotTableProps {
  projectId: number;
  showArtists: boolean; // adds the Artists column and the artist filter
}

export function ShotTable({ projectId, showArtists }: ShotTableProps) {
  const shotsLoad = useLoadedData(() => fetchShots(projectId));
  const artistsLoad = useLoadedData(() =>
    showArtists ? fetchShotArtists(projectId) : Promise.resolve([])
  );
  const [sequence, setSequence] = useState(showAll);
  const [artist, setArtist] = useState(showAll);

  if (shotsLoad.isLoading || artistsLoad.isLoading) {
    return <p className="shotgrid-page__note">Loading shots…</p>;
  }
  const error = shotsLoad.error ?? artistsLoad.error;
  if (error) return <p className="form-error">{error}</p>;

  const shots = shotsLoad.data ?? [];
  if (shots.length === 0)
    return <p className="shotgrid-page__note">This project has no shots.</p>;

  const shotArtists = artistsLoad.data ?? [];
  const artistsByShotId = new Map(
    shotArtists.map((entry) => [entry.shotId, entry.artists])
  );
  const artistNames = [
    ...new Set(shotArtists.flatMap((entry) => entry.artists)),
  ].sort();
  const sequences = [
    ...new Set(shots.flatMap((shot) => shot.sequence ?? [])),
  ].sort();

  const visibleShots = shots.filter(
    (shot) =>
      (sequence === showAll || shot.sequence === sequence) &&
      (artist === showAll ||
        (artistsByShotId.get(shot.id) ?? []).includes(artist))
  );

  return (
    <section>
      <div className="shot-table__toolbar">
        <label className="form-field">
          Sequence
          <select
            className="text-input"
            value={sequence}
            onChange={(event) => setSequence(event.target.value)}
          >
            <option value={showAll}>All sequences</option>
            {sequences.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {showArtists && (
          <label className="form-field">
            Artist
            <select
              className="text-input"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
            >
              <option value={showAll}>All artists</option>
              {artistNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        )}

        <span className="shotgrid-page__note">
          {visibleShots.length} of {shots.length} shots
        </span>
      </div>

      <table className="shot-table">
        <thead>
          <tr>
            <th>Shot</th>
            <th>Sequence</th>
            {showArtists && <th>Artists</th>}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {visibleShots.map((shot) => (
            <tr key={shot.id}>
              <td>{shot.code}</td>
              <td>{shot.sequence ?? "—"}</td>
              {showArtists && (
                <td>
                  {(artistsByShotId.get(shot.id) ?? []).join(", ") || "—"}
                </td>
              )}
              <td>
                {shot.status ? (
                  <span className="shot-table__status">{shot.status}</span>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
