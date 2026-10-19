import { useRef, type MouseEvent } from "react";
import type { TreeLayout } from "../helpers/layoutShotTree";
import { treeMetrics } from "../helpers/layoutShotTree";
import type { Viewport } from "../hooks/useViewport";

interface TreeMinimapProps {
  layout: TreeLayout;
  viewport: Viewport;
  onMoveTo: (left: number, top: number) => void; // scroll so this point is at the top-left
}

const minimapWidth = 220;
const maxMinimapHeight = 160;
const trackPadding = { left: 24, top: 8 }; // matches .shot-tree__track padding

export function TreeMinimap({ layout, viewport, onMoveTo }: TreeMinimapProps) {
  const surface = useRef<HTMLDivElement>(null);

  // Fit the whole tree into the minimap, keeping its proportions.
  const scale = Math.min(
    minimapWidth / layout.width,
    maxMinimapHeight / layout.height
  );
  const width = layout.width * scale;
  const height = layout.height * scale;
  const m = treeMetrics;

  // Only show it when the tree is bigger than the screen.
  const isNeeded =
    layout.width > viewport.width || layout.height > viewport.height;
  if (!isNeeded) return null;

  // Centers the view on wherever the mouse is in the minimap.
  function moveToMouse(clientX: number, clientY: number) {
    const box = surface.current?.getBoundingClientRect();
    if (!box) return;
    const x = (clientX - box.left) / scale;
    const y = (clientY - box.top) / scale;
    onMoveTo(
      x - viewport.width / 2 + trackPadding.left,
      y - viewport.height / 2 + trackPadding.top
    );
  }

  function onMouseDown(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    moveToMouse(event.clientX, event.clientY);
    const onMove = (move: globalThis.MouseEvent) =>
      moveToMouse(move.clientX, move.clientY);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div className="tree-minimap" aria-label="Map of the tree">
      <div
        ref={surface}
        className="tree-minimap__surface"
        style={{ width, height }}
        onMouseDown={onMouseDown}
      >
        {layout.nodes.map((node) => {
          const size =
            node.kind === "root"
              ? { w: m.rootWidth, h: m.rootHeight }
              : node.kind === "stage"
              ? { w: m.nodeWidth, h: m.stageLabelHeight }
              : node.kind === "review"
              ? { w: m.nodeWidth, h: m.reviewHeight }
              : { w: m.nodeWidth, h: m.nodeHeight };
          return (
            <span
              key={node.id}
              className={`tree-minimap__node tree-minimap__node--${node.kind}`}
              style={{
                left: node.x * scale,
                top: node.y * scale,
                width: size.w * scale,
                height: size.h * scale,
              }}
            />
          );
        })}
        <span
          className="tree-minimap__viewport"
          style={{
            left: Math.max(0, viewport.left - trackPadding.left) * scale,
            top: Math.max(0, viewport.top - trackPadding.top) * scale,
            width: Math.min(viewport.width, layout.width) * scale,
            height: Math.min(viewport.height, layout.height) * scale,
          }}
        />
      </div>
    </div>
  );
}
