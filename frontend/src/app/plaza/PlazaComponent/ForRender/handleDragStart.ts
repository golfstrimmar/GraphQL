import { Dispatch, SetStateAction } from "react";
interface DragHandlers {
  setNodeToDragEl: Dispatch<SetStateAction<HTMLElement | null>>;
  setNodeToDrag: Dispatch<SetStateAction<any>>;
}

const handleDragStart = (
  e: React.DragEvent<HTMLElement>,
  node: any,
  editMode: boolean,
  handlers: DragHandlers,
) => {
  if (!editMode) return;
  e.stopPropagation();

  const target = e.currentTarget as HTMLElement;

  const dragGhost = target.cloneNode(true) as HTMLElement;
  dragGhost.style.position = "absolute";
  dragGhost.style.top = "-9999px";
  dragGhost.style.backgroundColor = "#4d6a92";
  dragGhost.style.pointerEvents = "none";
  document.body.appendChild(dragGhost);
  e.dataTransfer.setDragImage(dragGhost, 0, 0);
  setTimeout(() => document.body.removeChild(dragGhost), 0);

  target.style.opacity = "0.3";
  target.style.transition = "opacity 0.2s ease";

  handlers.setNodeToDragEl(target);
  handlers.setNodeToDrag(node);
};

export default handleDragStart;
