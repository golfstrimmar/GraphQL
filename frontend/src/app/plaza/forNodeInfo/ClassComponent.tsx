"use client";
import React, { useRef, useEffect, useState } from "react";
import Spinner from "@/components/icons/Spinner";
import type { HtmlNode } from "@/types/HtmlNode";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
import { useAddClass } from "@/app/plaza/forClassComponent/addClass";
import { useJsonToHtml } from "@/hooks/useJsonToHtml";
const MobileAddClass = dynamic(
  () => import("../forClassComponent/MobileAddClass"),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);

interface ClassComponentProps {
  node: HtmlNode;
  updateNodeByKey: (key: string, changes: Partial<HtmlNode>) => void;
  modClass: string;
  setModClass: (modClass: string) => void;
}

//🔹🟢🔹🟢🔹🟢🔹🟢
const ClassComponent: React.FC<ClassComponentProps> = ({
  node,
  updateNodeByKey, modClass, setModClass
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isTransformed, setIsTransformed] = useState<boolean>(false);
  const [openMobile, setOpenMobile] = useState<boolean>(false);
  const [activeClassKey, setActiveClassKey] = useState<string>('');
  const { loading, runJsonToHtml } = useJsonToHtml();
  const { addClass } = useAddClass();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  // ================================
  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const formatClassForDisplay = (raw: string): string => {

    if (!raw) return "";
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
  const isNormal = !node?.class?.includes("filled") && !node?.class?.includes("empty");
  const isFilled = node?.class?.includes("filled");
  const isEmpty = node?.class?.includes("empty");
  const states = [
    { key: "_normal", label: "Normal", isDefault: true, hidden: isNormal },
    { key: "_filled", label: "Filled", isDefault: false, hidden: isFilled },
    { key: "_empty", label: "Empty", isDefault: false, hidden: isEmpty },
  ];
  // ================================
  const addMod = () => {
    if (!node?._key) return;
    if (!modClass) return;
    const className = `${node.class} ${node.class}--${modClass}`;
    updateNodeByKey(node._key, {
      class: className,
    });
    setModClass("");
  }
  // ================================
  return (
    <>
      <MobileAddClass
        activeClassKey={activeClassKey}
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
      />
      <div className="unitStyle">
        <div className="itemClass">
          <h6 className="my-1">Class:</h6>
          {/* <div className="flex items-center gap-1"> */}
          {/* <span className="text-[12px] text-[var(--black)] ">Add Modifier:</span>

            <input className="input-field-mod" type="text" value={modClass} onChange={(e) => setModClass(e.target.value)} /> <button
              className="btn btn-empty text-[12px] text-[var(--black)]  px-1 !max-h-[20px]"
              onClick={() => {
                addMod()
              }}
            >
              Mod
            </button> */}
          {/* </div> */}
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
          {node?.tag === "fieldset" && (
            <div className="flex items-center gap-1 mt-2">
              {states
                .filter((s) => !s.hidden)
                .map((s) => (
                  <button
                    key={s.key}
                    className="btn btn-empty text-[12px] text-[var(--black)]  px-1 !max-h-[20px]"
                    onClick={async () => {
                      const key = s.key ?? "normal";
                      setLoadingKey(key);
                      try {
                        const nextTree = await (s.isDefault
                          ? addClass(null, node._key || "")
                          : addClass(s.key, node._key || ""));

                      } finally {
                        setLoadingKey(null);
                      }
                    }}


                  >
                    {loadingKey === s.key ? <Spinner /> : s.label}
                  </button>
                ))}
            </div>
          )}
        </div>
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

