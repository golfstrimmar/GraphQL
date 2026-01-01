"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation } from "@apollo/client";
import { CREATE_PROJECT } from "@/apollo/mutations";
import { GET_ALL_PROJECTS_BY_USER } from "@/apollo/queries";
import Input from "@/components/ui/Input/Input";
import CreateIcon from "@/components/icons/CreateIcon";
import { motion, AnimatePresence } from "framer-motion";

type HtmlNode = {
  tag: string;
  class?: string;
  text?: string;
  style?: string;
  children?: HtmlNode[];
  attributes?: Record<string, any>;
};

type FigmaImageInput = {
  fileName: string;
  filePath: string;
  nodeId: string;
  imageRef: string;
  type: "RASTER";
  fileKey: string;
};
const CreateNewProject = () => {
  const { htmlJson, user, setModalMessage, ScssMixVar } = useStateContext();
  const [newProjectName, setNewProjectName] = useState<string>("");
  const variables = useMemo(() => ({ userId: user?.id }), [user?.id]);
  const projectsRef = useRef<HTMLDivElement | null>(null);

  const [createProject, { loading: createLoading }] = useMutation(
    CREATE_PROJECT,
    {
      refetchQueries: [{ query: GET_ALL_PROJECTS_BY_USER, variables }],
      awaitRefetchQueries: true,
    },
  );

  const createNewProject = async () => {
    if (!newProjectName || !user) {
      setModalMessage(" All fields are required.");
      return;
    }
    if (!htmlJson || !htmlJson.children || htmlJson.children.length === 0) {
      setModalMessage(" Data fields are required.");
      return;
    }

    try {
      await createProject({
        variables: {
          ownerId: user.id,
          name: newProjectName,
          data: htmlJson,
          scssMixVar: ScssMixVar,
        },
      });
      setOpenCreate(false);
      setModalMessage(`Project ${newProjectName} created.`);
      setNewProjectName("");
    } catch (error) {
      setModalMessage("Failed to create project.");
      console.error(error);
    }
  };
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  return (
    <div className="createnewproject">
      <hr className="bordered-2 border-slate-200 mt-2 mb-4" />
      <div ref={projectsRef} className=" transition-all duration-200">
        <div className=" ">
          <button
            onClick={() => setOpenCreate(!openCreate)}
            className=" h-6 flex items-center gap-2 btn  btn-primary font-bold text-slate-800"
          >
            <span className="text-white mr-2">
              <CreateIcon />
            </span>
            {!openCreate ? "Create new project" : "Close modal"}
          </button>
        </div>
        <AnimatePresence>
          {openCreate && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="grid grid-cols-[1fr_max-content] gap-2 w-full mt-4"
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
