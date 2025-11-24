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
// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
type ProjectData = {
  tag: string;
  text: string;
  class: string;
  style: string;
  children: ProjectData[] | string;
};
type OpenInfo = {
  open: boolean;
  infoIndex: string;
};
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
    texts,
    setTexts,
  } = useStateContext();
  const pathname = usePathname();
  const [projects, setProjects] = useState<PProject[]>([]);
  const [project, setProject] = useState<PProject>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [openInfoKey, setOpenInfoKey] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [pId, setpId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nodeToDragEl, setNodeToDragEl] = useState<HTMLElement | null>(null);
  const [nodeToDrag, setNodeToDrag] = useState<any>(null);
  const isSyncingRef = useRef(false);
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const isFigma = pathname === "/figma";
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

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️ добавление проекта
  // берем детей с пришедшего проекта и добавляем в htmlJson
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

  // 🔻🔻🔻🔻🔻 // Преобразуем в структуру с ключами
  // 🔻🔻🔻🔻🔻
  // 🔻🔻🔻🔻🔻
  useEffect(() => {
    if (!htmlJson) return;
    isSyncingRef.current = true;

    const mergeWithExistingKeys = (
      node: ProjectData | string,
      existing?: ProjectData | string
    ): ProjectData | string => {
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

  // 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺
  // 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺
  // 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
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
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  useLayoutEffect(() => {
    if (!project) return;
    // console.log("<====🔹🔹🔹🔹🔹project🔹🔹🔹🔹🔹====>", project);
    if (project && editMode) {
      requestAnimationFrame(() => shiftNeighbors());
    }
  }, [project, editMode, openInfoKey]);

  //// ♻️♻️♻️♻️♻️♻️♻️♻️
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
  // ♻️♻️♻️♻️♻️♻️♻️♻️
  const removeKeys = (node: any): any => {
    if (!node) return node;
    if (typeof node === "string") return node;

    const { _key, children, ...rest } = node; // удаляем _key
    if (!_key) return;
    return {
      ...rest,
      children: Array.isArray(children) ? children.map(removeKeys) : children,
    };
  };
  // ♻️♻️♻️♻️♻️♻️♻️♻️
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

  // ♻️♻️♻️♻️♻️♻️♻️♻️
  const delProject = async (id) => {
    if (!id) return;
    await removeProject({ variables: { projectId: id } });
    resetAll();
    setModalMessage("Project removed");
  };
  // ♻️♻️♻️♻️♻️♻️♻️♻️render♻️♻️♻️♻️♻️♻️♻️♻️
  const addRuntimeKeys = (node: ProjectData | string): ProjectData | string => {
    if (typeof node === "string") return node;

    return {
      _key: node._key || crypto.randomUUID(),
      ...node,
      children: Array.isArray(node.children)
        ? node.children.map(addRuntimeKeys)
        : node.children,
    };
  };
  // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
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
  //⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
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
  //⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️

  //⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 py-[100px]">
      <div className="container mx-auto px-4 max-w-7xl">
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
              className="group relative px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white  rounded-lg border border-transparent hover:border-[var(--teal)] hover:shadow-lg  flex items-center gap-2"
              type="button"
              onClick={() => resetAll()}
            >
              <Image
                src="/svg/clear.svg"
                alt="icon"
                width={18}
                height={18}
                className="brightness-0 invert"
              />
              <span className="text-sm font-medium">Clear</span>
            </button>
            <button
              className={`group relative px-4 py-2.5 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 border border-transparent hover:border-[var(--teal)] ${
                editMode
                  ? "teal-500 "
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              type="button"
              onClick={() => setEditMode((prev) => !prev)}
            >
              {/* <Image
                src="/svg/drag.svg"
                alt="icon"
                width={18}
                height={18}
                style={editMode ? { color: "#64ffda" } : { fill: "#a8b2d1" }}
              /> */}

              <svg
                fill="currentColor"
                height="18px"
                width="18px"
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 399.07 399.07"
              >
                <g>
                  <path
                    d="M365.083,74.011L348.113,57.04c-3.906-3.904-10.236-3.904-14.143,0c-3.873,3.873-3.899,10.129-0.091,14.042h-22.365
		c-5.522,0-10,4.477-10,10c0,5.523,4.478,10,10,10h22.365c-3.809,3.913-3.782,10.169,0.091,14.042
		c1.953,1.952,4.512,2.929,7.071,2.929c2.56,0,5.118-0.977,7.071-2.929l16.971-16.971C368.988,84.248,368.988,77.916,365.083,74.011
		z"
                  />
                  <path
                    d="M225.747,105.124c1.953,1.952,4.512,2.929,7.071,2.929c2.56,0,5.118-0.977,7.071-2.929
		c3.873-3.873,3.899-10.129,0.091-14.042h22.365c5.522,0,10-4.477,10-10c0-5.523-4.478-10-10-10h-22.365
		c3.809-3.913,3.782-10.169-0.091-14.042c-3.906-3.904-10.236-3.904-14.143,0l-16.971,16.971c-3.905,3.905-3.905,10.237,0,14.143
		L225.747,105.124z"
                  />
                  <path
                    d="M286.93,95.666c-5.522,0-10,4.477-10,10v22.365c-3.913-3.809-10.168-3.782-14.042,0.091
		c-3.905,3.905-3.905,10.237,0,14.143l16.971,16.971c1.953,1.953,4.512,2.929,7.071,2.929c2.56,0,5.118-0.976,7.071-2.929
		l16.971-16.971c3.905-3.905,3.905-10.237,0-14.143c-3.874-3.873-10.129-3.9-14.042-0.091v-22.365
		C296.93,100.143,292.452,95.666,286.93,95.666z"
                  />
                  <path
                    d="M276.93,34.133v22.365c0,5.523,4.478,10,10,10c5.522,0,10-4.477,10-10V34.133c1.94,1.889,4.453,2.838,6.971,2.838
		c2.56,0,5.118-0.976,7.071-2.929c3.905-3.905,3.905-10.237,0-14.143L294.001,2.929c-3.906-3.905-10.236-3.905-14.142,0
		L262.888,19.9c-3.905,3.905-3.905,10.237,0,14.143C266.762,37.915,273.017,37.942,276.93,34.133z"
                  />
                  <path
                    d="M276.403,184.847c-5.572,0-11.22,1.072-16.508,3.065c-7.351-14.431-22.344-24.338-39.604-24.338
		c-6.152,0-12.015,1.166-17.344,3.271c-7.494-14.005-22.274-23.558-39.244-23.558c-4.251,0-8.414,0.594-12.394,1.743
		c0.004-4.974,0.008-10.103,0.012-15.225l0.028-39.856c0.008-10.637,0.011-15.562-0.033-18.109h0.043
		c0-22.711-19.849-41.188-44.246-41.188c-24.521,0-44.471,19.95-44.471,44.472v135.569c-16.375,5.479-30.83,20.593-31.436,42.169
		c-0.949,33.752,1.816,76.462,31.893,107.396c25.391,26.114,65.127,38.809,121.482,38.809c50.684,0,88.169-14.909,111.414-44.311
		c16.326-20.651,24.955-48.48,24.955-80.48l-0.078-44.995C320.873,204.797,300.924,184.847,276.403,184.847z M184.582,379.07
		c-119.311,0-135.217-60.478-133.383-125.644c0.441-15.717,13.953-25,25-25v28.823c0,3.625,2.514,4.047,3.264,4.047
		s3.18-0.412,3.18-4.038c0-3.499,0-182.132,0-182.132c0-13.515,10.955-24.472,24.471-24.472c12.402,0,24.246,8.881,24.246,21.188
		c0.008,0.045-0.064,89.86-0.076,111.957c-0.002,0.046-0.014,0.089-0.014,0.135v4.617c0,2.201,1.785,3.985,3.986,3.985
		c2.199,0,3.984-1.784,3.984-3.985v-1.194c0.217-13.328,11.082-24.067,24.463-24.067c13.514,0,24.473,10.957,24.473,24.473
		l0.018,17.721c0,2.168,1.758,3.925,3.926,3.925c2.166,0,3.924-1.757,3.924-3.925l-0.008-1.014
		c0-12.305,11.955-20.894,24.256-20.894c13.516,0,24.422,10.956,24.422,24.472l0.049,17.937c0,2.109,1.709,3.819,3.818,3.819
		c2.109,0,3.818-1.71,3.818-3.819l-0.014-1.365c0-11.19,12.109-19.771,24.018-19.771c13.514,0,24.471,10.957,24.471,24.472
		l0.078,44.96C300.951,316.094,284.69,379.07,184.582,379.07z"
                  />
                </g>
              </svg>
              <span className="text-sm font-medium">Edit Mode</span>
            </button>
            <button
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              type="button"
              onClick={undo}
              disabled={undoStack.length === 0}
            >
              <Image
                src="/svg/chevron-left.svg"
                alt="icon"
                width={14}
                height={14}
              />
              <span className="text-sm font-medium">Undo</span>
            </button>
            <button
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 "
              type="button"
              onClick={redo}
              disabled={redoStack.length === 0}
            >
              <Image
                src="/svg/chevron-right.svg"
                alt="icon"
                width={14}
                height={14}
              />
              <span className="text-sm font-medium">Redo</span>
            </button>
            <div className="h-8 w-px bg-slate-300"></div>
            <button
              className="px-4 py-2.5 text-white rounded-lg border border-transparent hover:border-[var(--teal)] hover:shadow-lg transition-all flex items-center gap-2"
              type="button"
              onClick={() => createHtml()}
            >
              <Image
                src="/svg/html.svg"
                alt="icon"
                width={18}
                height={18}
                className="brightness-0 invert"
              />
              <span className="text-sm font-medium">HTML</span>
            </button>
            <button
              className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 border border-transparent hover:border-[var(--teal)]"
              type="button"
              onClick={() => createSCSS()}
            >
              <Image
                src="/svg/scss.svg"
                alt="icon"
                width={18}
                height={18}
                className="brightness-0 invert"
              />
              <span className="text-sm font-medium">SCSS</span>
            </button>
            <button
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 border border-transparent hover:border-[var(--teal)]"
              type="button"
              onClick={() => createPug()}
            >
              <Image
                src="/svg/pug.svg"
                alt="icon"
                width={18}
                height={18}
                className="brightness-0 invert"
              />
              <span className="text-sm font-medium">Pug</span>
            </button>
          </div>
        </div>
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
        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
        {/* --- информация о проекте --- */}
        <motion.div
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
        </motion.div>
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
                    className="px-4 py-2.5 bg-navy/20 backdrop-blur hover:bg-navy/30 text-white rounded-lg transition-all flex items-center gap-2"
                    type="button"
                    onClick={() => updateTempProject()}
                  >
                    <Image
                      src="/svg/update.svg"
                      alt="icon"
                      width={16}
                      height={16}
                      className="brightness-0 invert"
                    />
                    <span className="text-sm font-medium">Update</span>
                  </button>
                  <button
                    className="px-4 py-2.5 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-all flex items-center gap-2"
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
              <div className="text-center py-12">
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

        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}

        <hr className="bordered border-slate-200 " />
        {/* {project && (
            <pre>
              <code>{JSON.stringify(project, null, 2)}</code>
            </pre>
          )}  */}
        {/* [{"tag":"div","text":"container","class":"","style": "background: mediumblue; padding: 2px 4px; border: 1px solid #adadad; ","children": []}] */}
        {/* {htmlJson && (
          <pre>
            <code>{JSON.stringify(htmlJson, null, 2)}</code>
          </pre>
        )} */}
      </div>
    </section>
  );
}
