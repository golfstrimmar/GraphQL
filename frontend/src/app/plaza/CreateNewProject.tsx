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
import Spinner from "@/components/icons/Spinner";
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
        className="flex flex-col  gap-4 min-h-[40px]  transition-all duration-200"
      >
        <button
          onClick={() => setOpenCreate(!openCreate)}
          className=" h-6 flex items-center gap-2 btn  btn-primary font-bold text-slate-800"
        >
          {/*<span className=" mr-2 text-slate-800">
            <CreateIcon width={18} height={18} />
          </span>*/}

          {!openCreate ? "Save as new Ulon project" : "⇧"}
        </button>
        <AnimatePresence>
          {openCreate && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full  flex-1 bg-slate-400 p-1 rounded-lg"
            >
              <form className="w-full">
                <Input
                  typeInput="text"
                  data="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <button
                  type="button"
                  className="btn  btn-primary font-bold text-slate-800  disabled:opacity-50 mt-2"
                  onClick={createNewProject}
                  disabled={createLoading}
                >
                  {createLoading ? <Spinner /> : "Save"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateNewProject;
