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
import type { HtmlNode } from "@/types/HtmlNode";

// ====🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
const CreateNewProject = () => {
  const { htmlJson, user, showModal, ScssMixVar, activeKey } =
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
      showModal(" All fields are required.", "error");
      return;
    }

    if (!htmlJson) {
      showModal(" Data fields are required.", "error");
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
      showModal(`Project ${newProjectName} created.`);
      setNewProjectName("");
    } catch (error) {
      showModal("Failed to create project.", "error");
      console.error(error);
    }
  };
  // ------

  return (
    <div className="w-full">
      <div
        ref={projectsRef}
        className="flex items-center  gap-2   transition-all duration-200"
      >
        <button
          onClick={() => setOpenCreate(!openCreate)}
          className={` h-6  btn  btn-primary w-[28px] h-[18px] text-[#ffffff]  ${openCreate ? "admin-shimmer" : ""}`}
        >
          <CreateIcon width={14} height={14} />
        </button>
        <AnimatePresence>
          {openCreate && (
            <motion.form
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              className="  bg-slate-400  rounded-lg !max-h-[24px] p-1 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="!w-full !h-10 cursor-pointer relative transition-all duration-200 ease-in-out border border-[#adadad] bg-slate-300 !outline-none focus:!outline-none rounded-[5px] focus:bg-slate-100  [&:not(:placeholder-shown)]:bg-slate-100  !px-2.5 !py-0 !max-h-[22px] z-[2]"

              />
              <button
                type="button"
                className="btn  btn-primary max-h-[20px] font-bold text-slate-800 ease-in-out  disabled:opacity-50 "
                onClick={createNewProject}
                disabled={createLoading}
              >
                {createLoading ? <Spinner /> : "Save"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateNewProject;
