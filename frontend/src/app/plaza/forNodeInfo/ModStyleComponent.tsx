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

const MobileAddStyle = dynamic(
  () => import("../forStyleComponent/MobileAddStyle"),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);

interface StyleComponentProps {
  node: HtmlNode;
  updateNodeByKey: (key: string, changes: Partial<HtmlNode>) => void;
  modClass: string;
}


// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
const ModStyleComponent: React.FC<StyleComponentProps> = ({ node, updateNodeByKey, modClass }) => {
  const [openMobile, setOpenMobile] = useState(false);
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
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
  useEffect(() => { if (!node.style) return; console.log('<===node.style===>', node.style); }, [node.style]);
  useEffect(() => { if (!modClass) return; console.log('<===modClass===>', modClass); }, [modClass]);

  // ====>====>====>====>====>====>====>====>====>====>
  const formatStyleForDisplay = (raw: string): string => {
    if (!raw) return "";
    // Если есть переносы или SCSS-конструкции ({}, &), лучше не форматировать наивно, 
    // чтобы не сломать селекторы типа &:hover
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
  const [styleText, setStyleText] = useState("");
  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
  useEffect(() => {
    if (!node?._key || !styleText) return;

    const id = setTimeout(() => {
      const modStyles = formatStyleForDisplay(styleText); // Новые стили
      const rawStyle = node?.style || "";
      const modifierSelector = `&--${modClass}`;

      // Регулярное выражение с группами захвата:
      // Группа 1: "&--className {"
      // Группа 2: всё, что внутри скобок
      // Группа 3: "}"
      const regex = new RegExp(`(${modifierSelector}\\s*\\{)([^}]*)(\\})`, 'g');

      let resStyle = "";

      if (rawStyle.includes(modifierSelector)) {
        // Если модификатор найден, дополняем его содержимое
        resStyle = rawStyle.replace(regex, (match, open, oldContent, close) => {
          // Проверяем, нужно ли добавить точку с запятой между старым и новым
          const needsSeparator = oldContent.trim() && !oldContent.trim().endsWith(';');
          return `${open}${oldContent}${needsSeparator ? ';' : ''} ${modStyles}${close}`;
        });
      } else {
        // Если модификатора нет, создаем новый блок
        resStyle = rawStyle.trim()
          ? `${rawStyle.trim()}\n${modifierSelector}  {${modStyles} \n}`
          : `${modifierSelector} { ${modStyles} }`;
      }

      if (resStyle !== node.style) {
        updateNodeByKey(node._key, { style: resStyle });
      }
    }, 1000);

    return () => clearTimeout(id);
  }, [styleText, node?._key, modClass]);
  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
  return (
    <div className="unitStyle">
      <MobileAddStyle
        setStyleText={setStyleText}
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
        nodeStyle={JSON.stringify(node?.style)}
      />
      <div className="flex  items-center gap-1 p-[5px]">
        <h6 className="my-1">ModStyle:</h6>
        <button
          className="btn btn-empty text-[12px] text-[var(--black)]  px-1 !max-h-[20px]"
          onClick={() => setOpenMobile(!openMobile)}
        >
          Add
        </button>
      </div>
      <span className="text-[var(--black)] pl-1"> &--{modClass}&#123; </span>
      <div className="border border-slate-200 rounded overflow-hidden">
        <Editor
          height="230px"
          language="scss"
          value={cleanConstructorScss(styleText)}
          onChange={(value) => setStyleText(value || "")}
          onMount={handleEditorMount}
          theme="myCustomTheme"
          options={{
            fontSize: 13,
            fontFamily: "Fira Code, monospace",
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
      <span className="text-[var(--black)] pl-1"> &#125; </span>
    </div>
  );
}
export default ModStyleComponent;