"use client";
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { useStateContext } from "@/providers/StateProvider";
import type { HtmlNode } from "@/types/HtmlNode";
import Editor, { useMonaco } from "@monaco-editor/react";
import cleanConstructorScss from "../forStyleComponent/cleanConstructorScss";
// import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
// import { UPDATE_PROJECT, REMOVE_PROJECT } from "@/apollo/mutations";
// import { GET_ALL_PROJECTS_BY_USER, FIND_PROJECT } from "@/apollo/queries";
import Loading from "@/components/ui/Loading/Loading";
import dynamic from "next/dynamic";
import Monaco from "../Monaco";

const MobileAddStyle = dynamic(
  () => import("../forStyleComponent/MobileAddStyle"),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);

interface StyleComponentProps {
  node: HtmlNode;
  modClass: string;
  modStyleText: string;
  setModStyleText: (modStyleText: string) => void;
}


// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
const ModStyleComponent: React.FC<StyleComponentProps> = ({ node, modClass, modStyleText, setModStyleText }) => {
  const [openMobile, setOpenMobile] = useState(false);
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const [currentStyle, setCurrentStyle] = useState<string>('');
  // ====>====>  Monaco Theme Logic (matching PreviewComponent)
  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("myCustomTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "a0a0a0", fontStyle: "italic" },
        { token: "string", foreground: "ce9178" },
        { token: "keyword", foreground: "569cd6" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editorLineNumber.foreground": "#858585",
      },
    });

    monaco.editor.setTheme("myCustomTheme");
  }, [monaco]);

  const handleEditorMount = (
    editor: any,
  ) => {
    if (monaco) monaco.editor.setTheme("myCustomTheme");
    editor.setScrollTop(0);
    editor.revealLine(1);
    editorRef.current = editor;

    // Auto-format on mount
    setTimeout(() => {
      const action = editor.getAction("editor.action.formatDocument");
      action?.run();
    }, 100);
  };

  // ====>====>====>====>====>====>====>====>====>====>
  // const formatStyleForDisplay = (raw: string): string => {
  //   if (!raw) return "";
  //   // Если есть переносы или SCSS-конструкции ({}, &), лучше не форматировать наивно, 
  //   // чтобы не сломать селекторы типа &:hover
  //   if (raw.includes("\n") || raw.includes("{") || raw.includes("&")) return raw;

  //   const trimmed = raw.trim();
  //   if (!trimmed) return "";

  //   const hasTrailingSemicolon = trimmed.endsWith(";");
  //   const clean = hasTrailingSemicolon ? trimmed.slice(0, -1) : trimmed;

  //   const properties = clean
  //     .split(";")
  //     .map((s) => s.trim())
  //     .filter((s) => s.length > 0)
  //     .map((prop) => {
  //       const colonIndex = prop.indexOf(":");
  //       if (colonIndex === -1) return prop;
  //       const key = prop.slice(0, colonIndex).trim();
  //       const value = prop.slice(colonIndex + 1).trim();
  //       return `${key}: ${value}`;
  //     });

  //   return properties.join(";\n") + (hasTrailingSemicolon ? ";" : "");
  // };

  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>

  useEffect(() => {
    if (!currentStyle) return;
    console.log("<=🔹🟢==modClass=🟢🔹==>", modClass);
    const id = setTimeout(() => {
      const modifierSelector = `&--${modClass}`;
      let resStyle = "";

      // if (rawStyle.includes(modifierSelector)) {
      //   // Если модификатор найден, дополняем его содержимое
      //   resStyle = rawStyle.replace(regex, (match, open, oldContent, close) => {
      //     // Проверяем, нужно ли добавить точку с запятой между старым и новым
      //     const needsSeparator = oldContent.trim() && !oldContent.trim().endsWith(';');
      //     return `${open}${oldContent}${needsSeparator ? ';' : ''} ${modStyles}${close}`;
      //   });
      // } else {
      // Если модификатора нет, создаем новый блок
      resStyle = `${modifierSelector} { ${currentStyle} }`;
      // }
      console.log("<=🔹🟢==resStyle=🟢🔹==>", resStyle);
      if (resStyle !== node.style) {
        setModStyleText(resStyle);
      }
    }, 1000);

    return () => clearTimeout(id);
  }, [currentStyle, modClass]);
  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
  return (
    <div className="unitStyle">
      {/* <MobileAddStyle
        setCurrentStyle={setCurrentStyle}
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
      // nodeStyle={JSON.stringify(node?.style)}
      /> */}
      <div className="flex  items-center gap-1 p-[5px]">
        <h6 className="my-1">ModStyle:</h6>
        {/* <button
          className="btn btn-empty text-[12px] text-[var(--black)]  px-1 !max-h-[20px]"
          onClick={() => setOpenMobile(!openMobile)}
        >
          Add
        </button> */}
      </div>
      {/* <span className="text-[var(--black)] pl-1"> &--{modClass}&#123; </span> */}

      <Monaco text={currentStyle} setText={setCurrentStyle} />


      {/* <span className="text-[var(--black)] pl-1"> &#125; </span> */}
    </div>
  );
}
export default ModStyleComponent;