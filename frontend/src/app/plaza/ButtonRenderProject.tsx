"use client";
import React, { useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { FIND_PROJECT } from "@/apollo/queries";
import { useStateContext } from "@/providers/StateProvider";

export default function ButtonRenderProject({ project }) {
  const { setModalMessage, setHtmlJson } = useStateContext();
  const [
    loadProject,
    { data: dataProject, loading: loadingProject, error: errorProject },
  ] = useLazyQuery(FIND_PROJECT, {
    fetchPolicy: "cache-and-network",
    // === CALLBACKS ===
    onCompleted: (data) => {
      console.log("<===data===>", data);
      // if (!data) return;
      console.log("<=== findProject===>", data.findProject);
      const result = data.findProject.data;
      if (!result) return;
      console.log("<=== result ===>", result);
      setHtmlJson((prev) => ({
        ...prev,
        children: [...(prev.children ?? []), ...result],
      }));
    },
    onError: () => {
      console.log("<=== errorProject ===>", errorProject);
    },
  });

  const addToHtmlJson = () => {
    if (!project?.id) return;
    loadProject({ variables: { id: Number(project.id) } });
  };

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
