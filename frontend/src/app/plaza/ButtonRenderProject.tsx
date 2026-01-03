"use client";
import React, { useEffect, useRef } from "react";
import { useMutation, useLazyQuery } from "@apollo/client";
import { FIND_PROJECT } from "@/apollo/queries";
import { UPDATE_PROJECT } from "@/apollo/mutations";
import { useStateContext } from "@/providers/StateProvider";
import { ensureNodeKeys } from "./ensureNodeKeys";
import { removeKeys } from "./removeKeys";

type ProjectData = {
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
  const { updateHtmlJson, htmlJson, setModalMessage } = useStateContext();

  const [
    loadProject,
    { data: dataProject, loading: loadingProject, error: errorProject },
  ] = useLazyQuery(FIND_PROJECT, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
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
  const [
    updateProject,
    { loading: updateProjectLoading, error: updateProjectError },
  ] = useMutation(UPDATE_PROJECT, {
    variables: { projectId: project.id, data: removeKeys(htmlJson) },
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      setModalMessage(`Project ${project.name} updated successfully.`);
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
    <>
      <button
        className="project-item max-w-[200px]"
        onClick={() => addToHtmlJson()}
        type="button"
      >
        {loadingProject ? "...loading" : project?.name}
      </button>
      <button
        className="btn btn-empty mx-2 p-1 text-[12px]"
        onClick={() => {
          updateProject();
        }}
        type="button"
      >
        {updateProjectLoading ? "...loading" : "Update"}
      </button>
    </>
  );
}
