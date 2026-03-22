"use client";
import React, { useState, useEffect } from "react";
import PageHeader from "./PageHeader";
import { useStateContext } from "@/providers/StateProvider";
import Loading from "@/components/ui/Loading/Loading";
import voidTags from "./helpers/voidTags";
import dynamic from "next/dynamic";
import addNodeToTargetByKey from "./utils/addNodeToTargetByKey";
import removeNodeByKey, { RemovedMeta } from "./utils/removeNodeByKey";
import validateHtmlStructure from "./utils/validateHtmlStructure";
import parseInlineStyle from "./utils/parseInlineStyle";
import applyDropByOverlay, {
  OverlayState as OverlayStateLocal,
} from "./utils/applyDropByOverlay";
import duplicateNodeAfter from "./utils/duplicateNodeAfter";
import cleanupStylesAfterRemove from "./utils/cleanupStylesAfterRemove";
import cleanupScriptsAfterRemove from "./utils/cleanupScriptsAfterRemove";
import { OverlayState, HtmlNode } from "@/types/HtmlNode";
import { useRef } from "react";

const NodeInfo = dynamic(() => import("./NodeInfo"), {
  ssr: false,
  loading: () => <Loading />,
});

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

  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  const stopAutoScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  // === AUTO SCROLL LOGIC ===
  const updateAutoScroll = (mouseY: number) => {
    const topThreshold = 150;
    const bottomThreshold = 250;
    const maxSpeed = 15;
    const { innerHeight } = window;

    if (mouseY < topThreshold) {
      const speed = Math.max(2, (1 - mouseY / topThreshold) * maxSpeed);
      startAutoScroll("up", speed);
    } else if (mouseY > innerHeight - bottomThreshold) {
      const distFromBottom = innerHeight - mouseY;
      const speed = Math.max(2, (1 - distFromBottom / bottomThreshold) * maxSpeed);
      startAutoScroll("down", speed);
    } else {
      stopAutoScroll();
    }
  };

  const startAutoScroll = (direction: "up" | "down", speed: number) => {
    stopAutoScroll();
    scrollInterval.current = setInterval(() => {
      window.scrollBy(0, direction === "up" ? -speed : speed);
    }, 16); // ~60fps
  };

  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      if (dragKey) {
        updateAutoScroll(e.clientY);
      }
    };

    if (dragKey) {
      window.addEventListener("dragover", handleGlobalDragOver);
    } else {
      stopAutoScroll();
    }

    return () => {
      window.removeEventListener("dragover", handleGlobalDragOver);
    };
  }, [dragKey]);
  // ====>====>====>====>====>====>====>====>====>====>
  const getNodeStyle = (node: HtmlNode, activeKeyValue: string | null) => {
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
  // ====>====>====>====>====>====>====>====>====>====>
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
  // ====>====>====>====>====>====>====>====>====>====>
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

    const topZone = rect.top + h * 0.15;
    const bottomZone = rect.top + h * 0.85;

    type OverlayMode = "before" | "after" | "inside";
    let mode: OverlayMode;
    if (mouseY < topZone) mode = "before";
    else if (mouseY > bottomZone) mode = "after";
    else mode = "inside";

    setOverlay({
      visible: true,
      mode,
      top:
        mode === "before" ? relTop : mode === "after" ? relTop + h - 4 : relTop,
      left: relLeft,
      width: rect.width,
      parentKey,
      siblingKey: node._key,
    } as OverlayState);

  };
  // ====>====>====>====>====>====>====>====>====>====>
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // ====>====>====>====>====>====>====>====>====>====>
  // Применяет обе очистки последовательно
  const cleanupAfterRemove = (
    meta: RemovedMeta,
    nextHtml: HtmlNode[],
  ): HtmlNode[] => {
    const afterStyles = cleanupStylesAfterRemove(meta, nextHtml, !!dragKey);
    return cleanupScriptsAfterRemove(meta, afterStyles, !!dragKey);
  };

  // ====>====>====>====>====>====>====>====>====>====>
  const handleDrop = (
    e: React.DragEvent<HTMLElement>,
    targetNode: HtmlNode | null,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveKey(null);
    stopAutoScroll();

    const el = e.currentTarget as HTMLElement;
    if (el.classList.contains("renderedNode")) {
      el.style.background = "var(--white)";
      el.style.opacity = "1";
    }

    const sourceKey = e.dataTransfer.getData("text/plain") || dragKey;

    if (!sourceKey) {
      setOverlay(null);
      return;
    }

    // 🔹 1. overlay-режим
    if (overlay && overlay.visible && overlay.siblingKey) {
      updateHtmlJson((prevTree: HtmlNode[]) => {
        const { tree: newTree, meta } = applyDropByOverlay(
          sourceKey,
          overlay as OverlayStateLocal,
          prevTree,
        );
        const normalized = Array.isArray(newTree) ? newTree : [newTree];
        const cleaned = cleanupAfterRemove(meta, normalized);
        return cleaned;
      });

      setDragKey(null);
      setOverlay(null);
      return;
    }

    // 🔹 2. Fallback: drop без overlay (в т.ч. на корень / .baza)
    updateHtmlJson((prevTree: HtmlNode[]) => {
      if (!prevTree) return prevTree;

      const currentRoot: HtmlNode[] = Array.isArray(prevTree)
        ? prevTree
        : [prevTree];

      // 🔸 0. Дроп на самого себя → вообще не удаляем, просто дублируем
      if (targetNode && targetNode._key === sourceKey) {
        const next = duplicateNodeAfter(currentRoot, sourceKey as string);
        // здесь НЕ вызываем cleanupStylesAfterRemove, потому что ничего не удаляли
        return next;
      }

      // дальше — обычный перенос: сначала remove, потом вставка

      const { tree: withoutSource, meta } = removeNodeByKey(
        currentRoot,
        sourceKey as string,
      );

      const removed = meta.removed;
      if (!removed) return currentRoot;

      const withoutSourceArray: HtmlNode[] = Array.isArray(withoutSource)
        ? withoutSource
        : withoutSource
          ? [withoutSource]
          : [];

      // дроп на корень / .baza
      if (!targetNode || el.classList.contains("baza")) {
        const next = [...withoutSourceArray, removed];
        const cleaned = cleanupAfterRemove(meta, next);
        return cleaned;
      }

      if (!targetNode._key) return currentRoot;

      const res = addNodeToTargetByKey(
        withoutSourceArray,
        targetNode._key,
        removed,
      );

      if (!validateHtmlStructure(res)) {
        console.warn("Invalid HTML structure! Drop cancelled.");
        el.classList.add("tag-scale-pulse");
        setTimeout(() => {
          el.classList.remove("tag-scale-pulse");
        }, 1000);
        return currentRoot;
      }

      const cleaned = cleanupAfterRemove(meta, res);
      return cleaned;
    });

    setDragKey(null);
    setOverlay(null);
  };
  // ====>====>====>====>====>====>====>====>====>====>
  const handleClick = (e: React.MouseEvent<HTMLElement>, node: any) => {
    e.stopPropagation();

    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      handleDoubleClick(e, node);
    } else {
      const timeout = setTimeout(() => {
        setActiveKey(node._key ?? null);
        setOpenInfoModal(true);
        setClickTimeout(null);
      }, 250);
      setClickTimeout(timeout);
    }
  };

  // ====>====>====>====>====>====>====>====>====>====>
  const handleDoubleClick = (e: React.MouseEvent<HTMLElement>, node: any) => {
    e.stopPropagation();
    if (!node._key) return;
    const sourceKey = node._key;
    setActiveKey(null);

    updateHtmlJson((prevTree: HtmlNode[]) => {
      if (!prevTree) return prevTree;

      const currentRoot: HtmlNode[] = Array.isArray(prevTree)
        ? prevTree
        : [prevTree];

      const { tree: withoutSource, meta } = removeNodeByKey(
        currentRoot,
        sourceKey,
      );

      const withoutSourceArray: HtmlNode[] = Array.isArray(withoutSource)
        ? withoutSource
        : withoutSource
          ? [withoutSource]
          : [];

      const cleaned = cleanupAfterRemove(meta, withoutSourceArray);
      return cleaned;
    });
  };

  // ====>====>====>====>====>====>====>====>====>====>
  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>, node: any) => {
    e.stopPropagation();
    console.log("<===node===>", node);
    if (!node._key) return;
    const btn = e.currentTarget as HTMLButtonElement;
    const parentEl = btn.parentElement as HTMLElement;
    if (!parentEl) return;
    const isHidden = parentEl.classList.contains("_hidden");
    if (isHidden) {
      btn.innerHTML = "↕";
      parentEl.classList.remove("_hidden");
    } else {
      btn.innerHTML = parentEl.tagName + "." + node.class;
      parentEl.classList.add("_hidden");
    }
  };
  // ====>====>====>====>====>====>====>====>====>====>
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
          onClick={(e) => {
            handleClick(e, node);
          }}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node, parentKey)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
          onDragEnd={() => {
            setOverlay(null);
            setDragKey(null);
            stopAutoScroll();
            document.querySelectorAll(".renderedNode").forEach((el) => {
              (el as HTMLElement).style.opacity = "1";
              (el as HTMLElement).style.transition = "";
            });
          }}
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`renderedNode `}
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
        onDragStart={(e: React.DragEvent<HTMLElement>) => handleDragStart(e, node)}
        onDragOver={(e: React.DragEvent<HTMLElement>) =>
          handleDragOver(e, node, parentKey)
        }
        onDragLeave={handleDragLeave}
        onDrop={(e: React.DragEvent<HTMLElement>) => handleDrop(e, node)}
        onDragEnd={() => {
          setOverlay(null);
          setDragKey(null);
          stopAutoScroll();
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
        className={`renderedNode`}
        style={getNodeStyle(node, activeKey)}
        onClick={(e: React.MouseEvent<HTMLElement>) => handleClick(e, node)}
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        draggable={true}
      >
        {node.class === "baza" ? "" : node.text}
       {children && children.length > 0 && (
         <button
           onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleToggle(e, node)}
           className="togle-button "
         >
           {node.class === "baza" ? "" : node.tag ? "↕" : ""}
         </button>
       )}        {children}
      </Tag>
    );
  };

  const renderContent = Array.isArray(htmlJson)
    ? htmlJson.map((n: any) => renderNode(n, "__ROOT__"))
    : renderNode(htmlJson, "__ROOT__");
  // ====>====>====>====>====>====>====>====>====>====>
  // ====>====>====>====>====>====>====>====>====>====>
  // ====>====>====>====>====>====>====>====>====>====>
  return (
    <div
      id="canvas-section"
      className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 relative mt-[25px] "
    >
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
              height: 4,
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
          onDragOver={(e: React.DragEvent<HTMLElement>) => {
            e.preventDefault();
          }}
        >
          {renderContent}
        </div>
      </div>

      <NodeInfo
        openInfoModal={openInfoModal}
        setOpenInfoModal={setOpenInfoModal}
        setActiveKey={setActiveKey}
      />
    </div>
  );
}
