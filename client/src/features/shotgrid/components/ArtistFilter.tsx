import { useState } from "react";

interface ArtistFilterProps {
  artists: string[];
  artist: string; // "" means all
  onSelectArtist: (artist: string) => void;
}

const showAll = "";
const maxShown = 8; // the list never grows past this, however many artists there are

function optionClass(isActive: boolean): string {
  return `filter-sidebar__option${
    isActive ? " filter-sidebar__option--active" : ""
  }`;
}

export function ArtistFilter({
  artists,
  artist,
  onSelectArtist,
}: ArtistFilterProps) {
  const [searchText, setSearchText] = useState("");

  // Every word typed must appear in the name, in any order.
  const words = searchText.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = artists.filter((name) =>
    words.every((word) => name.toLowerCase().includes(word))
  );
  const shown = matches.slice(0, maxShown);
  const hiddenCount = matches.length - shown.length;

  // Keep the chosen artist visible even when the search has moved past them.
  const listed =
    artist !== showAll && !shown.includes(artist) ? [artist, ...shown] : shown;

  return (
    <section>
      <h2 className="filter-sidebar__title">Artist</h2>
      <input
        type="search"
        className="text-input filter-sidebar__search"
        placeholder={`Search ${artists.length} artists…`}
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />

      <button
        type="button"
        aria-pressed={artist === showAll}
        className={optionClass(artist === showAll)}
        onClick={() => onSelectArtist(showAll)}
      >
        All
      </button>
      {listed.map((name) => (
        <button
          type="button"
          key={name}
          title={name}
          aria-pressed={artist === name}
          className={optionClass(artist === name)}
          onClick={() => onSelectArtist(name)}
        >
          {name}
        </button>
      ))}

      {matches.length === 0 && (
        <p className="filter-sidebar__empty">No artist matches.</p>
      )}
      {hiddenCount > 0 && (
        <p className="filter-sidebar__more">
          {hiddenCount} more. Type a name to find them.
        </p>
      )}
    </section>
  );
}
