"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { UPDATE_PROJECT, REMOVE_PROJECT } from "@/apollo/mutations";
import {
  GET_JSON_DOCUMENT,
  GET_ALL_PROJECTS_BY_USER,
  FIND_PROJECT,
} from "@/apollo/queries";

import Loading from "@/components/ui/Loading/Loading";
import PProject from "@/types/PProject";
import PProjectDataElement from "@/types/PProject";
import InfoProject from "@/components/InfoProject/InfoProject";
import CreateNewProject from "@/components/CreateNewProject/CreateNewProject";
import createRenderNode from "@/utils/plaza/RenderNode.tsx";
import "./plaza.scss";
import { motion, AnimatePresence } from "framer-motion";
import AdminComponent from "@/components/AdminComponent/AdminComponent";
import jsonToHtml from "@/utils/plaza/jsonToHtml";
import Image from "next/image";
import EditModeIcon from "@/components/icons/EditModeIcon";
import ClearIcon from "@/components/icons/ClearIcon";
import СhevronLeft from "@/components/icons/СhevronLeft";
import СhevronRight from "@/components/icons/СhevronRight";
import Update from "@/components/icons/Update";
// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
export interface ProjectNode {
  _key?: string;
  tag: string;
  text: string;
  class: string;
  style: string;
  children: (ProjectNode | string)[];
}
// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
export default function Plaza() {
  const {
    htmlJson,
    user,
    setModalMessage,
    updateHtmlJson,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useStateContext();
  const pathname = usePathname();
  const [projects, setProjects] = useState<PProject[]>([]);
  const [project, setProject] = useState<ProjectNode | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [openInfoKey, setOpenInfoKey] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [pId, setpId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [nodeToDragEl, setNodeToDragEl] = useState<HTMLElement | null>(null);
  const [nodeToDrag, setNodeToDrag] = useState<ProjectNode | null>(null);
  const isSyncingRef = useRef(false);

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const isPlaza = () => {
    return pathname === "/plaza" ? true : false;
  };
  const variables = React.useMemo(() => ({ userId: user?.id }), [user?.id]);
  const { data, loading, error } = useQuery(GET_ALL_PROJECTS_BY_USER, {
    variables,
    skip: !user?.id,
    fetchPolicy: "cache-and-network",
  });
  const {
    data: dataProject,
    loading: loadingProject,
    error: errorProject,
  } = useQuery(FIND_PROJECT, {
    variables: { id: Number(pId) || null },
    skip: !pId,
    fetchPolicy: "cache-and-network",
  });
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const [removeProject] = useMutation(REMOVE_PROJECT, {
    refetchQueries: [{ query: GET_ALL_PROJECTS_BY_USER, variables }],
    awaitRefetchQueries: true,
  });
  const [updateProject] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{ query: GET_ALL_PROJECTS_BY_USER, variables }],
    awaitRefetchQueries: true,
  });
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  useEffect(() => {
    if (!dataProject) return;

    const proj = dataProject?.findProject;
    console.log("<==== proj from bd====>", proj);
    setProjectId(proj.id);
    setProjectName(proj.name);
    updateHtmlJson((prev) => {
      if (!prev) return prev;
      const newHtmlJson = { ...prev };
      newHtmlJson.children = [...newHtmlJson.children, ...proj.data.children];
      setpId(null);
      return newHtmlJson;
    });
  }, [dataProject]);
  useEffect(() => {
    if (!htmlJson) return;
    isSyncingRef.current = true;

    const mergeWithExistingKeys = (
      node: ProjectNode | string,
      existing?: ProjectNode | string
    ): ProjectNode | string => {
      if (typeof node === "string") return node;

      return {
        ...node,
        _key:
          existing && typeof existing !== "string" && existing._key
            ? existing._key
            : node._key || crypto.randomUUID(),
        children: Array.isArray(node.children)
          ? node.children.map((child, i) =>
              mergeWithExistingKeys(
                child,
                Array.isArray(existing?.children)
                  ? existing.children[i]
                  : undefined
              )
            )
          : node.children,
      };
    };

    setProject((prevProject) =>
      Array.isArray(htmlJson)
        ? htmlJson.map((node, i) =>
            mergeWithExistingKeys(node, prevProject?.[i])
          )
        : mergeWithExistingKeys(htmlJson, prevProject)
    );
  }, [htmlJson]);
  useEffect(() => {
    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }
    const newProject = removeKeys(project);
    updateHtmlJson(newProject);
  }, [project]);
  useEffect(() => {
    resetAll();
  }, []);
  useEffect(() => {
    if (!user) resetAll();
  }, [user]);
  useEffect(() => {
    if (data?.getAllProjectsByUser) {
      setProjects(data?.getAllProjectsByUser);
    }
  }, [data]);

  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  useLayoutEffect(() => {
    if (!project) return;
    // console.log("<====🔹🔹🔹🔹🔹project🔹🔹🔹🔹🔹====>", project);
    if (project && editMode) {
      requestAnimationFrame(() => shiftNeighbors());
    }
  }, [project, editMode, openInfoKey]);
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  const shiftNeighbors = () => {
    const container = document.getElementById("plaza-render-area");
    if (!container) return;

    const renderTags = container.querySelectorAll<HTMLElement>(".render-tag");

    renderTags.forEach((tag) => {
      const prev = tag.previousElementSibling as HTMLElement | null;
      const next = tag.nextElementSibling as HTMLElement | null;

      const tagRect = tag.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Сброс старых сдвигов
      [prev, next].forEach((el) => {
        if (!el) return;
        el.style.position = "";
        el.style.top = "";
        el.style.left = "";
      });

      // Сдвигаем соседей, только если они плейсхолдеры
      if (prev && prev.classList.contains("placeholder")) {
        prev.style.position = "absolute";
        prev.style.top = `${tag.offsetTop}px`;
        prev.style.left = `${tag.offsetLeft}px`;
        prev.style.zIndex = "100";
        prev.style.height = `${tag.offsetHeight}px`;
      }
      if (next && next.classList.contains("placeholder")) {
        next.style.position = "absolute";
        next.style.top = `${tag.offsetTop}px`;
        next.style.left = `auto`;
        next.style.left = `${tag.offsetLeft + tag.offsetWidth - 15}px`;
        next.style.zIndex = "100";
        next.style.height = `${tag.offsetHeight}px`;
      }
    });
  };
  const resetAll = () => {
    setProject(null);
    setProjectId(undefined);
    setProjectName("");
    setOpenInfoKey(null);
    updateHtmlJson([]);
  };
  const removeKeys = (node: ProjectNode | string): any => {
    if (!node) return node;
    if (typeof node === "string") return node;

    const { _key, children, ...rest } = node; // удаляем _key
    if (!_key) return;
    return {
      ...rest,
      children: Array.isArray(children) ? children.map(removeKeys) : children,
    };
  };
  const updateTempProject = async () => {
    console.log("<==♻️♻️==update projectId====>", projectId);

    if (!projectId || !project) return;

    // Убираем _key из всех узлов
    const cleanedProject = removeKeys(project);
    console.log("<=♻️♻️==update cleanedProject====>", cleanedProject);

    try {
      await updateProject({
        variables: {
          projectId,
          data: cleanedProject, // передаем объект/массив, без JSON.stringify
        },
      });
      setOpenInfoKey(null);
      setModalMessage("Project updated successfully.");
    } catch (error) {
      setModalMessage(error);
    }
  };
  const delProject = async (id: string) => {
    if (!id) return;
    await removeProject({ variables: { projectId: id } });
    resetAll();
    setModalMessage("Project removed");
  };
  const addRuntimeKeys = (node: ProjectData | string): ProjectData | string => {
    if (typeof node === "string") {
      return node;
    }

    return {
      _key: node._key || crypto.randomUUID(),
      ...node,
      children: Array.isArray(node.children)
        ? node.children.map(addRuntimeKeys)
        : node.children,
    };
  };
  const renderNode = useMemo(
    () =>
      createRenderNode({
        editMode,
        openInfoKey,
        setOpenInfoKey,
        setProject,
        setNodeToDragEl,
        setNodeToDrag,
        nodeToDragEl,
        nodeToDrag,
        setModalMessage,
        updateHtmlJson,
        project,
        resetAll,
      }),
    [editMode, nodeToDrag, nodeToDragEl, openInfoKey]
  );
  const createHtml = async () => {
    if (htmlJson) {
      const { html } = jsonToHtml(htmlJson);
      console.log("<==== html ====>", html);
      try {
        await navigator.clipboard.writeText(html);
        setModalMessage("Html copied!");
      } catch {
        setModalMessage("Failed to copy");
      }
    }
  };
  const createSCSS = async () => {
    if (htmlJson) {
      const { scss } = jsonToHtml(htmlJson);
      console.log("<==== scss ====>", scss);
      try {
        await navigator.clipboard.writeText(scss);
        setModalMessage("Scss copied!");
      } catch {
        setModalMessage("Failed to copy");
      }
    }
  };
  const createPug = async () => {
    if (htmlJson) {
      const { pug } = jsonToHtml(htmlJson);
      console.log("<==== pug ====>", pug);
      try {
        await navigator.clipboard.writeText(pug);
        setModalMessage("Pug copied!");
      } catch {
        setModalMessage("Failed to copy");
      }
    }
  };
  //
  return (
    <section
      className={`${
        isPlaza() ? "pt-[100px]" : "pt-12"
      } min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 pb-12`}
    >
      <div className={`${isPlaza() ? "container" : ""}`}>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Plaza Editor
          </h1>
          <p className="text-slate-600 text-lg">
            Build and manage your HTML/CSS projects
          </p>
        </div>
        <div className="mb-8">
          <AdminComponent />
        </div>
        <div className="bg-navy rounded-2xl shadow-xl p-2 mb-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-xl text-white">🛠️</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Editor Tools</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="btn-teal"
              type="button"
              onClick={() => resetAll()}
            >
              <ClearIcon />
              <span className="text-sm font-medium">Clear</span>
            </button>
            <button
              className={`btn-teal ${editMode ? "teal-500 " : " "}`}
              type="button"
              onClick={() => setEditMode((prev) => !prev)}
            >
              <EditModeIcon></EditModeIcon>
              <span className="text-sm font-medium">Edit Mode</span>
            </button>
            <button
              className="btn-teal disabled:opacity-50"
              type="button"
              onClick={undo}
              disabled={undoStack.length === 0}
            >
              <СhevronLeft />
              <span className="text-sm font-medium">UNDO</span>
            </button>
            <button
              className="btn-teal disabled:opacity-50 "
              type="button"
              onClick={redo}
              disabled={redoStack.length === 0}
            >
              <span className="text-sm font-medium">REDO</span> <СhevronRight />
            </button>
            <div className="h-8 w-px bg-slate-300"></div>
            <button
              className="btn-teal"
              type="button"
              onClick={() => createHtml()}
            >
              <Image src="/svg/html.svg" alt="copy" width={16} height={16} />

              <span className="text-sm font-medium">HTML</span>
            </button>
            <button
              className="btn-teal"
              type="button"
              onClick={() => createSCSS()}
            >
              <Image src="/svg/scss.svg" alt="copy" width={16} height={16} />
              <span className="text-sm font-medium">SCSS</span>
            </button>
            <button
              className="btn-teal"
              type="button"
              onClick={() => createPug()}
            >
              <Image src="/svg/pug.svg" alt="copy" width={16} height={16} />
              <span className="text-sm font-medium">Pug</span>
            </button>
          </div>
        </div>
        {/* // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨ Canvas */}
        <div className="bg-navy rounded-2xl shadow-xl p-2 mb-8 border border-slate-200 text-[#000]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-xl text-white">📐</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Canvas</h3>
          </div>
          <div
            id="plaza-render-area"
            className="flex flex-col gap-2 mb-2 relative"
          >
            {project &&
              (Array.isArray(project)
                ? project.map(renderNode)
                : renderNode(project))}
          </div>
        </div>
        {/* <motion.div
          id="plaza-container"
          className={`grid transition-all duration-300  gap-2 mt-2 ${editMode ? "bg-slate-400 rounded" : ""}
             overflow-hidden
           `}
        >
          <AnimatePresence mode="wait">
            {openInfoKey != null && project && (
              <motion.div
                key="info-project"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.8, 0.5, 1] }}
              >
                <InfoProject
                  setProject={setProject}
                  updateHtmlJson={updateHtmlJson}
                  project={project}
                  setOpenInfoKey={setOpenInfoKey}
                  openInfoKey={openInfoKey}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div> */}
        {projectName && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-2 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-navy/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📁</span>
                </div>
                <div>
                  <p className="text-sm text-white/80 font-medium">
                    Current Project
                  </p>
                  <h3 className="text-2xl font-bold">{projectName}</h3>
                </div>
              </div>
              {projectId && projectId !== "" && (
                <div className="flex items-center gap-3">
                  <button
                    className="btn-teal"
                    type="button"
                    onClick={() => updateTempProject()}
                  >
                    <div className="w-4 h-4 overflow-hidden">
                      <Update />
                    </div>
                    <span className="text-sm font-medium">Update</span>
                  </button>

                  <button
                    className=" btn btn-allert flex items-center gap-2"
                    type="button"
                    onClick={() => delProject(projectId)}
                  >
                    <Image
                      src="/svg/cross.svg"
                      alt="icon"
                      width={16}
                      height={16}
                      className="brightness-0 invert"
                    />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {user && (
          <div className="bg-navy rounded-2xl shadow-xl p-2 mb-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">📂</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Your Ulon projects
                </h3>
                <p className="text-sm text-slate-600">{user?.name}</p>
              </div>
            </div>

            {loading ? (
              <Loading />
            ) : projects?.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📁</span>
                </div>
                <p className="text-slate-600 text-lg mb-6">No projects yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
                {projects?.map((p) => (
                  <div
                    key={p.id}
                    className={`group relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-2 border-2 transition-all hover:shadow-lg ${
                      projectId === p.id
                        ? "border-purple-500 shadow-lg"
                        : "border-slate-200 hover:border-purple-300"
                    }`}
                  >
                    <button
                      className="absolute top-3 right-3 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                      onClick={() => delProject(p?.id)}
                    >
                      <Image
                        src="/svg/cross-com.svg"
                        alt="icon"
                        width={12}
                        height={12}
                        className="brightness-0 invert"
                      />
                    </button>
                    <button
                      className="w-full text-left"
                      onClick={async () => setpId(p.id)}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 p-2 bg-purple-100 rounded flex items-center justify-center">
                          <span className="">📄</span>
                        </div>
                        <h5 className="text-lg font-bold text-slate-800 flex-1 truncate">
                          {p?.name}
                        </h5>
                      </div>
                      {projectId === p.id && (
                        <div className="mt-3 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium inline-block">
                          Active
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <CreateNewProject />
          </div>
        )}
      </div>
    </section>
  );
}
