"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { useStateContext } from "@/providers/StateProvider";
import Loading from "@/components/ui/Loading/Loading";
import { REMOVE_FIGMA_PROJECT } from "@/apollo/mutations";
import PageHeader from "@/app/plaza/PageHeader";
import dynamic from "next/dynamic";
const ModalCreateFigmaProject = dynamic(
  () => import("./ModalCreateFigmaProject"),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);
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
  const router = useRouter();
  const { user, setHtmlJson, setModalMessage, texts, setTexts } =
    useStateContext();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  // --------------------------------
  const [removeFigmaProject] = useMutation(REMOVE_FIGMA_PROJECT, {
    onCompleted: () => {
      setModalMessage("Figma Project removed successfully");

      router.refresh();
    },
    onError: () => {
      setModalMessage("Error removing Figma project");
    },
  });

  // --------------------------------
  useEffect(() => {
    if (!allProjects) return;
  }, [allProjects]);
  //////---
  useEffect(() => {
    if (!figmaProjects) return;
    setAllProjects(figmaProjects);
    console.log("<===figmaProjects===>", figmaProjects);
  }, [figmaProjects]);
  //////---
  const handlerRemoveFigmaProject = (id: string) => {
    removeFigmaProject({ variables: { figmaProjectId: id } });
    setAllProjects(allProjects.filter((p) => p.id !== id));
  };

  return (
    <div className="flex flex-col gap-2 mb-2 w-full mt-[30px] bg-navy rounded-2xl shadow-xl p-2  mb-8 border border-slate-200 ">
      {PageHeader("projectsIcon", "Your Figma projects")}
      {allProjects.length === 0 && (
        <h5 className="!text-[var(--teal)] text-lg py-4 mb-2 border border-[var(--teal)] text-center rounded">
          No Figma projects found
        </h5>
      )}
      {allProjects.length !== 0 &&
        allProjects.map((project) => (
          <div key={project.id} className="flex justify-between gap-2 ">
            <Link
              href={`/figprojcts/${project.id}`}
              className="btn-teal flex-1"
            >
              {project.name}
            </Link>
            <button
              className="btn btn-allert"
              onClick={() => {
                handlerRemoveFigmaProject(project.id);
              }}
            >
              Remove
            </button>
          </div>
        ))}
      <button
        onClick={() => {
          setModalOpen(!modalOpen);
        }}
        className="btn btn-empty px-2 my-2 "
      >
        {!modalOpen ? "+ Add Project" : "- Close Modal"}
      </button>

      <ModalCreateFigmaProject
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        setAllProjects={setAllProjects}
      />
    </div>
  );
};

export default FigmaProjectsList;
