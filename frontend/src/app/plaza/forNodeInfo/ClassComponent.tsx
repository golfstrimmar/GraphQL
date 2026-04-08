"use client";
import React, { useRef, useEffect, useState } from "react";
import Spinner from "@/components/icons/Spinner";
import type { HtmlNode } from "@/types/HtmlNode";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";

const MobileAddClass = dynamic(
  () => import("../forClassComponent/MobileAddClass"),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);

interface ClassComponentProps {
  node: HtmlNode;
  itemClass: string;
  updateNodeByKey: (key: string, changes: Partial<HtmlNode>) => void;
}

//🔹🟢🔹🟢🔹🟢🔹🟢
const ClassComponent: React.FC<ClassComponentProps> = ({
  node,
  itemClass,
  updateNodeByKey,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isTransformed, setIsTransformed] = useState<boolean>(false);
  const [openMobile, setOpenMobile] = useState<boolean>(false);
  const [activeClassKey, setActiveClassKey] = useState<string>('');
  // ================================
  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const formatClassForDisplay = (raw: string): string => {
    if (!raw) return "";
    // Если есть переносы или SCSS-конструкции ({}, &), лучше не форматировать наивно
    if (raw.includes("\n") || raw.includes("{") || raw.includes("&")) return raw;

    const trimmed = raw.trim();
    if (!trimmed) return "";

    const hasTrailingSemicolon = trimmed.endsWith(";");
    const clean = hasTrailingSemicolon ? trimmed.slice(0, -1) : trimmed;

    const properties = clean
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((prop) => {
        const colonIndex = prop.indexOf(":");
        if (colonIndex === -1) return prop;
        const key = prop.slice(0, colonIndex).trim();
        const value = prop.slice(colonIndex + 1).trim();
        return `${key}: ${value}`;
      });

    // Используем реальный \n — React и textarea его правильно отобразят
    return properties.join(";\n") + (hasTrailingSemicolon ? ";" : "");
  };
  // ================================

  const [classText, setClassText] = useState(
    node?.class ? formatClassForDisplay(node.class) : "",
  );

  useEffect(() => {
    setClassText(node?.class ? formatClassForDisplay(node.class) : "");
  }, [node?._key, node?.class]);

  // дебаунс обновления project
  useEffect(() => {
    if (!node?._key) return;

    const id = setTimeout(() => {
      if (node._key) {
        updateNodeByKey(node._key!, {
          class: classText,
        });
      }
    }, 1000);

    return () => clearTimeout(id);
  }, [classText, node?._key]);

  // ================================
  //  Parent Class
  // утилита: рекурсивно пробегаем по дереву и обновляем классы
  function addParentToChildrenClasses(
    node: HtmlNode,
    parentClass: string,
  ): HtmlNode {
    const prefix = "__";

    const transformClass = (cls: string): string => {
      if (!cls) return cls;
      const parts = cls.split(/\s+/).filter(Boolean);
      const transformed = parts.map((part) => {
        if (part.startsWith(prefix)) {
          const childPart = part.slice(prefix.length);
          if (childPart.startsWith(parentClass + "__")) return part;
          return `${parentClass}__${childPart}`;
        }
        return part;
      });
      return transformed.join(" ");
    };

    const newNode: HtmlNode = {
      ...node,
      class: transformClass(node.class || ""),
    };

    if (Array.isArray(node.children)) {
      newNode.children = node.children.map((child) => {
        if (typeof child === "string") return child;
        return addParentToChildrenClasses(child, parentClass);
      });
    }

    return newNode;
  }

  const handleParentClass = () => {
    if (node.tag !== "section") return;

    const sectionClass = node.class?.trim();
    if (!sectionClass || !node._key) return;

    // можно взять первый класс как "класс секции"
    const parentClass = sectionClass.split(/\s+/)[0];

    // строим новый node с обновлёнными children
    const updatedNode = addParentToChildrenClasses(node, parentClass);

    // обновляем ноду целиком по ключу
    updateNodeByKey(node._key, {
      children: updatedNode.children,
    });
  };

  // ================================
  return (
    <>
      <MobileAddClass
        activeClassKey={activeClassKey}

        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
      />
      <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]   flex flex-col relative   ">
        <p className={itemClass}>
          <span>Class:</span>
          {node?.tag === "section" && (
            <button
              className="btn-teal text-[12px] !max-h-[20px]"
              onClick={() => {
                handleParentClass();
                setIsTransformed(true);
                setTimeout(() => setIsTransformed(false), 500);
              }}
            >
              {isTransformed ? <Spinner /> : <span>Add parent class</span>}
            </button>
          )}
          <button
            className="btn-teal text-[12px] !max-h-[20px] ml-1"
            onClick={() => { setActiveClassKey(node._key || ''); setOpenMobile(!openMobile) }}
          >
            Add
          </button>
        </p>
        <textarea
          ref={(el) => {
            if (!el) return;
            textareaRef.current = el;
            adjustHeight(el);
          }}
          value={classText}
          onChange={(e) => {
            setClassText(e.target.value);
            adjustHeight(e.target);
          }}
          className="textarea-styles "
        />
      </div>
    </>
  );
};

export default ClassComponent;

