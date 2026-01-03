"use client";
import React, { useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { FIND_PROJECT } from "@/apollo/queries";
import { useStateContext } from "@/providers/StateProvider";
import { ensureNodeKeys } from "./ensureNodeKeys";

type ProjectData = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>; // ✅ сюда пойдут src, alt и т.п.
  _key?: string;
  children: ProjectData[] | string;
};

export default function ButtonRenderProject({
  project,
}: {
  project: ProjectData;
}) {
  const { updateHtmlJson } = useStateContext();
  const [
    loadProject,
    { data: dataProject, loading: loadingProject, error: errorProject },
  ] = useLazyQuery(FIND_PROJECT, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      console.log("<===data===>", data);
      if (!data?.findProject?.data) return;

      const result: ProjectData[] = data.findProject.data;
      const resultWithKeys = ensureNodeKeys(result) as ProjectData[];

      updateHtmlJson((prev: ProjectData[] | null) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [...safePrev, ...resultWithKeys];
      });
    },

    onError: () => {
      console.log("<=== errorProject ===>", errorProject);
    },
  });
  // -----
  const addToHtmlJson = () => {
    if (!project?.id) return;
    loadProject({ variables: { id: Number(project.id) } });
  };
  // -----
  return (
    <button
      className="project-item max-w-[200px]"
      onClick={addToHtmlJson}
      type="button"
    >
      {loadingProject ? "...loading" : project.name}
    </button>
  );
}
