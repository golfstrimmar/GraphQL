"use client";
import React, { useState, useEffect, useRef } from "react";
import "./sandbox.scss";
import Editor, { useMonaco } from "@monaco-editor/react";
import Image from "next/image";
import { useStateContext } from "@/providers/StateProvider";
import startScssContent from "./startScssContent";
const Sandbox: React.FC = () => {
  const {
    htmlJson,
    user,
    setModalMessage,
    updateHtmlJson,
    undo,
    redo,
    undoStack,
    redoStack,
    texts,
    setTexts,
    HTML,
    SCSS,
  } = useStateContext();
  //   const startScSS = `
  //   body {
  //   background: white;
  //   font-family: 'PT Sans', sans-serif;
  //   font-size: 18px;
  //   font-weight: 400;
  //   color: rgb(37, 37, 37);
  // }
  //   .imgs {
  //   overflow: hidden;
  //   position: relative;
  //   width: 100%;
  //   height: 100%;
  //   top: 0;
  //   left: 0;
  // }

  // .imgs img {
  //   height: 100%;
  //   width: 100%;
  //   object-fit: cover;
  //   object-position: top;
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  // }`;

  const monaco = useMonaco();
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // html — содержимое body, не весь документ
  const [html, setHtml] = useState<string>(HTML);
  const [startScss, setStartScss] = useState<string>("");
  const [scss, setScss] = useState<string>("");
  const [active, setActive] = useState<"html" | "scss" | "startScss">("html");
  const [editorHeight, setEditorHeight] = useState<number>(200);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  // ----- monaco
  useEffect(() => {
    if (monaco) {
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
    }
  }, [monaco]);

  const handleEditorMount = (editor: any) => {
    if (monaco) monaco.editor.setTheme("myCustomTheme");
    editor.setScrollTop(0);
    editor.revealLine(1);
    setEditorInstance(editor);
    editorRef.current = editor;

    editor.onDidContentSizeChange(() => {
      const contentHeight = editor.getContentHeight();
      setEditorHeight(contentHeight);
      editor.layout({
        width: editor.getLayoutInfo().width,
        height: contentHeight,
      });
    });
  };

  useEffect(() => {
    return () => {
      if (editorInstance) editorInstance.dispose();
    };
  }, [editorInstance]);
  // ----

  useEffect(() => {
    // const styleScssContent = `${startScssContent}\n\n${SCSS}`;
    setStartScss(startScssContent);
    setScss(SCSS || "");
  }, [SCSS]);

  // ----- сборка превью из html + scss
  useEffect(() => {
    const fullDoc = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    ${startScss}
    ${scss}
  </style>
  <title>Sandbox</title>
</head>
<body>
${html} 
</body>
</html>`;

    setPreviewHtml(fullDoc);
  }, [html, scss, startScss]);

  const isHtml = active === "html";
  const value =
    active === "html"
      ? html
      : active === "scss"
        ? scss
        : active === "startScss"
          ? startScss
          : undefined;

  const language = isHtml ? "html" : "scss";

  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    if (active === "html") setHtml(value);
    else if (active === "scss") setScss(value);
    else if (active === "startScss") setStartScss(value);
  };

  return (
    <div className="sandbox">
      <div className="container">
        <header className="sandbox__header">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
              Sandbox Editor
            </h1>
            <p className="text-slate-600 text-sm">
              Build and manage your projects
            </p>
          </div>
        </header>

        {/* Превью */}
        <section className="w-full mb-4 bg-navy">
          <iframe
            ref={iframeRef}
            title="Sandbox preview"
            className="w-full h-[800px]"
            srcDoc={previewHtml}
            sandbox="allow-scripts allow-same-origin"
          />
        </section>

        <div className="flex">
          <aside className="flex-[1_0_20%] bg-navy border">
            <ul className="p-1">
              <li
                className={
                  "hover:bg-slate-600 cursor-pointer px-1" +
                  (active === "html" ? " teal-500" : "")
                }
                onClick={() => setActive("html")}
              >
                <span className="sandbox__file-name">index.html</span>
              </li>
              <li
                className={
                  "hover:bg-slate-600 cursor-pointer px-1" +
                  (active === "scss" ? " teal-500" : "")
                }
                onClick={() => setActive("scss")}
              >
                <span className="sandbox__file-name">styles.scss</span>
              </li>
              <li
                className={
                  "hover:bg-slate-600 cursor-pointer px-1" +
                  (active === "startScss" ? " teal-500" : "")
                }
                onClick={() => setActive("startScss")}
              >
                <span className="sandbox__file-name">start.scss</span>
              </li>
            </ul>
          </aside>

          <main className="flex-[1_1_100%] bg-slate-200">
            <section className="w-full">
              <Editor
                height={editorHeight}
                language={language}
                value={value}
                onChange={handleCodeChange}
                onMount={handleEditorMount}
                options={{
                  fontSize: 14,
                  fontFamily: "Fira Code, monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontalScrollbarSize: 14,
                  },
                  automaticLayout: true,
                }}
              />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
