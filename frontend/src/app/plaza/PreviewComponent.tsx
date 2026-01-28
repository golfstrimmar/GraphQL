"use client";
import React, { useState, useRef, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import PageHeader from "./PageHeader";
import CustomSlider from "@/components/ui/CustomSlider/CustomSlider";
import Editor, { useMonaco } from "@monaco-editor/react";

//=== 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
export default function PreviewComponent() {
  const { preview, HTML, SCSS, setSCSS, setHTML } = useStateContext();
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRefHtml = useRef<ReturnType<typeof setTimeout> | null>(null);
  const htmlEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );
  const scssEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );

  const [code, setCode] = useState<string>("");
  const [codeCss, setCodeCss] = useState<string>("");
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

  const styledHTML = `
    <style>
      ${SCSS || ""}
    </style>
    ${HTML || ""}
  `;

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

        {/*<div className="mt-4 mb-2">
          <CustomSlider
            value={scale}
            min={0.1}
            max={2}
            step={0.1}
            onChange={setScale}
          />
        </div>*/}
        {HTML && (
          <div className="max-w-[100vw] max-h-[500px] overflow-auto custom-scrollbar  border-2   border-[var(--teal)]">
            {HTML && (
              <div
                className="preview-html"
                dangerouslySetInnerHTML={{ __html: styledHTML }}
              />
            )}
          </div>
        )}
      </div>
      {/* ============🚀 */}
      {HTML && (
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
              formatOnPaste: true,
              formatOnType: true,
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
      )}
    </>
  );
}
