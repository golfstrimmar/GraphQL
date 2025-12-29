"use client";
import React from "react";
import SundboxIcon from "@/components/icons/SundboxIcon";
import WorkerIcon from "@/components/icons/WorkerIcon";
import ProjectsIcon from "@/components/icons/ProjectsIcon";

const PlazaToolbar: React.FC = ({
  resetAll,
  setEditMode,
  editMode,
  previewRef,
  canvasRef,
  projectsRef,
}) => {
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offset = 100; // отступ сверху
    const top = rect.top + window.scrollY - offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  return (
    <div className="">
      <div className="flex flex-col   items-center gap-2">
        <button
          className="btn-teal w-full !text-[12px]"
          onClick={() => scrollToSection(previewRef)}
        >
          <SundboxIcon />
        </button>
        <button
          className="btn-teal w-full !text-[12px]"
          onClick={() => scrollToSection(canvasRef)}
        >
          <WorkerIcon></WorkerIcon>
        </button>
        <button
          className="btn-teal w-full !text-[12px]"
          onClick={() => scrollToSection(projectsRef)}
        >
          <ProjectsIcon />
        </button>
      </div>
    </div>
  );
};
export default PlazaToolbar;
