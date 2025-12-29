"use client";
import PageHeader from "./PageHeader";

export default function CanvasComponent({ project, renderNode }) {
  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 mt-4 mb-8 border border-slate-200 ">
      {PageHeader("canvasIcon", "Canvas")}
      <div
        id="plaza-render-area"
        className="flex flex-col gap-2 mb-2 relative text-[#000]"
      >
        {project &&
          (Array.isArray(project)
            ? project.map(renderNode)
            : renderNode(project))}
      </div>
    </div>
  );
}
