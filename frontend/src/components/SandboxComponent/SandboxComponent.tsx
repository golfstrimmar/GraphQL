"use client";
import React, { useState, useEffect, useRef } from "react";
import "./sandbox.scss";
import { usePathname } from "next/navigation";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useStateContext } from "@/providers/StateProvider";
import startScssContent from "../SandboxComponent/startScssContent";
import { formatScss } from "@/utils/sandboxFormatters";
import formatHtml from "@/utils/formatHtml";

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
  const isSandbox = () => pathname === "/sandbox";

  const monaco = useMonaco();
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const editorRef = useRef<any>(null);

  const [value, setValue] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [startScss, setStartScss] = useState<string>("");
  const [scss, setScss] = useState<string>("");
  const [active, setActive] = useState<"html" | "scss" | "startScss">("html");
  const [editorHeight, setEditorHeight] = useState<number>(200);

  const [previewWidth] = useState<number>(widthPreview);
  const [previewHeight] = useState<number>(heightPreview);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  useEffect(() => {
    console.log("<===HTML===>", HTML);
    if (!HTML) {
      setHtml("");
      return;
    }
    const formatted = formatHtml(HTML);
    setHtml(formatted);
  }, [HTML]);

  useEffect(() => {
    console.log("<===SCSS===>", SCSS);
    if (!SCSS) {
      setScss("");
      return;
    }
    setScss(SCSS);
  }, [SCSS]);
  // start.scss один раз
  useEffect(() => {
    setStartScss(startScssContent);
  }, []);

  // форматируем SCSS из контекста
  useEffect(() => {
    const run = async () => {
      const formatted = await formatScss(SCSS);
      setScss(formatted);
    };
    void run();
  }, [SCSS]);

  // наблюдаем за DOM внутри iframe
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

  // функция ресайза iframe
  const resizeIframe = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const body = doc.body;
    const htmlEl = doc.documentElement;
    if (!body || !htmlEl) return;

    const contentHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      htmlEl.scrollHeight,
      htmlEl.offsetHeight,
    );

    const contentWidth = Math.max(
      body.scrollWidth,
      body.offsetWidth,
      htmlEl.scrollWidth,
      htmlEl.offsetWidth,
    );

    iframe.style.height = `${Math.max(contentHeight, heightPreview)}px`;
    iframe.style.width = `${Math.max(contentWidth, widthPreview)}px`;
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    iframe.addEventListener("load", resizeIframe);
    const t = setTimeout(resizeIframe, 0);

    return () => {
      iframe.removeEventListener("load", resizeIframe);
      clearTimeout(t);
    };
  }, [previewHtml, heightPreview, widthPreview]);

  // Monaco тема
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
        width: Math.min(previewWidth || 1000, 1000),
        height: contentHeight,
      });
    });
  };

  useEffect(() => {
    return () => {
      if (editorInstance) editorInstance.dispose();
    };
  }, [editorInstance]);

  // собираем HTML для iframe
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
  const language = isHtml ? "html" : "scss";

  // синхронизация value с активной вкладкой
  useEffect(() => {
    if (active === "html") {
      setValue(html);
    } else if (active === "scss") {
      setValue(scss);
    } else if (active === "startScss") {
      setValue(startScss);
    }
  }, [active, html, scss, startScss]);

  useEffect(() => {
    if (!editorRef.current) return;
    requestAnimationFrame(() => {
      editorRef.current.layout();
    });
  }, [value]);

  const handleCodeChange = (val: string | undefined) => {
    if (val === undefined) return;
    if (active === "html") setHtml(val);
    else if (active === "scss") setScss(val);
    else if (active === "startScss") setStartScss(val);
  };

  return (
    <div className={isSandbox() ? "sandbox" : ""}>
      <div className={isSandbox() ? "container" : ""}>
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

        <section className="w-full mb-4 bg-navy overflow-hidden">
          <iframe
            ref={iframeRef}
            title="Sandbox preview"
            className="block border-0"
            srcDoc={previewHtml}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: widthPreview !== 0 ? `${widthPreview}px` : "100%",
              height: `${previewHeight}px`,
              minWidth: `${widthPreview}px`,
              minHeight: `${previewHeight}px`,
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

          <main className="flex-[0_1_100%] bg-slate-200">
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default SandboxСomponent;
