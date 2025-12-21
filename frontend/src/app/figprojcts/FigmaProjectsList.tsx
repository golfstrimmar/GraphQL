"use client";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";

import { useStateContext } from "@/providers/StateProvider";
import Loading from "@/components/ui/Loading/Loading";
import Button from "@/components/ui/Button/Button";
// --------------- interface
interface FigmaProjectsListProps {
  figmaProjects: Project[];
}
type Project = {
  id: string;
  name: string;
};

// --------------------------------
// --------------------------------
// --------------------------------
const FigmaProjectsList: React.FC<FigmaProjectsListProps> = ({
  figmaProjects,
}) => {
  const { user, setHtmlJson, setModalMessage, texts, setTexts } =
    useStateContext();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  useEffect(() => {
    if (!allProjects) return;
    console.log("<===allProjects===>", allProjects);
  }, [allProjects]);
  //////---
  useEffect(() => {
    if (!figmaProjects) return;
    setAllProjects(figmaProjects);
  }, [figmaProjects]);
  //////---
  // const fetchProjectData = (id: string) => {
  //   setColors([]);
  //   setFonts([]);
  //   setTexts([]);
  //   setProjectId(id);
  //   figmaProjectRefetch({ projectId: id });
  // };
  // const handlerRemoveFigmaProject = (id: string) => {
  //   removeFigmaProject({ variables: { figmaProjectId: id } });
  //   setAllProjects(allProjects.filter((p) => p.id !== id));
  //   setProjectId("");
  //   setcurrentProject(null);
  //   setColors([]);
  //   setFonts([]);
  //   setTexts([]);
  // };

  return (
    <div className="flex flex-col gap-2 mb-2">
      {/*{allProjectsLoading && <Loading />}*/}
      {/*{projectId && (
        <button
          onClick={() => {
            setPreview(null);
            setFile(null);
            setProjectId("");
            setcurrentProject(null);
            setColors([]);
            setFonts([]);
            setTexts([]);
            setScssMixVar("");
            setHtmlJson(null);
          }}
          className="btn btn-empty px-2 my-2 mr-2"
        >
          Quit active Project
        </button>
      )}*/}
      {/*<button
        onClick={() => {
          setFile(null);
          setName("");
          setModalOpen(true);
        }}
        className="btn btn-empty px-2 my-2 "
      >
        + Add Project
      </button>*/}
      {allProjects.length === 0 ? (
        <div className="text-center  py-4 pb-2">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl">📁</span>
          </div>
          <p className="text-slate-600 text-lg py-4 mb-6">
            {user
              ? "No Figma projects found"
              : "Please,  login to see Projects"}
          </p>
          {/*{user && (
            <Button
              onClick={() => {
                setFile(null);
                setName("");
                setModalOpen(true);
              }}
            >
              Add Your First Project
            </Button>
          )}*/}
        </div>
      ) : (
        allProjects.map((project) => (
          <div
            key={project.id}
            className="grid grid-cols-[1fr_max-content] w-full gap-1"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                // fetchProjectData(project.id);
              }}
              // disabled={project.id === projectId}
              className="bg-slate-200 hover:bg-slate-300 hover:border-[var(--teal)] hover:text-[var(--teal)]  text-sm font-medium p-1 max-h-8 rounded  gap-1 cursor-pointer transition-all border border-transparent text-center"
              // className={`${
              //   project.id === projectId
              //     ? " text-slate-800 bg-[var(--teal)]"
              //     : "bg-slate-200 hover:bg-slate-300 hover:border-[var(--teal)] hover:text-[var(--teal)]  text-sm font-medium"
              // } p-1 max-h-8 rounded  gap-1 cursor-pointer transition-all border border-transparent text-center`}
            >
              {project.name}
            </button>
            <button
              className="btn btn-allert"
              onClick={() => {
                // handlerRemoveFigmaProject(project.id);
              }}
            >
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default FigmaProjectsList;
