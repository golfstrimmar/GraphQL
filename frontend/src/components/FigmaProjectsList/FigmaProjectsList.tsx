"use client";
// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
// } from "react";
import "./figmaprojectslist.scss";
import Image from "next/image";

interface FigmaProjectsListProps {
  allProjects: any[];
  projectId: string;
  setColors: React.Dispatch<React.SetStateAction<any[]>>;
  setFonts: React.Dispatch<React.SetStateAction<any[]>>;
  setTexts: React.Dispatch<React.SetStateAction<any[]>>;
  setProjectId: React.Dispatch<React.SetStateAction<string>>;
  setcurrentProject: React.Dispatch<React.SetStateAction<any>>;
  figmaProjectRefetch: any;
  removeFigmaProject: any;
  setAllProjects: React.Dispatch<React.SetStateAction<any[]>>;
}

const FigmaProjectsList: React.FC<FigmaProjectsListProps> = ({
  allProjects,
  projectId,
  setColors,
  setFonts,
  setTexts,
  setProjectId,
  setcurrentProject,
  figmaProjectRefetch,
  removeFigmaProject,
  setAllProjects,
}) => {
  const fetchProjectData = (id) => {
    setColors([]);
    setFonts([]);
    setTexts([]);
    setProjectId(id);
    figmaProjectRefetch({ projectId: id });
  };
  const handlerRemoveFigmaProject = (id) => {
    removeFigmaProject({ variables: { figmaProjectId: id } });
    setAllProjects(allProjects.filter((p) => p.id !== id));
    setProjectId("");
    setcurrentProject(null);
    setColors([]);
    setFonts([]);
    setTexts([]);
  };
  return (
    <div className="flex flex-col gap-2 mb-2">
      {allProjects &&
        allProjects.map((project) => (
          <div
            key={project.id}
            className="flex justify-between items-center w-full gap-1"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchProjectData(project.id);
              }}
              disabled={project.id === projectId}
              className={`${
                project.id === projectId
                  ? " text-slate-800 bg-[var(--teal)]"
                  : "bg-slate-200 hover:bg-slate-300 hover:border-[var(--teal)] hover:text-[var(--teal)]  text-sm font-medium"
              } p-1 max-h-8 rounded flex items-center gap-1 cursor-pointer transition-all border border-transparent`}
            >
              {project.name}
            </button>
            <button
              className="btn btn-allert"
              onClick={(e) => {
                handlerRemoveFigmaProject(project.id);
              }}
            >
              Remove
            </button>
          </div>
        ))}
    </div>
  );
};

export default FigmaProjectsList;
