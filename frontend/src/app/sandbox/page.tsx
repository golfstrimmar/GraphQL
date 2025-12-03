"use client";
import React, { useState, useEffect, useRef } from "react";
import "./sandbox.scss";
import Editor, { useMonaco } from "@monaco-editor/react";
import Image from "next/image";
const Sandbox: React.FC = () => {
  const monaco = useMonaco();
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState<string>(
    '<!doctype html lang="en">\n<head>\n<meta charset="UTF-8" />\n<link rel="icon" type="image/svg+xml" href="assets/svg/check.svg" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>Starter</title>\n</head>\n<body>\n</body>\n</html>'
  );
  const [scss, setScss] = useState<string>("body {\n  margin: 0;\n}");
  const [active, setActive] = useState<"html" | "scss">("html");
  const [editorHeight, setEditorHeight] = useState<number>(200);
  // -----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹--monaco
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
      monaco.languages.register({ id: "scss" });
      monaco.languages.register({ id: "javascript" });
    }
  }, [monaco]);

  const handleEditorMount = (editor: any) => {
    if (monaco) monaco.editor.setTheme("myCustomTheme");
    editor.setScrollTop(0);
    editor.revealLine(1);
    setEditorInstance(editor);
    editorRef.current = editor;

    // 🔹 включаем авто‑высоту
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
  // -----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
  const isHtml = active === "html";

  const value = isHtml ? html : scss;
  const handleChange = (v: string) => {
    if (isHtml) setHtml(v);
    else setScss(v);
  };
  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    if (isHtml) setHtml(value);
    else setScss(value);
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
        <div className="flex ">
          <aside className="flex-[1_0_20%] bg-navy border">
            <ul className="p-1">
              <li
                className={
                  "hover:bg-slate-600 cursor-pointer px-1" +
                  (isHtml ? " sandbox__file-item--active" : "")
                }
                onClick={() => setActive("html")}
              >
                <span className="sandbox__file-name">index.html</span>
              </li>
              <li
                className={
                  "hover:bg-slate-600 cursor-pointer px-1" +
                  (!isHtml ? " sandbox__file-item--active" : "")
                }
                onClick={() => setActive("scss")}
              >
                <span className="sandbox__file-name">styles.scss</span>
              </li>
            </ul>
          </aside>

          <main className="flex-[1_1_100%] bg-slate-200 h-[max-content]">
            <section className="w-full h-full">
              {/* <textarea
                className="w-full"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                spellCheck={false}
              /> */}
              <Editor
                height="100%"
                // defaultLanguage={
                //   selectedFile.endsWith(".scss")
                //     ? "scss"
                //     : selectedFile.endsWith(".css")
                //       ? "css"
                //       : selectedFile.endsWith(".js")
                //         ? "javascript"
                //         : "html"
                // }
                // language={
                //   selectedFile.endsWith(".scss")
                //     ? "scss"
                //     : selectedFile.endsWith(".css")
                //       ? "css"
                //       : selectedFile.endsWith(".js")
                //         ? "javascript"
                //         : "html"
                // }
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
