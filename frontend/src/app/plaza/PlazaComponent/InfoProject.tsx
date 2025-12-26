"use client";
import React, { useEffect } from "react";
import findNodeByKey from "@/utils/plaza/findNodeByKey";
import { motion, AnimatePresence } from "framer-motion";
import СhevronRight from "@/components/icons/СhevronRight";
import StyleComponent from "./StyleComponent";
import ClassComponent from "./ClassComponent";
import TextComponent from "./TextComponent";
import TagComponent from "./TagComponent";

type ProjectData = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>; // ✅ сюда пойдут src, alt и т.п.
  children: ProjectData[] | string;
};

interface InfoProjectProps {
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  project: ProjectData;
  setOpenInfoKey: React.Dispatch<React.SetStateAction<string>>;
  openInfoKey: string;
  setModalTextsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editMode: boolean;
}
interface InfoProjectProps {
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
}
const InfoProject: React.FC<InfoProjectProps> = ({
  project,
  setProject,
  setOpenInfoKey,
  openInfoKey,
}) => {
  useEffect(() => {
    if (!openInfoKey) return;
    console.log("<===openInfoKey===>", openInfoKey);
  }, [openInfoKey]);
  // ================================
  const updateNodeByKey = (
    nodes: ProjectData | ProjectData[],
    key: string,
    changes: Partial<ProjectData>,
  ): ProjectData | ProjectData[] => {
    if (Array.isArray(nodes)) {
      return nodes.map(
        (node) => updateNodeByKey(node, key, changes) as ProjectData,
      );
    }

    if (nodes._key === key) {
      // если в changes есть attributes — аккуратно мержим
      if (changes.attributes) {
        return {
          ...nodes,
          attributes: { ...nodes.attributes, ...changes.attributes },
        };
      }
      return { ...nodes, ...changes };
    }

    if (Array.isArray(nodes.children)) {
      const updatedChildren = nodes.children.map((child) =>
        typeof child === "string"
          ? child
          : (updateNodeByKey(child, key, changes) as ProjectData),
      );
      return { ...nodes, children: updatedChildren };
    }

    return { ...nodes };
  };

  // ================================
  const infoProject = (node: ProjectData) => {
    if (!node) return;

    return (
      <AnimatePresence mode="wait">
        {openInfoKey != null && project && (
          <motion.div
            key="info-project"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.1, ease: [0.25, 0.8, 0.5, 1] }}
            className="bg-navy rounded shadow-xl p-1  border border-slate-200  bottom-0 right-0 transform min-w-[calc(100vw-310px)] min-h-[312px] fixed  z-5000"
          >
            <div className="  flex flex-col relative rounded border-2 border-[var(--teal)] p-1 text-[#000] h-full">
              {/*===============Tag=================  */}
              <TagComponent
                project={project}
                setProject={setProject}
                node={node}
                updateNodeByKey={updateNodeByKey}
              />
              {/*===============Text=================  */}
              <TextComponent
                setProject={setProject}
                node={node}
                updateNodeByKey={updateNodeByKey}
              />
              {/*===============Class=================  */}
              <ClassComponent
                project={project}
                setProject={setProject}
                node={node}
                updateNodeByKey={updateNodeByKey}
              />
              {/*===============Style=================  */}
              <StyleComponent
                project={project}
                setProject={setProject}
                node={node}
                updateNodeByKey={updateNodeByKey}
              />
              {/*===============================  */}
              {node?.tag === "img" && (
                <>
                  <p className="bg-white !font-bold inline-block z-30 py-1 rounded  -mb-3 w-[max-content]">
                    Src:
                  </p>
                  <textarea
                    value={node?.attributes?.src || ""}
                    onChange={(e) => {
                      const updatedProject = updateNodeByKey(
                        project,
                        node._key,
                        {
                          attributes: { src: e.target.value }, // ✅ обновляем только src
                        },
                      );
                      setProject(updatedProject as ProjectData);
                    }}
                    className="textarea-styles"
                    placeholder=""
                  />
                </>
              )}
              {node?.tag === "input" && (
                <>
                  <p className="bg-white !font-bold inline-block z-30 py-1 rounded  -mb-3 w-[max-content]">
                    Id:
                  </p>
                  <textarea
                    value={node?.attributes?.id || ""}
                    onChange={(e) => {
                      const updatedProject = updateNodeByKey(
                        project,
                        node._key,
                        {
                          attributes: { id: e.target.value },
                        },
                      );
                      setProject(updatedProject as ProjectData);
                    }}
                    className="textarea-styles"
                    placeholder=""
                  />
                </>
              )}
              {node?.tag === "label" && (
                <>
                  <p className="bg-white !font-bold inline-block z-30 py-1 rounded  -mb-3 w-[max-content]">
                    For:
                  </p>
                  <textarea
                    value={node?.attributes?.for || ""}
                    onChange={(e) => {
                      const updatedProject = updateNodeByKey(
                        project,
                        node._key,
                        {
                          attributes: { for: e.target.value },
                        },
                      );
                      setProject(updatedProject as ProjectData);
                    }}
                    className="textarea-styles"
                    placeholder=""
                  />
                </>
              )}{" "}
              {node?.tag === "a" && (
                <>
                  <p className="bg-white !font-bold inline-block z-30 py-1 rounded  -mb-3 w-[max-content]">
                    Href:
                  </p>
                  <textarea
                    value={node?.attributes?.href || ""}
                    onChange={(e) => {
                      const updatedProject = updateNodeByKey(
                        project,
                        node._key,
                        {
                          attributes: { href: e.target.value },
                        },
                      );
                      setProject(updatedProject as ProjectData);
                    }}
                    className="textarea-styles"
                    placeholder=""
                  />
                </>
              )}{" "}
              {node?.tag === "a" && (
                <>
                  <p className="bg-white !font-bold inline-block z-30 py-1 rounded  -mb-3 w-[max-content]">
                    Rel:
                  </p>
                  <textarea
                    value={node?.attributes?.rel || ""}
                    onChange={(e) => {
                      const updatedProject = updateNodeByKey(
                        project,
                        node._key,
                        {
                          attributes: { rel: e.target.value },
                        },
                      );
                      setProject(updatedProject as ProjectData);
                    }}
                    className="textarea-styles"
                    placeholder=""
                  />
                </>
              )}
              <button
                onClick={() => setOpenInfoKey(null)}
                className="absolute left-[50%] -top-4 border rounded bg-slate-200 hover:bg-slate-300 transition-all duration-200   btn-teal w-[60px] !p-0.5"
              >
                <div className="max-h-6 w-full !py-0.5 flex justify-center border-2 border-[var(--teal)]">
                  <СhevronRight width={16} height={16} />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  // ================================
  // ================================
  // ================================
  return <div>{infoProject(findNodeByKey(project, openInfoKey))}</div>;
};

export default InfoProject;
