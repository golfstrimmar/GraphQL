"use client";
import React, { useState, useEffect } from "react";
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

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function CanvasComponent() {
  const [openInfoModal, setOpenInfoModal] = useState<boolean>(false);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  const {
    htmlJson,
    resetHtmlJson,
    undo,
    redo,
    undoStack,
    redoStack,
    updateHtmlJson,
    activeKey,
    setActiveKey,
  } = useStateContext();

  const resetAll = () => {
    resetHtmlJson();
    setActiveKey(null);
    setDragKey(null);
  };

  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  const handleDrop = (
    e: React.DragEvent<HTMLElement>,
    targetNode: any | null,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveKey(null);
    const el = e.currentTarget as HTMLElement;
    el.style.background = "var(--white)";
    el.style.opacity = "1";
    const sourceKey = e.dataTransfer.getData("text/plain") || dragKey;
    if (!sourceKey) return;

    updateHtmlJson((prevTree: any) => {
      if (!prevTree) return prevTree;

      const { tree: withoutSource, removed } = removeNodeByKey(
        prevTree,
        sourceKey,
      );
      if (!removed) return prevTree;

      // дроп на baza → кладём в корень
      if (!targetNode || el.classList.contains("baza")) {
        const asArray = Array.isArray(withoutSource)
          ? withoutSource
          : [withoutSource];
        return [...asArray, removed];
      }

      // обычный дроп в узел с ключом
      if (!targetNode._key) return prevTree;

      return addNodeToTargetByKey(withoutSource, targetNode._key, removed);
    });

    setDragKey(null);
  };

  // --------------------
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
      el.style.background = "var(--teal-navi)";
      el.style.opacity = "1";
    };
    // -----------
    const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      el.style.background = "var(--white)";
      el.style.opacity = "1";
    };

    // ------------
    const handleClick = (e: React.MouseEvent<HTMLElement>, node: any) => {
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        setClickTimeout(null);
        handleDoubleClick(e, node);
      } else {
        const timeout = setTimeout(() => {
          setActiveKey((prev) => (prev === node._key ? null : node._key));
          setOpenInfoModal(true);
          setClickTimeout(null);
        }, 250);
        setClickTimeout(timeout);
      }
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLElement>, node) => {
      e.stopPropagation();
      if (!node._key) return;
      const sourceKey = node._key;
      if (!sourceKey) return;

      updateHtmlJson((prevTree: any) => {
        if (!prevTree) return prevTree;
        const { tree: withoutSource, removed } = removeNodeByKey(
          prevTree,
          sourceKey,
        );
        if (!withoutSource) return withoutSource;
        return withoutSource;
      });
    };
    // --------------------

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
        className={`renderedNode  ${node.class} `}
        style={{
          ...(typeof node.style === "string" ? {} : node.style),
          ...(activeKey === node._key ? { background: "var(--teal)" } : {}),
        }}
        onClick={(e) => handleClick(e, node)}
        draggable={true}
      >
        {/*{node._key}*/}
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
            <ClearIcon width={10} height={10} />
          </button>
          <button
            className="btn-teal   disabled:opacity-50"
            type="button"
            onClick={undo}
            disabled={undoStack.length === 0}
          >
            <СhevronLeft width={10} height={10} />
          </button>
          <button
            className="btn-teal    disabled:opacity-50 "
            type="button"
            onClick={redo}
            disabled={redoStack.length === 0}
          >
            <СhevronRight width={10} height={10} />
          </button>
          <button
            className="btn-teal  flex items-center  !gap-2 "
            type="button"
            onClick={() => handleClean()}
          >
            <ClearIcon width={10} height={10} />
            <p className="!text-[12px] !lh-0">servises texts</p>
          </button>
        </div>
      )}
      <div
        id="plaza-render-area"
        className="flex flex-col gap-2 mb-2 relative text-[#000] rounded overflow-hidden"
      >
        <div
          className="baza"
          draggable={true}
          onDrop={(e) => handleDrop(e, null)}
          onDragOver={(e) => e.preventDefault()}
        >
          {renderContent}
        </div>
      </div>
      <NodeInfo
        openInfoModal={openInfoModal}
        setOpenInfoModal={setOpenInfoModal}
      />
    </div>
  );
}
