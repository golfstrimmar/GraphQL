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
import { findNodeByKey } from "@/utils/findNodeByKey";
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
    <div className="w-full mt-2">
      <div
        ref={projectsRef}
        className="flex items-center  gap-2   transition-all duration-200"
      >
        <button
          onClick={() => setOpenCreate(!openCreate)}
          className={` h-6  btn  btn-primary  h-[24px] text-[#ffffff] text-[12px] flex items-center gap-2  ${openCreate ? "admin-shimmer" : ""}`}
        >
          {/* <CreateIcon width={16} height={16} /> */}

          <span className={`nowrap`}> Create New Ulon Project from Canvas</span>
        </button>
        <AnimatePresence>
          {openCreate && (
            <motion.form
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              className="  bg-slate-400  rounded-lg !max-h-[24px] p-1 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="input-field-mod"

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
