"use client";
import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
import cleanConstructorScss from "../forStyleComponent/cleanConstructorScss";
import Editor, { useMonaco } from "@monaco-editor/react";
import type { HtmlNode } from "@/types/HtmlNode";
import formatStyleString from "../forStyleComponent/formatStyleString";
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
}

// ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
const StyleComponent: React.FC<StyleComponentProps> = ({
  node,
  updateNodeByKey,
}) => {
  const [openMobile, setOpenMobile] = useState(false);
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const [styleText, setStyleText] = useState("");
  // ====>====>====>====>==== Monaco Theme Logic (matching PreviewComponent)
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

    // // Auto-format on mount
    // setTimeout(() => {
    const action = editor.getAction("editor.action.formatDocument");
    action?.run();
    // }, 0);
  };

  // ====>====>====>====>====>====>====>====>====>====>




  useEffect(() => {
    if (!node?._key) return;
    console.log('<===node.style===>', node.style);
    setStyleText(formatStyleString(node.style || ""))
  }, [node]);

  useEffect(() => {
    if (!styleText) return;
    console.log('<===styleText===>', styleText)

    updateNodeByKey(node._key, { style: styleText })

  }, [styleText]);


  // useEffect(() => { if (!styleText) return; updateNodeByKey(node._key, { style: styleText }) }, [styleText]);

  // ====>====>====>====>====>====>====>====>====>====>
  // const formatStyleForDisplay = (raw: string): string => {
  //   if (!raw) return "";

  //   // Добавлена проверка на "}"
  //   if (raw.includes("\n") || raw.includes("{") || raw.includes("}") || raw.includes("&")) {
  //     return raw;
  //   }

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

  // ====>====>====>====>====>====>====>====>====>====>


  // синк при смене node / внешнего style
  // useEffect(() => {
  //   setStyleText(node?.style ? formatStyleForDisplay(node?.style) : "");
  // }, [node?._key, node?.style]);

  // useEffect(() => {
  //   if (!node?._key) return;
  //   const id = setTimeout(() => {
  //     if (node._key) {
  //       updateNodeByKey(node._key, { style: styleText });
  //     }
  //   }, 1000);
  //   return () => clearTimeout(id);
  // }, [styleText, node?._key]);

  // ====>====>====>====>====>====>====>====>====>====>
  return (
    <>
      <MobileAddStyle
        setStyleText={setStyleText}
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
        nodeStyle={JSON.stringify(node?.style)}
      />
      <div className="unitStyle">
        <div className="flex  items-center gap-1 p-[5px]">
          <h6 className="my-1">Style:</h6>
          <button
            className="btn btn-empty text-[12px] text-[var(--black)]  px-1 !max-h-[20px]"
            onClick={() => setOpenMobile(!openMobile)}
          >
            Add
          </button>
        </div>

        <div className="border border-slate-200 rounded overflow-hidden">
          <Editor
            height="230px"
            language="scss"
            value={styleText}
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
