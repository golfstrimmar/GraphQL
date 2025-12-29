"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import { useStateContext } from "@/providers/StateProvider";
import { motion, AnimatePresence } from "framer-motion";
type ProjectData = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>; // ✅ сюда пойдут src, alt и т.п.
  children: ProjectData[] | string;
};

const defaultTexts = [
  "Lorem ipsum ",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
];

const ModalTexts = ({
  project,
  modalTextsOpen,
  setModalTextsOpen,
  setProject,
  node,
}) => {
  const { texts, setTexts } = useStateContext();
  useEffect(() => {
    if (!node) return;
    console.log("<==!!!!!!=node===>", node);
  }, [node]);
  useEffect(() => {
    if (!project) return;
    console.log("<=!!!!!!==project===>", project);
  }, [project]);
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

  const setTextFigma = (foo) => {
    const removeMixins = (style: string) =>
      style
        .split("\n")
        .map((l) => l.trimEnd())
        .filter((line) => !line.trim().startsWith("@include "))
        .join("\n")
        .trim();
    const rawStyle = node.style || "";
    const styleWithoutMixins = removeMixins(rawStyle);
    const mixinString = `@include ${foo.mixin};`;
    const newStyle = styleWithoutMixins
      ? `${styleWithoutMixins}\n${mixinString}`
      : mixinString;
    const updatedProject = updateNodeByKey(project, node._key, {
      text: foo.text,
      style: newStyle,
    });

    setProject(updatedProject as ProjectData);
    setModalTextsOpen(false);
  };

  return (
    <AnimatePresence mode="wait">
      {texts && modalTextsOpen && (
        <motion.div
          key="info-project"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.8, 0.5, 1] }}
          className=" flex flex-col justify-center items-center  gap-1  fixed top-0 right-0 w-[100vw] h-[100vh] z-5000  bg-slate-900"
        >
          <button
            className="absolute top-2 right-6"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setModalTextsOpen(false);
            }}
          >
            <Image src="/svg/cross.svg" alt="close" width={20} height={20} />
          </button>
          {defaultTexts.map((foo, index) => (
            <div className="flex gap-4" key={index}>
              <button
                className="btn btn-empty text-white  px-2 bg-slate-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const updatedProject = updateNodeByKey(project, node._key, {
                    text: foo,
                  });
                  setProject(updatedProject as ProjectData);
                  setModalTextsOpen(false);
                }}
              >
                {foo}
              </button>
            </div>
          ))}
          {texts.map((foo, index) => (
            <div className="flex gap-4" key={index}>
              <button
                className="btn btn-empty text-white  px-2 bg-slate-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTextFigma(foo);
                }}
              >
                {foo.text}
              </button>
              <span className="text-white"> @include {foo.mixin}</span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalTexts;
