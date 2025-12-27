"use client";
import React, { useRef, useEffect, useState } from "react";

type ProjectData = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>; // ✅ сюда пойдут src, alt и т.п.
  children: ProjectData[] | string;
};

interface ClassComponentProps {
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  node: ProjectData;
  updateNodeByKey: (
    nodes: ProjectData | ProjectData[],
    key: string,
    changes: Partial<ProjectData>,
  ) => ProjectData | ProjectData[];
  itemClass: string;
}

const ClassComponent: React.FC<ClassComponentProps> = ({
  project,
  setProject,
  node,
  updateNodeByKey,
  itemClass,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ================================
  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const formatClassForDisplay = (raw: string): string => {
    // Если уже есть переносы — пользователь редактировал вручную
    if (raw.includes("\n")) return raw;

    const trimmed = raw.trim();
    if (!trimmed) return "";

    const hasTrailingSemicolon = trimmed.endsWith(";");
    const clean = hasTrailingSemicolon ? trimmed.slice(0, -1) : trimmed;

    const properties = clean
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((prop) => {
        const colonIndex = prop.indexOf(":");
        if (colonIndex === -1) return prop;
        const key = prop.slice(0, colonIndex).trim();
        const value = prop.slice(colonIndex + 1).trim();
        return `${key}: ${value}`;
      });

    // Используем реальный \n — React и textarea его правильно отобразят
    return properties.join(";\n") + (hasTrailingSemicolon ? ";" : "");
  };
  // ================================

  const [classText, setClassText] = useState(
    node?.class ? formatClassForDisplay(node.style) : "",
  );

  useEffect(() => {
    setClassText(node?.class ? formatClassForDisplay(node.class) : "");
  }, [node?._key, node?.class]);

  // дебаунс обновления project
  useEffect(() => {
    if (!node?._key) return;

    const id = setTimeout(() => {
      const updatedProject = updateNodeByKey(project, node._key, {
        class: classText,
      });
      setProject(updatedProject as ProjectData);
    }, 1000);

    return () => clearTimeout(id);
  }, [classText, node?._key]);

  // ================================
  return (
    <div className="bg-white relative rounded ml-[50px] flex mt-4">
      <p className={itemClass}>Class:</p>
      <input
        ref={(el) => {
          if (!el) return;
          textareaRef.current = el;
          adjustHeight(el);
        }}
        value={classText}
        onChange={(e) => {
          setClassText(e.target.value);
        }}
        className="textarea-styles"
      />
    </div>
  );
};

export default ClassComponent;
