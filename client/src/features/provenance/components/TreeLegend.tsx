import { useState } from "react";

export function TreeLegend() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`tree-legend${isOpen ? "" : " tree-legend--collapsed"}`}>
      <button
        type="button"
        className="tree-legend__toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>Legend</span>
        <span className="tree-legend__arrow" aria-hidden="true">
          {isOpen ? "▾" : "▸"}
        </span>
      </button>

      {isOpen && (
        <ul className="tree-legend__items">
          <li>
            <span className="tree-legend__approved">★ green</span>a copy is in
            an approved folder
          </li>
          <li>
            <span className="tree-legend__line" />
            recorded link
          </li>
          <li>
            <span className="tree-legend__line tree-legend__line--dashed" />
            inferred link, not recorded
          </li>
          <li>
            <span className="tree-legend__review" />
            review of the version above it
          </li>
          <li>
            <span className="tree-legend__pill">stage</span>a task, with who was
            assigned
          </li>
        </ul>
      )}
    </div>
  );
}
