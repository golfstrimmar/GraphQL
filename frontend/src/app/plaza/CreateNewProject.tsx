"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation } from "@apollo/client";
import { CREATE_PROJECT } from "@/apollo/mutations";
import { GET_ALL_PROJECTS_BY_USER } from "@/apollo/queries";
import Input from "@/components/ui/Input/Input";
import CreateIcon from "@/components/icons/CreateIcon";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { removeKeys } from "./utils/removeKeys";

const CreateNewProject = () => {
  const { htmlJson, user, setModalMessage, ScssMixVar, activeKey } =
    useStateContext();

  const [newProjectName, setNewProjectName] = useState<string>("");
  const projectsRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  // ------
  const [createProject, { loading: createLoading }] = useMutation(
    CREATE_PROJECT,
    {
      refetchQueries: [GET_ALL_PROJECTS_BY_USER],
      awaitRefetchQueries: true,
    },
  );
  // ------
  useEffect(() => {
    if (!activeKey) {
      setOpenCreate(false);
      return;
    }
    setOpenCreate(true);
  }, [activeKey]);
  // ------
  function findNodeByKey(
    tree: HtmlNode | HtmlNode[] | null,
    key: string | null,
  ): HtmlNode | null {
    if (!tree || !key) return null;

    const dfs = (node: HtmlNode): HtmlNode | null => {
      if (node._key === key) return node;

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          const found = dfs(child);
          if (found) return found;
        }
      }
      return null;
    };

    if (Array.isArray(tree)) {
      for (const root of tree) {
        const found = dfs(root);
        if (found) return found;
      }
      return null;
    }

    return dfs(tree);
  }
  // ------

  const createNewProject = async () => {
    if (!newProjectName || !user) {
      setModalMessage(" All fields are required.");
      return;
    }

    if (!htmlJson) {
      setModalMessage(" Data fields are required.");
      return;
    }

    let DataProject = [];
    if (!activeKey) {
      DataProject = htmlJson;
    } else {
      const node = findNodeByKey(htmlJson, activeKey);
      DataProject = node ? [node] : [];
    }

    const dataWithoutKeys = removeKeys(DataProject);
    try {
      await createProject({
        variables: {
          ownerId: user.id,
          name: newProjectName,
          data: dataWithoutKeys,
          scssMixVar: ScssMixVar,
        },
      });

      router.refresh();
      setOpenCreate(false);
      setModalMessage(`Project ${newProjectName} created.`);
      setNewProjectName("");
    } catch (error) {
      setModalMessage("Failed to create project.");
      console.error(error);
    }
  };
  // ------

  return (
    <div className="createnewproject">
      <hr className="bordered-2 border-slate-200 mt-2 mb-4" />
      <div
        ref={projectsRef}
        className="flex items-center gap-4 min-h-[40px]  transition-all duration-200"
      >
        <button
          onClick={() => setOpenCreate(!openCreate)}
          className=" h-6 flex items-center gap-2 btn  btn-primary font-bold text-slate-800"
        >
          <span className="text-white mr-2">
            <CreateIcon />
          </span>

          {!openCreate ? "⇨" : "⇦"}
        </button>
        <AnimatePresence>
          {openCreate && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: 10 }}
              animate={{ width: "auto", opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="grid grid-cols-[1fr_max-content] gap-2 flex-1"
            >
              <Input
                typeInput="text"
                data="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <button
                type="button"
                className="btn  btn-primary font-bold text-slate-800  disabled:opacity-50"
                onClick={createNewProject}
                disabled={createLoading}
              >
                {createLoading ? "Creating..." : "Create Project"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateNewProject;
