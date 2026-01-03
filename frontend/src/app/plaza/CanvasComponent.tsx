"use client";
import React, { useState } from "react";
import PageHeader from "./PlazaComponent/PageHeader";
import { useStateContext } from "@/providers/StateProvider";
import ClearIcon from "@/components/icons/ClearIcon";
import EditModeIcon from "@/components/icons/EditModeIcon";
import СhevronLeft from "@/components/icons/СhevronLeft";
import СhevronRight from "@/components/icons/СhevronRight";
import SundboxIcon from "@/components/icons/SundboxIcon";
import Loading from "@/components/ui/Loading/Loading";
import voidTags from "./voidTags";
import dynamic from "next/dynamic";
import cleanServiceTexts from "./cleanServiceTexts";
import addNodeToTargetByKey from "./addNodeToTargetByKey";
import removeNodeByKey from "./removeNodeByKey";

const NodeInfo = dynamic(() => import("./NodeInfo"), {
  ssr: false,
  loading: () => <Loading />,
});

type HtmlNode = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  _key?: string;
  children: HtmlNode[] | string;
};

type Tree = HtmlNode | HtmlNode[];

export default function CanvasComponent() {
  const [openInfoModal, setOpenInfoModal] = useState<boolean>(false);
  const [NodeToSend, setNodeToSend] = useState<string>("");
  const [dragKey, setDragKey] = useState<string | null>(null);
  const {
    htmlJson,
    resetHtmlJson,
    undo,
    redo,
    undoStack,
    redoStack,
    updateHtmlJson,
  } = useStateContext();
  const resetAll = () => {
    resetHtmlJson();
  };

  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  const renderNode = (node: any) => {
    if (!node) return null;
    if (typeof node === "string") {
      return <span key={crypto.randomUUID()}>{node}</span>;
    }

    const Tag = node.tag as keyof JSX.IntrinsicElements;
    if (!Tag) return null;

    const isVoid = voidTags.includes(node.tag);

    if (isVoid) {
      return (
        <Tag
          key={node._key ?? crypto.randomUUID()}
          {...(node.attributes || {})}
        />
      );
    }

    const children = Array.isArray(node.children)
      ? node.children.map((child: any, idx: number) => (
          <React.Fragment key={child._key ?? idx}>
            {renderNode(child)}
          </React.Fragment>
        ))
      : null;

    // --------
    const handleDragStart = (e: React.DragEvent<HTMLElement>, node: any) => {
      e.stopPropagation();
      if (!node._key) return;
      const target = e.currentTarget as HTMLElement;
      e.dataTransfer.effectAllowed = "move";
      const dragGhost = target.cloneNode(true) as HTMLElement;
      dragGhost.style.position = "absolute";
      dragGhost.style.top = "-9999px";
      dragGhost.style.backgroundColor = "#4d6a92";
      dragGhost.style.pointerEvents = "none";
      document.body.appendChild(dragGhost);
      e.dataTransfer.setDragImage(dragGhost, 0, 0);
      setTimeout(() => document.body.removeChild(dragGhost), 0);

      target.style.opacity = "0.3";
      target.style.transition = "opacity 0.2s ease";
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", node._key);
      setDragKey(node._key);
    };
    // ------------------
    const handleDragOver = (e: React.DragEvent<HTMLElement>, node?: any) => {
      e.preventDefault();
      e.stopPropagation();
      if (!node) return;
      const el = e.currentTarget as HTMLElement;
      if (el.classList.contains("baza")) {
        el.style.background = "var(--light-slate)";
      } else {
        el.style.opacity = "1";
        el.style.background = "var(--teal-light)";
      }
    };
    // -----------
    const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      setTimeout(() => {
        if (!el.classList.contains("baza")) {
          el.style.background = "var(--white)";
        }
      }, 0);
    };
    // --------------------
    const handleDrop = (e: React.DragEvent<HTMLElement>, targetNode: any) => {
      e.preventDefault();
      e.stopPropagation();

      const el = e.currentTarget as HTMLElement;
      setTimeout(() => {
        if (!el.classList.contains("baza")) {
          el.style.background = "var(--white)";
        }
      }, 0);

      const sourceKey = e.dataTransfer.getData("text/plain") || dragKey;
      if (!sourceKey || !targetNode?._key) return;
      updateHtmlJson((prevTree: any) => {
        if (!prevTree) return prevTree;

        // 1) вырезаем узел
        const { tree: withoutSource, removed } = removeNodeByKey(
          prevTree,
          sourceKey,
        );
        if (!removed) return prevTree;

        // 2) вставляем в children целевого
        const newTree = addNodeToTargetByKey(
          withoutSource,
          targetNode._key,
          removed,
        );

        return newTree;
      });

      setDragKey(null);
    };

    // ------------

    return (
      <Tag
        onDragStart={(e) => handleDragStart(e, node)}
        onDragOver={(e) => handleDragOver(e, node)}
        onDragLeave={(e) => handleDragLeave(e)}
        onDrop={(e) => handleDrop(e, node)}
        key={`${node._key ?? crypto.randomUUID()}-${node.text ?? ""}`}
        id={node.attributes?.id}
        htmlFor={node.attributes?.for}
        href={node.attributes?.href}
        rel={node.attributes?.rel}
        className={`renderedNode  ${node.class}`}
        style={typeof node.style === "string" ? undefined : node.style}
        onClick={(e) => {
          e.stopPropagation();
          setNodeToSend(node);
          setOpenInfoModal(!openInfoModal);
        }}
        draggable={true}
      >
        {/*{node.class === "baza" ? "BAZA" : node.text}*/}
        {node.class === "baza" ? "" : node.text}
        {children}
      </Tag>
    );
  };
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  const renderContent = Array.isArray(htmlJson)
    ? htmlJson.map((n: any, i: number) => (
        <React.Fragment key={n._key ?? i}>{renderNode(n)}</React.Fragment>
      ))
    : renderNode(htmlJson);

  const handleClean = () => {
    cleanServiceTexts(htmlJson, updateHtmlJson);
  };
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 relative mt-[25px] ">
      {PageHeader("canvasIcon", "Canvas")}

      {renderContent && (
        <div className="flex items-center gap-1 mb-1">
          <button
            className="btn btn-allert !py-1"
            type="button"
            onClick={() => {
              resetAll();
            }}
          >
            <ClearIcon />
          </button>
          <button
            className="btn-teal   disabled:opacity-50"
            type="button"
            onClick={undo}
            disabled={undoStack.length === 0}
          >
            <СhevronLeft width={12} height={14} />
          </button>
          <button
            className="btn-teal    disabled:opacity-50 "
            type="button"
            onClick={redo}
            disabled={redoStack.length === 0}
          >
            <СhevronRight width={12} height={14} />
          </button>
          <button
            className="btn-teal  flex items-center  !gap-2 "
            type="button"
            onClick={() => handleClean()}
          >
            <ClearIcon />
            <p className="!text-[12px] !lh-0">servises texts</p>
          </button>
        </div>
      )}
      <div
        id="plaza-render-area"
        className="flex flex-col gap-2 mb-2 relative text-[#000] rounded overflow-hidden"
      >
        <div className="baza">{renderContent}</div>
      </div>
      <NodeInfo
        openInfoModal={openInfoModal}
        setOpenInfoModal={setOpenInfoModal}
        NodeToSend={NodeToSend}
        setNodeToSend={setNodeToSend}
      />
    </div>
  );
}
