"use client";
import React, { useState, useRef, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import PageHeader from "./PageHeader";
import CustomSlider from "@/components/ui/CustomSlider/CustomSlider";
import Editor, { useMonaco } from "@monaco-editor/react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon";
import WorkerIcon from "@/components/icons/WorkerIcon";
import PreviewIcon from "@/components/icons/PreviewIcon";
interface ModalFullProps {
  message: string;
  open: boolean;
}

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
  const [openModalFull, setOpenModalFull] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [codeCss, setCodeCss] = useState<string>("");
  const [codeJs, setCodeJs] = useState<string>("");
  const [htmlEditorHeight, setHtmlEditorHeight] = useState<number>(100);
  const [scssEditorHeight, setScssEditorHeight] = useState<number>(100);
  const [jsEditorHeight, setJsEditorHeight] = useState<number>(100);
  const monaco = useMonaco();
  const [openDebug, setOpenDebug] = useState<boolean>(false);
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

    const updateHeight = () => {
      const contentHeight = editor.getContentHeight();
      setHtmlEditorHeight(Math.min(500, Math.max(100, contentHeight)));
    };
    editor.onDidContentSizeChange(updateHeight);
    updateHeight();
  };

  const handleScssEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
  ) => {
    if (monaco) monaco.editor.setTheme("myCustomTheme");
    editor.setScrollTop(0);
    editor.revealLine(1);
    scssEditorRef.current = editor;

    const updateHeight = () => {
      const contentHeight = editor.getContentHeight();
      setScssEditorHeight(Math.min(500, Math.max(100, contentHeight)));
    };
    editor.onDidContentSizeChange(updateHeight);
    updateHeight();
  };

  const handleJsEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
  ) => {
    if (monaco) monaco.editor.setTheme("myCustomTheme");
    editor.setScrollTop(0);
    editor.revealLine(1);
    jsEditorRef.current = editor;

    const updateHeight = () => {
      const contentHeight = editor.getContentHeight();
      setJsEditorHeight(Math.min(500, Math.max(100, contentHeight)));
    };
    editor.onDidContentSizeChange(updateHeight);
    updateHeight();
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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700;800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;600;700;800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;500;600;700;800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;500;600;700;800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lobster&display=swap" />
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
      {/* --- */}
      <div className="flex gap-2 mb-4">
        <button className="btn btn-teal h-[18px] " onClick={() => { document.body.style.overflow = "hidden"; openDebug ? setOpenDebug(false) : setOpenDebug(true) }}>htmlJson Debug</button>
        <button
          className="btn btn-teal   h-[18px] "
          type="button"
          onClick={async () => {
            const el = document.getElementById("debug-htmlJson");
            console.log("<===el===>", el);
            if (!el) return;
            const inn = el.innerHTML;
            console.log("<===inn===>", inn);
            if (inn) {

              try {
                await navigator.clipboard.writeText(inn);
              } catch (err) {
                console.error('Ошибка копирования:', err);
              }

            }
          }}
        >
          Copy
        </button>
      </div>
      {/* --- */}
      <div className={`${openDebug ? "block" : "hidden"}  flex-1 text-[14px] bg-slate-900/60 p-2 rounded-lg  overflow-auto border border-slate-700/50 shadow-inner`}>
        <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-800 ">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">debug: htmlJson</span>
          <span className="text-[9px] text-teal-500/50 italic">{typeof htmlJson === 'object' ? Object.keys(htmlJson || {}).length : 0} props</span>
        </div>
        <pre id="debug-htmlJson" className=" text-teal-400 line-height-1">
          {JSON.stringify(htmlJson, null, 2)}
        </pre>
      </div>

      {/* --- */}
      <div
        id="preview-section"
        className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 relative  "
      >
        <AnimatePresence>
          {openModalFull && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: [0.25, 0.8, 0.5, 1] }}
              className="w-[100vw] overflow-y-auto fixed top-0 left-0 flex justify-center items-center bg-[rgba(0,0,0,.95)] z-100000  "
            >
              <button className="w-4 h-4 block text-red-500 absolute top-4 right-6 z-10000 hover:text-gray-500 cursor-pointer transition-colors duration-300"
                onClick={() => {
                  document.body.style.overflow = "auto"; document.body.style.maxHeight = "none";
                  setOpenModalFull(false)
                }}
              >
                <CloseIcon />
              </button>
              <div className="w-[100vw] min-h-[100vh] ">
                <iframe
                  title="preview-iframe"
                  srcDoc={srcDoc}
                  sandbox="allow-scripts allow-same-origin allow-modals"
                  className="block w-full h-full max-w-[100vw] min-h-[100vh] border-none pointer-events-auto"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        <div className="flex gap-2 items-center">

          {PageHeader("PreviewIcon", "Preview")}


          <button className="btn btn-primary m-0" onClick={() => { document.body.style.overflow = "hidden"; document.body.style.maxHeight = "100vh"; setOpenModalFull(true) }}>
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" aria-hidden="true" data-slot="icon">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15">
              </path>
            </svg>
          </button>
          {/* <button
            className="btn btn-primary m-0 w-[28px] h-[18px]"
            type="button"
            onClick={() => {
              const el = document.getElementById("canvas-section");
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
          >
            <WorkerIcon width={12} height={12} />
          </button> */}

        </div>
        <Script
          src="https://cdn.jsdelivr.net/npm/sass.js@0.11.1/dist/sass.sync.js"
          strategy="beforeInteractive"
        />

        {(HTML || JS) && (
          <div className="max-w-[100vw] min-h-[1000px]  border-2 border-[var(--teal)] rounded-md overflow-hidden ">
            <iframe
              title="preview-iframe"
              srcDoc={srcDoc}
              sandbox="allow-scripts allow-same-origin allow-modals"
              className="block w-full h-full max-w-[100vw] min-h-[1000px] border-none pointer-events-auto"
            />
          </div>
        )}
      </div>

      {/* ============🚀 */}
      {(HTML || JS) && (
        <div className="flex flex-col gap-2 ">
          <div className="  border border-slate-500 rounded-md p-1">

            <h5>HTML</h5>
            <Editor
              height={htmlEditorHeight}
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
                scrollBeyondLastLine: false,
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
          </div>
          <div className="flex gap-2 w-full">
            <div className="flex flex-col gap-1 w-1/2   border border-slate-500 rounded-md p-1">
              <h5>SCSS</h5>
              <Editor
                height={scssEditorHeight}
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
                  scrollBeyondLastLine: false,
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
            </div>
            <div className="flex flex-col gap-1 w-1/2  border border-slate-500 rounded-md p-1">
              <h5>JS</h5>
              <Editor
                height={jsEditorHeight}
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
                  scrollBeyondLastLine: false,
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
              />
            </div>
          </div>
        </div>
      )}
    </>

  );
}


