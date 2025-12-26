"use client";
import React, { useState, useEffect, useRef } from "react";
import "./sandbox.scss";
import { usePathname } from "next/navigation";
import Editor, { useMonaco } from "@monaco-editor/react";
import Image from "next/image";
import { useStateContext } from "@/providers/StateProvider";
import startScssContent from "../SandboxComponent/startScssContent";
import { formatScss } from "@/utils/sandboxFormatters";

interface SandboxComponentProps {
  heightPreview?: number;
  widthPreview?: number;
}

const SandboxСomponent: React.FC<SandboxComponentProps> = ({
  heightPreview = 300,
  widthPreview = 0,
}) => {
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
  const pathname = usePathname();
  const isSandbox = () => {
    return pathname === "/sandbox" ? true : false;
  };
  const monaco = useMonaco();
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const editorRef = useRef<any>(null);

  const [html, setHtml] = useState<string>(HTML);
  const [startScss, setStartScss] = useState<string>("");
  const [scss, setScss] = useState<string>("");
  const [active, setActive] = useState<"html" | "scss" | "startScss">("html");
  const [editorHeight, setEditorHeight] = useState<number>(200);

  // ✅ Размеры preview под картинку, с fallback на пропсы
  const [previewWidth, setPreviewWidth] = useState<number>(widthPreview);
  const [previewHeight, setPreviewHeight] = useState<number>(heightPreview);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  // ----- Авторесайз iframe под содержимое (включая картинки)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const observer = new MutationObserver(() => {
      resizeIframe();
    });

    const startObserve = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      observer.observe(doc.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    };

    iframe.addEventListener("load", startObserve);

    return () => {
      observer.disconnect();
      iframe.removeEventListener("load", startObserve);
    };
  }, []);

  // ✅ Главная функция ресайза - ищет картинки и подстраивается под них
  const resizeIframe = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const body = doc.body;
    const html = doc.documentElement;
    if (!body || !html) return;

    const contentHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.scrollHeight,
      html.offsetHeight,
    );

    const contentWidth = Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.scrollWidth,
      html.offsetWidth,
    );

    iframe.style.height = `${Math.max(contentHeight, heightPreview)}px`;
    iframe.style.width = `${Math.max(contentWidth, widthPreview)}px`;
  };
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    iframe.addEventListener("load", resizeIframe);

    const t = setTimeout(resizeIframe, 0); // на случай, если стили применяются чуть позже

    return () => {
      iframe.removeEventListener("load", resizeIframe);
      clearTimeout(t);
    };
  }, [previewHtml, heightPreview, widthPreview]);

  // ----- Monaco theme и resize под содержимое
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
    editor.getAction("editor.action.formatDocument")?.run();

    editor.onDidContentSizeChange(() => {
      const contentHeight = editor.getContentHeight();
      setEditorHeight(Math.max(contentHeight, 200));

      editor.layout({
        width: Math.min(previewWidth, 1000),
        height: contentHeight,
      });
    });
  };

  useEffect(() => {
    return () => {
      if (editorInstance) editorInstance.dispose();
    };
  }, [editorInstance]);

  useEffect(() => {
    console.log("<==//=HTML==//=>", HTML);
    setHtml(HTML);
  }, [HTML]);

  useEffect(() => {
    console.log("<==//=SCSS==//=>", SCSS);
  }, [SCSS]);

  useEffect(() => {
    const run = async () => {
      if (!SCSS) {
        setScss("");
        return;
      }
      setStartScss(startScssContent);
      const formatted = await formatScss(SCSS);
      setScss(formatted);
    };
    void run();
  }, [SCSS, startScssContent]);

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
    <div className={`${isSandbox() ? "sandbox" : ""}`}>
      <div className={`${isSandbox() ? "container" : ""}`}>
        {isSandbox() && (
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
        )}
        {/* ✅ Preview с динамическими размерами */}
        <section className="w-full mb-4 bg-navy overflow-hidden">
          <iframe
            ref={iframeRef}
            title="Sandbox preview"
            className="block border-0"
            srcDoc={previewHtml}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: widthPreview !== 0 ? `${widthPreview}px` : "100%",
              height: `${heightPreview}px`,
              minWidth: `${widthPreview}px`,
              minHeight: `${heightPreview}px`,
              // maxWidth: "100vw",
            }}
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
                  autoIndent: "full",
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SandboxСomponent;
