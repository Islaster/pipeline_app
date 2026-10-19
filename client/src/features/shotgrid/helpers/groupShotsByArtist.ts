import type { ShotgridAssignedShot } from "../../../../../shared/types/shotgrid";

export interface ArtistGroup {
  artist: string | null; // null is the "Unassigned" group
  shots: ShotgridAssignedShot[];
}

// One group per artist, in name order, with unassigned shots last.
// A shot with two artists appears under both.
export function groupShotsByArtist(
  shots: ShotgridAssignedShot[]
): ArtistGroup[] {
  const shotsByArtist = new Map<string, ShotgridAssignedShot[]>();
  const unassigned: ShotgridAssignedShot[] = [];

  for (const shot of shots) {
    if (shot.artists.length === 0) unassigned.push(shot);
    for (const artist of shot.artists) {
      shotsByArtist.set(artist, [...(shotsByArtist.get(artist) ?? []), shot]);
    }
  }

  const groups: ArtistGroup[] = [...shotsByArtist]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([artist, artistShots]) => ({ artist, shots: artistShots }));
  if (unassigned.length > 0) groups.push({ artist: null, shots: unassigned });
  return groups;
}
