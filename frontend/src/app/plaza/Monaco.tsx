"use client";
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import formatStyleString from "@/app/plaza/forStyleComponent/formatStyleString";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useStateContext } from "@/providers/StateProvider";


// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function Monaco({ text, setText }: { text: string, setText: (text: string) => void }) {
  const { setNewtextMarker } = useStateContext();
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const isReadyRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
  useEffect(() => {
    isReadyRef.current = false;
    const timer = setTimeout(() => {
      isReadyRef.current = true;
    }, 1000); // Даем 1 секунду на загрузку и авто-форматирование

    return () => clearTimeout(timer);
  }, [text]);
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

  const handleEditorMount = (editor: any, monaco: any) => {
    if (monaco) monaco.editor.setTheme("myCustomTheme");
    editor.setScrollTop(0);
    editor.revealLine(1);
    editorRef.current = editor;

    // Авто-форматирование при монтировании
    setTimeout(() => {
      const action = editor.getAction("editor.action.formatDocument");
      action?.run();

      // После того как форматирование отработало, через небольшую паузу 
      // разрешаем ставить маркер "изменено"
      setTimeout(() => {
        isReadyRef.current = true;
      }, 100);
    }, 0);
  };

  // ====>====>====>====>====>====>====>====>====>====>
  const handleOnChange = (value: string | undefined) => {
    // 1. Сразу ставим маркер (пользователь должен видеть реакцию мгновенно)
    if (isReadyRef.current) {
      setNewtextMarker(true);
    }

    // 2. Очищаем предыдущий таймер, если он был запущен
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 3. Запускаем новый таймер
    timerRef.current = setTimeout(() => {
      setText(value || "");
      console.log("State updated");
    }, 500);
  };



  return (
    <div className="border border-slate-200 rounded overflow-hidden h-full w-full">
      <Editor
        height="100%"
        language="scss"
        value={formatStyleString(text)}
        onChange={(value) => {
          const val = value || "";
          setText(val); // Обновляем текст мгновенно для плавности печати

          if (isReadyRef.current) {
            setNewtextMarker(true);
          }
        }}
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

