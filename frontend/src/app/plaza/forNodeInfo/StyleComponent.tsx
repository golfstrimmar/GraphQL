"use client";
import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
import cleanConstructorScss from "../forStyleComponent/cleanConstructorScss";

const MobileAddStyle = dynamic(
  () => import("../forStyleComponent/MobileAddStyle"),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);
type NodeToSend = {
  _key: string;
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  children: NodeToSend[] | string;
};

interface StyleComponentProps {
  node: NodeToSend;
  itemClass: string;
  updateNodeByKey: (key: string, changes: Partial<NodeToSend>) => void;
}

// ================================
// ================================
// ================================
const StyleComponent: React.FC<StyleComponentProps> = ({
  node,
  itemClass,
  updateNodeByKey,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [openMobile, setOpenMobile] = useState(false);

  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // ====>====>====>====>====>====>====>====>====>====>
  const formatStyleForDisplay = (raw: string): string => {
    console.log("<===raw===>", raw);

    // Если уже есть переносы — пользователь редактировал вручную
    if (raw.includes("\n")) return raw;

    const trimmed = raw?.trim();
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

  // ====>====>====>====>====>====>====>====>====>====>
  const [styleText, setStyleText] = useState(
    node?.style ? formatStyleForDisplay(node.style) : "",
  );

  // синк при смене node / внешнего style
  useEffect(() => {
    setStyleText(node?.style ? formatStyleForDisplay(node?.style) : "");
  }, [node?._key, node?.style]);

  useEffect(() => {
    if (!node?._key) return;
    console.log("<===styleText===>", styleText);
    const id = setTimeout(() => {
      updateNodeByKey(node._key, { style: styleText });
    }, 1000);
    return () => clearTimeout(id);
  }, [styleText]);

  useEffect(() => {
    console.log("StyleComponent node.style =", JSON.stringify(node?.style));
  }, [node?.style]);

  // ====>====>====>====>====>====>====>====>====>====>
  return (
    <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]   flex flex-col relative ">
      {openMobile && (
        <MobileAddStyle
          setStyleText={setStyleText}
          openMobile={openMobile}
          setOpenMobile={setOpenMobile}
          nodeStyle={JSON.stringify(node?.style)}
        />
      )}
      <p className={itemClass}>
        <span>Style:</span>
        <button
          className="btn-teal text-[12px] !max-h-[20px]"
          onClick={() =>
            setOpenMobile(() => {
              return !openMobile;
            })
          }
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
        value={cleanConstructorScss(styleText)}
        // value={styleText}
        onChange={(e) => {
          setStyleText(e.target.value);
          adjustHeight(e.target);
        }}
        onInput={(e) => adjustHeight(e.target as HTMLTextAreaElement)}
        className="textarea-styles"
        placeholder=""
      />
    </div>
  );
};

export default StyleComponent;
