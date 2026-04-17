"use client";
import React, { useEffect, useRef } from "react";
import { useMutation, useLazyQuery } from "@apollo/client";
import { FIND_PROJECT, GET_JSON_DOCUMENT } from "@/apollo/queries";
import { UPDATE_PROJECT } from "@/apollo/mutations";
import { useStateContext } from "@/providers/StateProvider";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import { removeKeys } from "./utils/removeKeys";
import Spinner from "@/components/icons/Spinner";
import { useQuery } from "@apollo/client";
type ProjectData = {
  id?: number; // или string, если так в API
  name?: string;
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  _key?: string;
  children: ProjectData[] | string;
};

export default function ButtonRenderProject({
  project,
}: {
  project: ProjectData;
}) {
  const { updateHtmlJson, htmlJson, showModal } = useStateContext();
  const { refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name: "" },
    skip: true,
    fetchPolicy: "no-cache",
  });
  // ====>====>====>====>====>====>====>====>====>====>
  // список маркеров, по которым подтягиваем стили
  const STYLE_KEYS = [
    "input-f",
    "input-svg",
    "f-number",
    "input-check",
    "custom-select",
    "input-datalist",
    "mod-popup",
    "search-f",
    "_range-wrap-js",
    "field-rating",
    "field-t",
  ];

  // мапа "класс → имя документа со стилем"
  const STYLE_DOC_MAP: Record<string, string> = {
    "input-f": "style-input-field",
    "input-svg": "style-input-svg",
    "input-check": "style-check",
    "custom-select": "style-select",
    "input-datalist": "style-datalist",
    "mod-popup": "style-modal",
    "search-f": "style-search",
    "_range-wrap-js": "style-range",
    "field-rating": "style-rating",
    "field-t": "style-textarea",
  };
  function collectStyleKeysFromProject(nodes: ProjectData[]): Set<string> {
    const result = new Set<string>();

    const visit = (node: ProjectData | string) => {
      if (typeof node === "string") return;
      if (node.class) {
        const classes = node.class.split(/\s+/);
        for (const cls of classes) {
          if (STYLE_KEYS.includes(cls)) {
            result.add(cls);
          }
        }
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    };

    nodes.forEach(visit);
    return result;
  }
  async function loadStylesForClasses(
    classKeys: Set<string>,
  ): Promise<ProjectData[]> {
    const styles: ProjectData[] = [];

    for (const cls of classKeys) {
      const docName = STYLE_DOC_MAP[cls];
      if (!docName) continue;

      const { data } = await refetchJson({ name: docName });
      const content = data?.jsonDocumentByName?.content;
      if (!content) continue;

      styles.push(...(ensureNodeKeys(content) as ProjectData[]));
    }

    return styles;
  }

  // ====>====>====>====>====>====>====>====>====>====>
  const [
    loadProject,
    { data: dataProject, loading: loadingProject, error: errorProject },
  ] = useLazyQuery(FIND_PROJECT, {
    fetchPolicy: "cache-and-network",
    onCompleted: async (data) => {
      if (!data?.findProject?.data) return;

      const projectNodes: ProjectData[] = data.findProject.data;
      const projectWithKeys = ensureNodeKeys(projectNodes) as ProjectData[];

      // 1. собираем класс-маркеры из проекта
      const classKeys = collectStyleKeysFromProject(projectWithKeys);

      // 2. грузим стили под эти классы
      const stylesNodes = await loadStylesForClasses(classKeys);

      // 3. кладём сначала проект, потом стили (или наоборот — как тебе нужно)
      updateHtmlJson((prev: ProjectData[] | null) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [...safePrev, ...projectWithKeys, ...stylesNodes];
      });
    },
    onError: () => {
      console.log("<=== errorProject ===>", errorProject);
    },
  });

  // -----
  const [
    updateProject,
    { loading: updateProjectLoading, error: updateProjectError },
  ] = useMutation(UPDATE_PROJECT, {
    variables: { projectId: project.id, data: removeKeys(htmlJson) },
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      showModal(`Project ${project.name} updated successfully.`);
    },
    onError: (error) => {
      console.log("<=== updateProjectError ===>", updateProjectError);
    },
  });
  // -----
  const addToHtmlJson = () => {
    if (!project?.id) return;

    loadProject({ variables: { id: Number(project.id) } });
  };
  // -----

  // -----
  return (
    <div className="grid grid-cols-[1fr_60px] gap-2">
      <button
        className="project-item min-w-[200px] text-[12px] flex justify-center"
        onClick={() => addToHtmlJson()}
        type="button"
      >
        {loadingProject ? <Spinner /> : project?.name}
      </button>
      <button
        className="btn btn-empty mx-1 p-1 text-[10px] flex justify-center"
        onClick={() => {
          updateProject();
        }}
        type="button"
      >
        {updateProjectLoading ? <Spinner /> : "Update"}
      </button>
    </div>
  );
}
