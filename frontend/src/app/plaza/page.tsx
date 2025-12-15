"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
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
import ModalTexts from "@/components/ModalTexts/ModalTexts";
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

export default function Plaza({
  preview,
  uniqueMixins,
  colorsTo,
  ScssMixVar,
  setScssMixVar,
}) {
  const {
    htmlJson,
    setHtmlJson,
    user,
    setModalMessage,
    updateHtmlJson,
    undo,
    redo,
    undoStack,
    redoStack,
    texts,
    setTexts,
    HTML,
    setHTML,
    SCSS,
    setSCSS,
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
  const [modalTextsOpen, setModalTextsOpen] = useState<boolean>(false);
  const [NNode, setNNode] = useState<ProjectNode>(null);
  const [openAdmin, setOpenAdmin] = useState<boolean>(false);

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

  // ⇨⇨⇨⇨⇨⇨
  // ⇨⇨⇨⇨⇨⇨
  useEffect(() => {
    console.log("<==💥💥💥💥ScssMixVar💥💥💥💥💥 ====>", ScssMixVar);
  }, [ScssMixVar]);
  // ⇨⇨⇨⇨⇨⇨ uniqueMixins, colorsTo придетают пропсами если есть фигма проект
  useEffect(() => {
    const mixins = createMixins();
    const googleFonts = buildGoogleFontsImport();
    if (mixins === undefined || googleFonts === undefined) return;

    setScssMixVar((prev) => {
      const prevText = prev ?? "";

      // ---------- 1. МИКСИНЫ ИЗ prev ----------
      const mixinRegex = /@mixin\s+\S+\s*{[\s\S]*?};/g;
      const existingMixinBlocks = prevText.match(mixinRegex) || [];
      const existingMixinNames = new Set<string>();
      existingMixinBlocks.forEach((block) => {
        const name = block.match(/@mixin\s+(\S+)/)?.[1];
        if (name) existingMixinNames.add(name);
      });
      const prevWithoutMixins = prevText.replace(mixinRegex, "");

      // ---------- 2. ЦВЕТА ИЗ prev ----------
      const prevColorLines: string[] = [];
      let maxColorIndex = 0;
      const existingColorValues = new Set<string>();

      prevWithoutMixins
        .split("\n")
        .map((l) => l.trimEnd())
        .filter((l) => l.trim())
        .forEach((line) => {
          const m = line.match(/^\s*(\$color-(\d+)):\s*(.+);?\s*$/);
          if (m) {
            const idx = Number(m[2]);
            let value = m[3].trim(); // rgb(...); или rgb(...);;;
            value = value.replace(/;+\s*$/, ""); // убираем хвост ;;;
            if (!Number.isNaN(idx)) {
              maxColorIndex = Math.max(maxColorIndex, idx);
            }
            prevColorLines.push(`${m[1]}: ${value};`);
            existingColorValues.add(value);
          }
        });

      // ---------- 3. ИМПОРТЫ и прочий текст из prev ----------
      const importLines: string[] = [];
      const otherLines: string[] = [];

      prevWithoutMixins
        .split("\n")
        .map((l) => l.trimEnd())
        .filter((l) => l.trim())
        .forEach((line) => {
          if (line.includes("https://fonts.googleapis.com")) {
            if (!importLines.includes(line)) importLines.push(line);
          } else if (!line.match(/\$color-\d+:/)) {
            otherLines.push(line);
          }
        });

      // ---------- 4. НОВЫЕ МИКСИНЫ из createMixins ----------
      const newMixinsBlocks: string[] = [];
      mixins
        .split(/(@mixin\s+\S+\s*{[\s\S]*?};)/)
        .filter(Boolean)
        .forEach((block) => {
          const name = block.match(/@mixin\s+(\S+)/)?.[1];
          if (name && !existingMixinNames.has(name)) {
            existingMixinNames.add(name);
            newMixinsBlocks.push(block.trim());
          }
        });

      // ---------- 5. НОВЫЕ ЦВЕТА с продолжением нумерации (по УНИКАЛЬНЫМ значениям) ----------
      const newColorLines: string[] = [];
      let colorIndex = maxColorIndex;

      colorsTo.forEach((colorValue) => {
        const valueMatch = colorValue.match(/:\s*(.+);?$/);
        let value = valueMatch ? valueMatch[1].trim() : colorValue.trim();
        value = value.replace(/;+\s*$/, ""); // убираем ;; если прилетели

        if (existingColorValues.has(value)) {
          // такое значение уже есть → переменную не создаём
          return;
        }

        existingColorValues.add(value);
        colorIndex += 1;
        newColorLines.push(`$color-${colorIndex}: ${value};`);
      });

      // ---------- 6. ИМПОРТЫ ИЗ googleFonts ----------
      if (googleFonts) {
        googleFonts
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.startsWith("@import"))
          .forEach((line) => {
            if (!importLines.includes(line)) {
              importLines.push(line);
            }
          });
      }

      // ---------- 7. Сборка: импорты → переменные → миксины → остальное ----------
      const colorLines = [...prevColorLines, ...newColorLines];
      const mixinBlocksAll = [
        ...existingMixinBlocks.map((b) => b.trim()),
        ...newMixinsBlocks,
      ];

      const parts: string[] = [];

      if (colorLines.length) {
        parts.push(colorLines.join("\n"));
      }

      if (mixinBlocksAll.length) {
        parts.push(mixinBlocksAll.join("\n\n"));
      }

      if (otherLines.length) {
        parts.push(otherLines.join("\n"));
      }

      if (importLines.length) {
        parts.push(importLines.join("\n"));
      }

      let result = parts
        .join("\n\n")
        .split("\n")
        .map((l) => l.trimEnd())
        .filter((l) => l.trim())
        .join("\n");
      // ---------- 8. ЗАМЕНА цветов в миксинах на переменные ----------
      const colorMap = new Map<string, string>();
      colorLines.forEach((line) => {
        const m = line.match(/(\$color-\d+):\s*(.+);/);
        if (m) {
          const name = m[1]; // $color-1
          const value = m[2].trim(); // rgb(...), #fff и т.п.
          colorMap.set(value, name);
        }
      });

      if (colorMap.size > 0) {
        result = result.replace(mixinRegex, (block) => {
          let newBlock = block;
          colorMap.forEach((varName, value) => {
            const valueEscaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const re = new RegExp(`(color:\\s*)${valueEscaped}(\\s*;)`, "g");
            newBlock = newBlock.replace(re, `$1${varName}$2`);
          });
          return newBlock;
        });
      }

      return result;
    });
  }, [uniqueMixins, colorsTo]);

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

  // useEffect(() => {
  //   if (uniqueMixins) {
  //     console.log("<==== uniqueMixins====>", uniqueMixins);
  //   }
  // }, [uniqueMixins]);

  // useEffect(() => {
  //   if (colorsTo) {
  //     console.log("<==== colorsTo====>", colorsTo);
  //   }
  // }, [colorsTo]);
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
    updateHtmlJson([]);
    setScssMixVar("");
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
};`;
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
    [editMode, nodeToDrag, nodeToDragEl, openInfoKey],
  );
  const createHtml = async () => {
    if (htmlJson) {
      const { html } = jsonToHtml(htmlJson);
      console.log("<==== html ====>", html);
      setHTML(html);
      try {
        await navigator.clipboard.writeText(html);
        // setModalMessage("Html copied!");
      } catch {
        setModalMessage("Failed to copy");
      }
    }
  };

  const createSCSS = async () => {
    if (htmlJson) {
      const { scss } = jsonToHtml(htmlJson);
      const res = [ScssMixVar !== undefined ? ScssMixVar : "", scss ?? ""]
        .filter((part) => part)
        .join("\n");
      console.log("<===✅✅=res=✅✅===>", res);
      setSCSS(res);
      try {
        await navigator.clipboard.writeText(res);
        // setModalMessage("Scss copied!");
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
  const SERVICE_TEXTS = [
    "section",
    "container",
    "flex row",
    "flex col",
    "link",
    "span",
    "div",
    "div__wrap",
    "a",
    "button",
    "ul",
    "flex",
    "ul flex row",
    "ul flex col",

    "li",
    "nav",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "legend",
    "article",
    "aside",
    "fieldset",
    "form",
    "header",
    "ol",
    "option",
    "optgroup",
    "select",
    "imgs",
    "img",
    "img-container",
    "img container",
    "hero__wrap",
    "hero__title",
    "hero__content",
    "hero img",
    "hero__img",
    "hero__info",
    "hero__items",
    "slotes",
    "slotes__wrap",
    "slotes__title",
    "slotes__title title",
    "slotes__cards",
    "slotes__cards cards",
    "cards__card",
    "cards__card card",
    "card__title",
    "card__button",
  ];
  function cleanServiceTexts() {
    const serviceSet = new Set(
      SERVICE_TEXTS.map((t) => t.trim().toLowerCase()),
    );

    function walk(node) {
      if (!node || typeof node !== "object") return node;

      let nextText = node.text;

      if (typeof node.text === "string") {
        const normalizedText = node.text.trim().toLowerCase();
        if (serviceSet.has(normalizedText)) {
          nextText = "";
        }
      }

      let nextChildren = node.children;
      if (Array.isArray(node.children)) {
        nextChildren = node.children.map(walk);
      }

      return {
        ...node,
        text: nextText,
        children: nextChildren,
      };
    }

    if (Array.isArray(htmlJson)) {
      setHtmlJson(htmlJson.map(walk));
    } else {
      setHtmlJson(walk(htmlJson));
    }
  }

  //
  //
  return (
    <section
      className={`${
        isPlaza() ? "pt-[100px]" : "pt-12"
      } min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 pb-[200px]`}
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

        {/* ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨ */}
        {preview && <img src={preview?.filePath} alt="preview" />}
        <div
          className={`${openAdmin ? "translate-x-0" : "translate-x-[calc(-100%+20px)]"} left-0 fixed bottom-0  z-5000 grid-cols-[140px_1fr] w-full h-[max-content] pt-1 grid  gap-2 bg-slate-200 rounded transition-all duration-100 ease-in-out`}
        >
          <button
            onClick={() => {
              setOpenAdmin((prev) => {
                return !prev;
              });
            }}
            className={` absolute top-0.5 translateY-[-50%] right-0 bg-[var(--light-navy)] px-1 font-bold border h-full    border-[var(--white)] transition-all duration-300 ease-in-out  hover:bg-[var(--teal)] hover:text-white hover:border-[var(--teal)] `}
          >
            <div className={`${openAdmin ? "rotate-180" : "rotate-0"}   w-3`}>
              <СhevronRight />
            </div>
          </button>
          <div className="bg-navy rounded shadow-xl p-1  border border-slate-200 max-h-[max-content]">
            <div className="flex flex-col items-center gap-2">
              <button
                className="btn-teal w-full"
                type="button"
                onClick={() => resetAll()}
              >
                <ClearIcon />
                <span className="text-sm font-medium">Clear</span>
              </button>
              <button
                className={`btn-teal  w-full ${editMode ? "teal-500 " : " "}`}
                type="button"
                onClick={() => setEditMode((prev) => !prev)}
              >
                <EditModeIcon></EditModeIcon>
                <span className="text-sm font-medium">Edit Mode</span>
              </button>
              <div className="grid grid-cols-2 gap-1">
                <button
                  className="btn-teal   disabled:opacity-50"
                  type="button"
                  onClick={undo}
                  disabled={undoStack.length === 0}
                >
                  <СhevronLeft width={12} height={14} />
                  <span className="text-[10px]">UNDO</span>
                </button>
                <button
                  className="btn-teal    disabled:opacity-50 "
                  type="button"
                  onClick={redo}
                  disabled={redoStack.length === 0}
                >
                  <span className="text-[10px]">REDO</span>{" "}
                  <СhevronRight width={12} height={14} />
                </button>
              </div>
              <button
                className="btn-teal  w-full"
                type="button"
                onClick={() => cleanServiceTexts()}
              >
                {" "}
                Clear services texts{" "}
              </button>
              <div className="h-px w-full bg-slate-300"></div>
              <button
                className="btn-teal  w-full"
                type="button"
                onClick={() => createHtml()}
              >
                <Image src="/svg/html.svg" alt="copy" width={16} height={16} />

                <span className="text-sm font-medium">HTML</span>
              </button>
              <button
                className="btn-teal  w-full"
                type="button"
                onClick={() => createSCSS()}
              >
                <Image src="/svg/scss.svg" alt="copy" width={16} height={16} />
                <span className="text-sm font-medium">SCSS</span>
              </button>
              <button
                className="btn-teal  w-full"
                type="button"
                onClick={() => createPug()}
              >
                <Image src="/svg/pug.svg" alt="copy" width={16} height={16} />
                <span className="text-sm font-medium">Pug</span>
              </button>
            </div>
          </div>
          <AdminComponent />
          <motion.div
            id="plaza-container"
            className={`grid transition-all duration-300  gap-2  ${editMode ? "bg-slate-400 rounded" : ""}

           `}
          >
            <AnimatePresence mode="wait">
              {openInfoKey != null && project && (
                <motion.div
                  key="info-project"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ duration: 0.1, ease: [0.25, 0.8, 0.5, 1] }}
                  className="bg-navy rounded-2xl shadow-xl p-1  border border-slate-200 fixed bottom-0 right-0 transform min-w-[300px]   z-50"
                >
                  <InfoProject
                    project={project}
                    setProject={setProject}
                    updateHtmlJson={updateHtmlJson}
                    setOpenInfoKey={setOpenInfoKey}
                    openInfoKey={openInfoKey}
                    setModalTextsOpen={setModalTextsOpen}
                    setNNode={setNNode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        {/* ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨ */}
        {user && (
          <div className="bg-navy rounded-2xl shadow-xl p-2 mt-2 mb-8 border border-slate-200">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax( 200px, 1fr))] gap-2 mb-6">
                {projects?.map((p) => (
                  <div
                    key={p.id}
                    className={`gap-2 group relative p-2 ${
                      projectId === p.id
                        ? "border border-[var(--teal)] flex flex-col"
                        : "btn-teal"
                    }`}
                  >
                    {projectId !== p.id && (
                      <button
                        className="absolute top-[50%] right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10 transform translate-y-[-50%]"
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
                    )}

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
                    </button>
                    {projectId && projectId !== "" && projectId === p.id && (
                      <div className="flex items-center gap-3">
                        <button
                          className="btn-teal !py-0"
                          type="button"
                          onClick={() => updateTempProject()}
                        >
                          <div className="w-4 h-4 overflow-hidden">
                            <Update />
                          </div>
                          <span className="text-sm font-medium">Update</span>
                        </button>

                        <button
                          className=" btn px-2 btn-allert min-w-[max-content]  gap-2"
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
                ))}
                <button
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
                    setNNode(null);
                    setOpenAdmin(false);
                  }}
                >
                  Quit active Project
                </button>
              </div>
            )}
            <ModalTexts
              project={project}
              modalTextsOpen={modalTextsOpen}
              setModalTextsOpen={setModalTextsOpen}
              setProject={setProject}
              node={NNode}
            />
            <CreateNewProject ScssMixVar={ScssMixVar} />
          </div>
        )}
      </div>
    </section>
  );
}
