"use client";
import React, { useState } from "react";
import PageHeader from "./PlazaComponent/PageHeader";
import { useStateContext } from "@/providers/StateProvider";
import Loading from "@/components/ui/Loading/Loading";
import voidTags from "./voidTags";
import dynamic from "next/dynamic";
import addNodeToTargetByKey from "./addNodeToTargetByKey";
import removeNodeByKey from "./removeNodeByKey";
import validateHtmlStructure from "./validateHtmlStructure";
import duplicateNodeAfter from "./duplicateNodeAfter";
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
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  const {
    htmlJson,
    updateHtmlJson,
    activeKey,
    setActiveKey,
    dragKey,
    setDragKey,
  } = useStateContext();

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
    document.querySelectorAll(".renderedNode").forEach((el) => {
      (el as HTMLElement).style.opacity = "1";
      (el as HTMLElement).style.transition = "";
    });
    updateHtmlJson((prevTree: any) => {
      if (!prevTree) return prevTree;

      const { tree: withoutSource, removed } = removeNodeByKey(
        prevTree,
        sourceKey,
      );
      if (!removed) return prevTree;
      // 🔹 Если дропнули на самого себя → дублируем
      if (targetNode && targetNode._key === sourceKey) {
        return duplicateNodeAfter(prevTree, sourceKey);
      }
      // дроп на baza → кладём в корень
      if (!targetNode || el.classList.contains("baza")) {
        const asArray = Array.isArray(withoutSource)
          ? withoutSource
          : [withoutSource];
        return [...asArray, removed];
      }

      // обычный дроп в узел с ключом
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
      if (node._key === dragKey) return;
      const el = e.currentTarget as HTMLElement;
      el.style.background = "var(--teal-navi)";
      el.style.opacity = "1";
    };
    // -----------
    const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (node._key === dragKey) return;
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
      setActiveKey(null);
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
    // --------------------
    const getNodeStyle = (node: NodeToSend, activeKey: string) => {
      // 1️⃣ Парсим оригинальный стиль
      const parsedStyle = parseInlineStyle(node.style);

      // 2️⃣ Базовые layout стили
      const baseLayout = Object.fromEntries(
        Object.entries(parsedStyle).filter(([key]) =>
          /^(display|flex|grid|justify|align)/i.test(key),
        ),
      );

      // 3️⃣ Активный стиль
      const activeStyle =
        activeKey === node._key ? { background: "var(--teal)" } : {};

      // 4️⃣ ✅ Объединяем ВСЕ
      return {
        ...baseLayout, // Layout
        ...(typeof node.style === "string" ? {} : node.style), // Inline
        ...activeStyle, // Активный сверху!
      };
    };

    // --------------------
    if (isVoid) {
      return (
        <Tag
          key={node._key ?? crypto.randomUUID()}
          {...(node.attributes || {})}
          onClick={(e) => handleClick(e, node)}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDrop={(e) => handleDrop(e, node)}
          className={`renderedNode  ${node.class} `}
          style={{
            ...parseInlineStyle(node.style),
            pointerEvents: "auto",
            cursor: "pointer",
          }}
        />
      );
    }

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
        style={getNodeStyle(node, activeKey)}
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

  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 relative mt-[25px] ">
      {PageHeader("canvasIcon", "Canvas")}

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
