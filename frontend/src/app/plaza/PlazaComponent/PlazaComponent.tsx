"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_PROJECT, REMOVE_PROJECT } from "@/apollo/mutations";
import { GET_ALL_PROJECTS_BY_USER, FIND_PROJECT } from "@/apollo/queries";
import Loading from "@/components/ui/Loading/Loading";
import PProject from "@/types/PProject";
import createRenderNode from "./RenderNode";
import Update from "@/components/icons/Update";
import buildScssMixVar from "./buildScssMixVar";
import CanvasComponent from "./CanvasComponent";
import PlazaHeader from "./PlazaHeader";
import PreviewComponent from "./PreviewComponent";
import AdminPanel from "./AdminPanel";
import "./plaza.scss";
// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
const CreateNewProject = dynamic(() => import("./CreateNewProject"), {
  ssr: false,
  loading: () => <Loading />,
});
const InfoProject = dynamic(() => import("./InfoProject"), {
  ssr: false,
  loading: () => <Loading />,
});
// const ModalTexts = dynamic(() => import("./ModalTexts"), {
//   ssr: false,
// });
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

export default function PlazaComponent() {
  const {
    htmlJson,
    user,
    setModalMessage,
    updateHtmlJson,
    texts,
    setHTML,
    setSCSS,
    preview,
    setPreview,
    colors,
    ScssMixVar,
    setScssMixVar,
    resetHtmlJson,
  } = useStateContext();
  const pathname = usePathname();
  const [projects, setProjects] = useState<PProject[]>([]);
  const [project, setProject] = useState<ProjectNode | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [openInfoKey, setOpenInfoKey] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [pId, setpId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [nodeToDragEl, setNodeToDragEl] = useState<HTMLElement | null>(null);
  const [nodeToDrag, setNodeToDrag] = useState<ProjectNode | null>(null);
  const isSyncingRef = useRef(false);
  // const [modalTextsOpen, setModalTextsOpen] = useState<boolean>(false);
  const [openAdmin, setOpenAdmin] = useState<boolean>(true);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const projectsRef = useRef<HTMLDivElement | null>(null);

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const uniqueMixins = Object.values(
    texts.reduce<Record<string, TextNode>>((acc, el) => {
      const key = `${el.mixin}`;
      if (!acc[key]) {
        acc[key] = el;
      }
      return acc;
    }, {}),
  );

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
    onError: (error) => {
      console.log("<===error.message===>", error.message);
      setModalMessage(`Error loading project: ${error.message}`);
    },
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
  const colorsTo = useMemo(() => {
    if (colors.length > 0) {
      return colors.map((color, index) => `$color-${index + 1}: ${color};`);
    }
    return [];
  }, [colors]);
  // ⇨⇨⇨⇨⇨⇨

  useEffect(() => {
    if (!user) resetAll();
  }, [user]);

  useEffect(() => {
    if (!openInfoKey) return;
    console.log("<==!!!!!=openInfoKey===>", openInfoKey);
    setOpenAdmin(true);
  }, [openInfoKey]);

  useEffect(() => {
    const mixins = createMixins();
    const googleFonts = buildGoogleFontsImport();
    if (!mixins && !googleFonts) return;

    setScssMixVar((prev) =>
      buildScssMixVar(prev ?? "", uniqueMixins, colorsTo, googleFonts, mixins),
    );
  }, [uniqueMixins, colorsTo]);

  // ⇨⇨⇨⇨⇨⇨🔥🔥🔥🔥 proj from bd
  useEffect(() => {
    if (!dataProject) return;

    const proj = dataProject?.findProject;
    console.log("<====🔥🔥🔥🔥 proj from bd 🔥🔥🔥🔥====>", proj);
    setProjectId(proj.id);
    setProjectName(proj.name);
    setScssMixVar((prev) => {
      return proj.scssMixVar;
    });
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
      existing?: ProjectNode | string,
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
                  : undefined,
              ),
            )
          : node.children,
      };
    };

    setProject((prevProject) =>
      Array.isArray(htmlJson)
        ? htmlJson.map((node, i) =>
            mergeWithExistingKeys(node, prevProject?.[i]),
          )
        : mergeWithExistingKeys(htmlJson, prevProject),
    );
  }, [htmlJson]);

  useEffect(() => {
    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }
    const newProject = removeKeys(project);
    if (!newProject) return;
    updateHtmlJson(newProject);
  }, [project]);

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
  const resetAll = () => {
    setProject(null);
    setProjectId("");
    setProjectName("");
    setOpenInfoKey(null);
    setScssMixVar("");
    setHTML("");
    setSCSS("");
    resetHtmlJson();
  };

  const buildGoogleFontsImport = () => {
    const uniqueFonts = Array.from(
      new Set(uniqueMixins.map((f) => f.fontFamily)),
    );
    if (uniqueFonts.length === 0) return "";
    return `@import url('https://fonts.googleapis.com/css2?${uniqueFonts
      .map(
        (name) =>
          `family=${encodeURIComponent(name)}:ital,wght@0,100..900;1,100..900`,
      )
      .join("&")}&display=swap');`;
  };
  const createMixins = () => {
    if (!uniqueMixins?.length) return undefined;

    const mixins = uniqueMixins.map((el) => {
      return `@mixin ${el.mixin} {
  font-family: "${el.fontFamily}", sans-serif;
  font-weight: ${el.fontWeight};
  font-size: ${el.fontSize};
  color: ${el.color};
}`;
    });

    return mixins.join("\n\n");
  };

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
    [editMode, nodeToDrag, nodeToDragEl, openInfoKey],
  );

  //-------------

  return (
    <section
      className={`${
        isPlaza() ? "pt-[100px]" : "pt-12"
      } min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 pb-[500px]`}
    >
      <div className={`${isPlaza() ? "container" : ""}`}>
        <PlazaHeader />
        <div ref={previewRef}>
          <PreviewComponent preview={preview} setPreview={setPreview} />
        </div>
        <div ref={canvasRef}>
          <CanvasComponent project={project} renderNode={renderNode} />
        </div>
        <AdminPanel
          openAdmin={openAdmin}
          setOpenAdmin={setOpenAdmin}
          resetAll={resetAll}
          editMode={editMode}
          setEditMode={setEditMode}
          previewRef={previewRef}
          canvasRef={canvasRef}
          projectsRef={projectsRef}
        />
        <InfoProject
          project={project}
          setProject={setProject}
          setOpenInfoKey={setOpenInfoKey}
          openInfoKey={openInfoKey}
        />
        {/* ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨ */}
        {user && (
          <div
            ref={projectsRef}
            className="bg-navy rounded-2xl shadow-xl p-2 mt-2 mb-8 border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className=" text-white"> 📋</span>
                </div>
                <h6 className=" font-bold text-slate-800">
                  Your Ulon projects
                </h6>
              </div>
            </div>

            {/*=========projects========*/}
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
              <div className=" flex flex-wrap gap-2 mb-6 ">
                {/*{projectId !== "" && (
                  <button
                    className="btn btn-empty mt-2 px-2"
                    type="button"
                    onClick={() => {
                      setOpenAdmin(false);
                      setProject(null);
                      setScssMixVar("");
                      setProjectId("");
                      setOpenInfoKey(null);
                      setProjectName("");
                      setpId(null);
                      setEditMode(false);
                      setNodeToDragEl(null);
                      setNodeToDrag(null);
                      setModalTextsOpen(false);
                      setOpenAdmin(false);
                    }}
                  >
                    Quit active Project
                  </button>
                )}*/}
                {/*======= projects =======*/}
                {/*======= projects =======*/}
                {/*======= projects =======*/}
                {projects?.map((p) => (
                  <div key={p.id} className={`flex gap-2 w-full `}>
                    <div
                      className={`gap-2 w-full group rounded relative p-1   border   ${
                        projectId === p.id
                          ? " border-[var(--teal)] flex flex-col bg-[var(--teal-navi)] text-[var(--white)]"
                          : "hover:bg-slate-300 hover:border-[var(--teal)] hover:text-[var(--teal-light)] border-transparent bg-slate-200"
                      }`}
                    >
                      <button
                        className={`w-full text-left  text-sm font-medium `}
                        onClick={async () => setpId(p.id)}
                        type="button"
                        disabled={loadingProject || projectId === p.id}
                      >
                        {loadingProject ? <Loading /> : p?.name}
                      </button>
                    </div>

                    {/*======== update Remove =========*/}
                    {projectId && projectId !== "" && projectId === p.id && (
                      <div className="flex items-center gap-3">
                        <button
                          className="btn btn-primary !py-0"
                          type="button"
                          onClick={() => updateTempProject()}
                        >
                          <div className="w-4 h-4 overflow-hidden">
                            <Update />
                          </div>
                          <span className="text-sm font-medium ml-2">
                            Update
                          </span>
                        </button>
                        <button
                          className=" btn px-2 btn-allert min-w-[max-content]  gap-2"
                          type="button"
                          onClick={() => delProject(projectId)}
                        >
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    )}
                    {/*=================*/}
                  </div>
                ))}

                {/*======== /projects =========*/}
              </div>
            )}
            {/*{modalTextsOpen && (
              <ModalTexts
                project={project}
                modalTextsOpen={modalTextsOpen}
                setModalTextsOpen={setModalTextsOpen}
                setProject={setProject}
              />
            )}
            {texts && texts.length > 0 && setModalTextsOpen && (
              <button
                className="btn btn-empty w-[max-content] ml-4 mr-1 px-2"
                onClick={() => setModalTextsOpen(true)}
              >
                Show all texts
              </button>
            )}*/}
            <CreateNewProject ScssMixVar={ScssMixVar} />
          </div>
        )}
      </div>
    </section>
  );
}
