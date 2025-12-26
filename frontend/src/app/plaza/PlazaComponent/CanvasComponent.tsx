"use client";
export default function CanvasComponent({ project, renderNode }) {
  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 mt-4 mb-8 border border-slate-200 ">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <span className=" text-white">📐</span>
        </div>
        <h5 className=" font-bold text-slate-800">Canvas</h5>
      </div>
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
