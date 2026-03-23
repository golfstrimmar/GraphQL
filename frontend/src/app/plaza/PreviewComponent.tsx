"use client";
import React, { useState, useRef, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import PageHeader from "./PageHeader";
import CustomSlider from "@/components/ui/CustomSlider/CustomSlider";
import Editor, { useMonaco } from "@monaco-editor/react";
import Script from "next/script";

//=== 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
export default function PreviewComponent() {
  const { preview, HTML, SCSS, JS, setSCSS, setHTML, setJS, htmlJson } = useStateContext();
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRefHtml = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRefJs = useRef<ReturnType<typeof setTimeout> | null>(null);
  const htmlEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );
  const scssEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );
  const jsEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );

  const [code, setCode] = useState<string>("");
  const [codeCss, setCodeCss] = useState<string>("");
  const [codeJs, setCodeJs] = useState<string>("");
  const [editorHeight, setEditorHeight] = useState<number>(500);
  const monaco = useMonaco();

  // ------------------------------- Monaco Theme
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

  const handleHtmlEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
  ) => {
    if (monaco) monaco.editor.setTheme("myCustomTheme");
    editor.setScrollTop(0);
    editor.revealLine(1);
    htmlEditorRef.current = editor;
  };

  const handleScssEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
  ) => {
    if (monaco) monaco.editor.setTheme("myCustomTheme");
    editor.setScrollTop(0);
    editor.revealLine(1);
    scssEditorRef.current = editor;
  };

  const handleJsEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
  ) => {
    if (monaco) monaco.editor.setTheme("myCustomTheme");
    editor.setScrollTop(0);
    editor.revealLine(1);
    jsEditorRef.current = editor;
  };
  // ----------HTML
  useEffect(() => {
    // console.log("<==✨✨✨=HTML===>", HTML);
    if (!HTML || HTML === "") {
      setCode("");
      return;
    }
    setCode(HTML);
  }, [HTML]);

  useEffect(() => {
    if (!code) return;
    setTimeout(() => {
      const editor = htmlEditorRef.current;
      if (!editor) return;

      requestAnimationFrame(() => {
        const action = editor.getAction("editor.action.formatDocument");
        action?.run();
      });
    }, 100);
  }, [code]);

  // -----------SCSS
  useEffect(() => {
    // console.log("<===SCSS===>", SCSS);
    if (!SCSS) {
      setCodeCss("");
      return;
    }
    setCodeCss(SCSS);
  }, [SCSS]);

  useEffect(() => {
    if (!codeCss) return;
    setTimeout(() => {
      const editor = scssEditorRef.current;
      if (!editor) return;
      requestAnimationFrame(() => {
        const action = editor.getAction("editor.action.formatDocument");
        action?.run();
      });
    }, 100);
  }, [codeCss]);

  // -----------JS
  useEffect(() => {
    if (!JS) {
      setCodeJs("");
      return;
    }
    setCodeJs(JS);
  }, [JS]);

  useEffect(() => {
    if (!codeJs) return;
    setTimeout(() => {
      const editor = jsEditorRef.current;
      if (!editor) return;
      requestAnimationFrame(() => {
        const action = editor.getAction("editor.action.formatDocument");
        action?.run();
      });
    }, 100);
  }, [codeJs]);

  const [compiledCss, setCompiledCss] = useState<string>("");

  // Константа со сбросом стилей (null.scss)
  const NULL_CSS = `
* { padding: 0px; margin: 0; border: 0px; box-sizing: border-box; }
*:before, *:after { box-sizing: border-box; }
:focus, :active { outline: none; }
a:focus, a:active { outline: none; }
aside, nav, footer, header, section { display: block; }
html { max-width: 100vw; }
body { max-width: 100vw; text-size-adjust: 100%; }
input, button, textarea { resize: none; }
input { margin: 0; padding: 0; }
input::-ms-clear { display: none; }
button { cursor: pointer; }
button::-moz-focus-inner { padding: 0; border: 0px; }
h1,h2,h3,h4,h5,h6{ display: block; }
a { text-decoration: none !important; }
a:active, a:hover { outline: 0; }
a:visited { text-decoration: none !important; }
img { vertical-align: top; }
ul, li { list-style-type: none; margin: 0; padding: 0; }
img, audio, video { height: auto; }
audio, canvas, iframe, video, img, svg { vertical-align: middle; }
iframe { border: 0; }
textarea { resize: none; overflow: auto; vertical-align: top; box-shadow: none; }
input, textarea, select, button { outline: none; border: none; font-size: 100%; margin: 0; }
button, input { line-height: normal; }
table { border-collapse: collapse; border-spacing: 0; }
td, th { padding: 0; text-align: left; }
`;

  useEffect(() => {
    if (!SCSS) {
      setCompiledCss("");
      return;
    }

    const fullScss = `${NULL_CSS}\n${SCSS}`;

    // Попытка скомпилировать SCSS в CSS
    // Используем sass.js если он доступен
    try {
      // @ts-ignore
      if (typeof Sass !== "undefined") {
        // @ts-ignore
        Sass.compile(fullScss, (result) => {
          if (result.status === 0) {
            setCompiledCss(result.text);
          } else {
            console.warn("Sass compilation error:", result.message);
            setCompiledCss(fullScss); // fallback to raw
          }
        });
      } else {
        setCompiledCss(fullScss);
      }
    } catch (e) {
      setCompiledCss(fullScss);
    }
  }, [SCSS]);

  const srcDoc = `<html>
      <head>
        <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          html, body { margin: 0; padding: 0; }
          *, *::before, *::after { box-sizing: border-box; }
          body { font-family: sans-serif; }
          ${compiledCss || SCSS || ""}
        </style>
      </head>
      <body>
        ${HTML || ""}
        <script>
          try {
            ${JS || ""}
          } catch(e) { console.error(e); }
        </script>
      </body>
    </html>`;

  // const handleImgLoad = () => {
  //   if (!imgRef.current) return;
  //   setNaturalWidth(imgRef.current.naturalWidth);
  // };

  // const scaledWidth = naturalWidth ? naturalWidth * scale : undefined;

  // ------------------------
  return (
    <>
      <div
        id="preview-section"
        className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 relative mt-[25px] mb-4"
      >
        {PageHeader("PreviewIcon", "Preview")}
        <Script 
          src="https://cdn.jsdelivr.net/npm/sass.js@0.11.1/dist/sass.sync.js" 
          strategy="beforeInteractive"
        />
        {/*{htmlJson.length > 0 && <pre>{JSON.stringify(htmlJson, null, 2)}</pre>}*/}
        {/*<div className="mt-4 mb-2">
          <CustomSlider
            value={scale}
            min={0.1}
            max={2}
            step={0.1}
            onChange={setScale}
          />
        </div>*/}
        {(HTML || JS) && (
          <div className="max-w-[100vw] min-h-[500px] border-2 border-[var(--teal)] rounded-md overflow-hidden ">
            <iframe
              title="preview-iframe"
              srcDoc={srcDoc}
              sandbox="allow-scripts allow-same-origin allow-modals"
              className="block w-full h-full max-w-[100vw] min-h-[500px] border-none pointer-events-auto"
            />
          </div>
        )}
      </div>
      {/* ============🚀 */}
      {(HTML || JS) && (
        <div className="flex gap-2">
          <Editor
            height={editorHeight}
            defaultLanguage="html"
            language="html"
            defaultValue={code}
            value={code}
            onChange={(value) => {
              const next = value || "";

              if (debounceRefHtml.current) {
                clearTimeout(debounceRefHtml.current);
              }

              debounceRefHtml.current = setTimeout(() => {
                setHTML(next);
              }, 2000);
            }}
            options={{
              fontSize: 14,
              fontFamily: "Fira Code, monospace",
              scrollBeyondLastLine: true,
              // minimap: {
              //   enabled: true,
              //   size: "fit",
              //   showSlider: "always",
              //   renderCharacters: false,
              // },
              minimap: {
                enabled: false,
              },
              scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                handleMouseWheel: true,
              },
              hover: { enabled: false },
              parameterHints: { enabled: false },
              autoIndent: "full",
              formatOnPaste: true,
              formatOnType: true,
            }}
            onMount={handleHtmlEditorMount}
            beforeMount={() => {
              if (monaco) {
                monaco.editor.defineTheme("myCustomTheme", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [],
                  colors: { "editor.background": "#1e1e1e" },
                });
              }
            }}
          />

          <Editor
            height={editorHeight}
            language="scss"
            value={codeCss}
            onChange={(value) => {
              const next = value || "";

              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
              }

              debounceRef.current = setTimeout(() => {
                setSCSS(next);
              }, 2000);
            }}
            options={{
              fontSize: 14,
              fontFamily: "Fira Code, monospace",
              scrollBeyondLastLine: true,
              minimap: {
                enabled: false,
              },
              scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                handleMouseWheel: true,
              },
              hover: { enabled: false },
              parameterHints: { enabled: false },
              autoIndent: "full",
            }}
            onMount={handleScssEditorMount}
            beforeMount={() => {
              if (monaco) {
                monaco.editor.defineTheme("myCustomTheme", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [],
                  colors: { "editor.background": "#1e1e1e" },
                });
              }
            }}
          />

          <Editor
            height={editorHeight}
            language="javascript"
            value={codeJs}
            onChange={(value) => {
              const next = value || "";

              if (debounceRefJs.current) {
                clearTimeout(debounceRefJs.current);
              }

              debounceRefJs.current = setTimeout(() => {
                setJS(next);
              }, 2000);
            }}
            options={{
              fontSize: 14,
              fontFamily: "Fira Code, monospace",
              scrollBeyondLastLine: true,
              minimap: {
                enabled: false,
              },
              scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                handleMouseWheel: true,
              },
              hover: { enabled: false },
              parameterHints: { enabled: false },
              autoIndent: "full",
            }}
            onMount={handleJsEditorMount}
            beforeMount={() => {
              if (monaco) {
                monaco.editor.defineTheme("myCustomTheme", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [],
                  colors: { "editor.background": "#1e1e1e" },
                });
              }
            }}
          />
        </div>
      )}
    </>

  );
}
