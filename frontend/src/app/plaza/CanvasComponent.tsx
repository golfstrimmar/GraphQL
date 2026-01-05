"use client";
import React, { useState } from "react";
import PageHeader from "./PageHeader";
import { useStateContext } from "@/providers/StateProvider";
import Loading from "@/components/ui/Loading/Loading";
import voidTags from "./utils/voidTags";
import dynamic from "next/dynamic";
import addNodeToTargetByKey from "./utils/addNodeToTargetByKey";
import removeNodeByKey from "./utils/removeNodeByKey";
import validateHtmlStructure from "./utils/validateHtmlStructure";
import applyDropByOverlay from "./utils/applyDropByOverlay";
import duplicateNodeAfter from "./utils/duplicateNodeAfter";

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

type OverlayMode = "before" | "after" | "inside";

type OverlayState = {
  visible: boolean;
  mode: OverlayMode;
  top: number;
  left: number;
  width: number;
  parentKey: string | "__ROOT__";
  siblingKey: string | null; // для inside можно хранить сам node._key
};
export default function CanvasComponent() {
  const [openInfoModal, setOpenInfoModal] = useState<boolean>(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);

  const {
    htmlJson,
    updateHtmlJson,
    activeKey,
    setActiveKey,
    dragKey,
    setDragKey,
  } = useStateContext();

  // ---------- утилиты ----------

  const parseInlineStyle = (styleString: string): React.CSSProperties => {
    if (!styleString) return {};
    const finalStyle = styleString + ";cursor: pointer;";
    return finalStyle.split(";").reduce((acc, rule) => {
      const [prop, value] = rule.split(":").map((s) => s.trim());
      if (prop && value) {
        const jsProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        (acc as any)[jsProp] = value;
      }
      return acc;
    }, {} as React.CSSProperties);
  };

  const getNodeStyle = (node: HtmlNode, activeKeyValue: string) => {
    const parsedStyle = parseInlineStyle(node.style);
    const baseLayout = Object.fromEntries(
      Object.entries(parsedStyle).filter(([key]) =>
        /^(display|flex|grid|justify|align)/i.test(key),
      ),
    );
    const activeStyle =
      activeKeyValue === node._key ? { background: "var(--teal)" } : {};
    return {
      ...baseLayout,
      ...(typeof node.style === "string" ? {} : node.style),
      ...activeStyle,
    };
  };

  // поиск родителя по _key
  const findParentKey = (
    tree: Tree,
    childKey: string,
    parentKey: string | "__ROOT__" = "__ROOT__",
  ): string | "__ROOT__" => {
    if (!tree) return "__ROOT__";

    if (Array.isArray(tree)) {
      for (const n of tree) {
        const res = findParentKey(n, childKey, "__ROOT__");
        if (res) return res;
      }
      return "__ROOT__";
    }

    const node = tree;
    if (node._key === childKey) return parentKey;

    if (Array.isArray(node.children)) {
      for (const ch of node.children) {
        const res = findParentKey(ch, childKey, node._key || parentKey);
        if (res) return res;
      }
    }

    return "__ROOT__";
  };

  // ---------- drag start / click ----------

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
    e.dataTransfer.setData("text/plain", node._key);
    setDragKey(node._key);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>, node: any) => {
    e.stopPropagation();
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

  const handleDoubleClick = (e: React.MouseEvent<HTMLElement>, node: any) => {
    e.stopPropagation();
    if (!node._key) return;
    const sourceKey = node._key;
    setActiveKey(null);
    updateHtmlJson((prevTree: any) => {
      if (!prevTree) return prevTree;
      const { tree: withoutSource } = removeNodeByKey(prevTree, sourceKey);
      return withoutSource || prevTree;
    });
  };

  // ---------- overlay-плейсхолдеры (before/after) ----------

  const handleDragOver = (
    e: React.DragEvent<HTMLElement>,
    node: HtmlNode,
    parentKey: string | "__ROOT__",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!node || !node._key) return;
    if (node._key === dragKey) return;

    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const containerRect = document
      .getElementById("plaza-render-area")
      ?.getBoundingClientRect();
    if (!containerRect) return;

    const relTop = rect.top - containerRect.top;
    const relLeft = rect.left - containerRect.left;
    const mouseY = e.clientY;
    const h = rect.height;

    const topZone = rect.top + h * 0.25;
    const bottomZone = rect.top + h * 0.75;

    let mode: OverlayMode;
    if (mouseY < topZone) mode = "before";
    else if (mouseY > bottomZone) mode = "after";
    else mode = "inside";

    setOverlay({
      visible: true,
      mode,
      top:
        mode === "before" ? relTop : mode === "after" ? relTop + h - 4 : relTop, // inside — можно использовать top элемента
      left: relLeft,
      width: rect.width,
      parentKey,
      siblingKey: node._key,
    });
  };

  // ---------- DragLeave ----------
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // можно ничего не делать, чтобы линия не мигала между элементами
    // при необходимости можно добавить setOverlay(null) при выходе из зоны
  };

  // ---------- drop с использованием overlay ----------

  const handleDrop = (
    e: React.DragEvent<HTMLElement>,
    targetNode: HtmlNode | null,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveKey(null);

    const el = e.currentTarget as HTMLElement;
    if (el.classList.contains("renderedNode")) {
      el.style.background = "var(--white)";
      el.style.opacity = "1";
    }

    const sourceKey = e.dataTransfer.getData("text/plain") || dragKey;

    // ничего не перетащили → просто убираем overlay
    if (!sourceKey) {
      setOverlay(null);
      return;
    }

    // 🔹 1. Есть overlay — используем его
    if (overlay && overlay.visible && overlay.siblingKey) {
      updateHtmlJson((prevTree: any) => {
        if (!prevTree) return prevTree;
        const res = applyDropByOverlay(sourceKey, overlay, prevTree);
        return res;
      });

      setDragKey(null);
      setOverlay(null); // ← важный сброс
      return;
    }

    // 🔹 2. Fallback: drop на таргет/базу
    updateHtmlJson((prevTree: any) => {
      if (!prevTree) return prevTree;

      const { tree: withoutSource, removed } = removeNodeByKey(
        prevTree,
        sourceKey,
      );
      if (!removed) return prevTree;

      if (targetNode && targetNode._key === sourceKey) {
        return duplicateNodeAfter(prevTree, sourceKey);
      }

      if (!targetNode || el.classList.contains("baza")) {
        const asArray = Array.isArray(withoutSource)
          ? withoutSource
          : [withoutSource];
        return [...asArray, removed];
      }

      if (!targetNode._key) return prevTree;
      const res = addNodeToTargetByKey(withoutSource, targetNode._key, removed);
      if (!validateHtmlStructure(res)) {
        console.warn("Invalid HTML structure! Drop cancelled.");
        el.classList.add("tag-scale-pulse");
        setTimeout(() => {
          el.classList.remove("tag-scale-pulse");
        }, 1000);
        return prevTree;
      }

      return res;
    });

    setDragKey(null);
    setOverlay(null); // ← и здесь тоже
  };

  // ---------- renderNode с overlay-логикой ----------

  const renderNode = (
    node: any,
    parentKey: string | "__ROOT__" = "__ROOT__",
  ) => {
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
          onClick={(e) => handleClick(e, node)}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node, parentKey)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
          onDragEnd={() => {
            setOverlay(null);
            setDragKey(null);
            document.querySelectorAll(".renderedNode").forEach((el) => {
              (el as HTMLElement).style.opacity = "1";
              (el as HTMLElement).style.transition = "";
            });
          }}
          className={`renderedNode ${node.class}`}
          style={{
            ...parseInlineStyle(node.style),
            pointerEvents: "auto",
            cursor: "pointer",
          }}
          draggable={true}
          data-key={node._key}
        />
      );
    }

    const children = Array.isArray(node.children)
      ? node.children.map((child: any) =>
          renderNode(child, node._key || parentKey),
        )
      : null;

    return (
      <Tag
        data-key={node._key}
        onDragStart={(e) => handleDragStart(e, node)}
        onDragOver={(e) => handleDragOver(e, node, parentKey)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, node)}
        onDragEnd={() => {
          setOverlay(null);
          setDragKey(null);
          document.querySelectorAll(".renderedNode").forEach((el) => {
            (el as HTMLElement).style.opacity = "1";
            (el as HTMLElement).style.transition = "";
          });
        }}
        key={`${node._key ?? crypto.randomUUID()}-${node.text ?? ""}`}
        id={node.attributes?.id}
        htmlFor={node.attributes?.for}
        href={node.attributes?.href}
        rel={node.attributes?.rel}
        className={`renderedNode ${node.class}`}
        style={getNodeStyle(node, activeKey)}
        onClick={(e) => handleClick(e, node)}
        draggable={true}
      >
        {node.class === "baza" ? "" : node.text}
        {children}
      </Tag>
    );
  };

  // ---------- корневой уровень ----------

  const renderContent = Array.isArray(htmlJson)
    ? htmlJson.map((n: any, i: number) => renderNode(n, "__ROOT__"))
    : renderNode(htmlJson, "__ROOT__");

  // ---------- JSX ----------

  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 relative mt-[25px] ">
      {PageHeader("canvasIcon", "Canvas")}

      <div
        id="plaza-render-area"
        className="flex flex-col gap-2 mb-2 relative text-[#000] rounded overflow-hidden"
      >
        {overlay?.visible && overlay.mode !== "inside" && (
          <div
            className="overlay-drop"
            style={{
              position: "absolute",
              top: overlay.top,
              left: overlay.left,
              width: overlay.width,
              height: 4, // или 6 — выбери один вариант
              background:
                "repeating-linear-gradient(45deg, black, black 4px, yellow 4px, yellow 8px)",
              pointerEvents: "none",
              zIndex: 1000,
            }}
          />
        )}
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
