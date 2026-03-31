"use client";
import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
import cleanConstructorScss from "../forStyleComponent/cleanConstructorScss";
import Editor, { useMonaco } from "@monaco-editor/react";

const MobileAddStyle = dynamic(
  () => import("../forStyleComponent/MobileAddStyle"),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);
import type { HtmlNode } from "@/types/HtmlNode";

interface StyleComponentProps {
  node: HtmlNode;
  itemClass: string;
  updateNodeByKey: (key: string, changes: Partial<HtmlNode>) => void;
}

// ================================
const StyleComponent: React.FC<StyleComponentProps> = ({
  node,
  itemClass,
  updateNodeByKey,
}) => {
  const [openMobile, setOpenMobile] = useState(false);
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

  // ------------------------------- Monaco Theme Logic (matching PreviewComponent)
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
    const id = setTimeout(() => {
      if (node._key) {
        updateNodeByKey(node._key, { style: styleText });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [styleText, node?._key]);

  // ====>====>====>====>====>====>====>====>====>====>
  return (
    <>
      <MobileAddStyle
        setStyleText={setStyleText}
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
        nodeStyle={JSON.stringify(node?.style)}
      />
      <div className="bg-white rounded !max-h-[max-content] ml-[5px] flex flex-col relative ">
        <p className={itemClass}>
          <span>Style:</span>
          <button
            className="btn-teal text-[12px] !max-h-[20px]"
            onClick={() => setOpenMobile(!openMobile)}
          >
            Add
          </button>
        </p>

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
      </div>
    </>
  );
};

export default StyleComponent;
