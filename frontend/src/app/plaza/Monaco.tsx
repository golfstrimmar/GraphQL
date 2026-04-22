"use client";
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import formatStyleString from "@/app/plaza/forStyleComponent/formatStyleString";
import Editor, { useMonaco } from "@monaco-editor/react";


// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function Monaco({ text, setText }: { text: string, setText: (text: string) => void }) {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
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
    setTimeout(() => {
      const action = editor.getAction("editor.action.formatDocument");
      action?.run();
    }, 0);
  };

  // ====>====>====>====>====>====>====>====>====>====>




  return (
    <div className="border border-slate-200 rounded overflow-hidden h-full w-full">
      <Editor
        height="100%"
        language="scss"
        value={formatStyleString(text)}
        onChange={(value) => setText(value || "")}
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
  );
}

