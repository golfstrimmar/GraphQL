"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import findNodeByKey from "@/utils/plaza/findNodeByKey";
import { motion, AnimatePresence } from "framer-motion";
import СhevronRight from "@/components/icons/СhevronRight";
import StyleComponent from "./ForInfo/StyleComponent";
import ClassComponent from "./ForInfo/ClassComponent";
import TextComponent from "./ForInfo/TextComponent";
import TagComponent from "./ForInfo/TagComponent";
import { useHtmlFromJson } from "@/hooks/useHtmlFromJson";
import { useScssFromJson } from "@/hooks/useScssFromJson";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation } from "@apollo/client";
import { CREATE_PROJECT } from "@/apollo/mutations";
import { GET_ALL_PROJECTS_BY_USER } from "@/apollo/queries";
import Input from "@/components/ui/Input/Input";
import CreateIcon from "@/components/icons/CreateIcon";
import { useRouter } from "next/navigation";
type ProjectData = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>; // ✅ сюда пойдут src, alt и т.п.
  children: ProjectData[] | string;
};

interface InfoProjectProps {
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  project: ProjectData;
  setOpenInfoKey: React.Dispatch<React.SetStateAction<string>>;
  openInfoKey: string;
  setModalTextsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editMode: boolean;
}
interface InfoProjectProps {
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
}
const NodeInfo: React.FC<InfoProjectProps> = ({
  NodeToSend,
  openInfoModal,
  setOpenInfoModal,
  setNodeToSend,
  flagRemProjec,
}) => {
  const router = useRouter();
  const { setModalMessage, user, flagRemProject } = useStateContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [Open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!flagRemProject) return;
    setNodeToSend("");
    setOpenInfoModal(false);
  }, [flagRemProject]);

  const [createProject, { loading: createLoading }] = useMutation(
    CREATE_PROJECT,
    {
      refetchQueries: [GET_ALL_PROJECTS_BY_USER],
      awaitRefetchQueries: true,
    },
  );
  const projectData: ProjectData[] = [NodeToSend];
  const createNewProject = async () => {
    if (!newProjectName || !user) {
      setModalMessage(" All fields are required.");
      return;
    }
    if (!NodeToSend) {
      setModalMessage(" Data fields are required.");
      return;
    }

    try {
      await createProject({
        variables: {
          ownerId: user.id,
          name: newProjectName,
          data: projectData,
        },
      });
      router.refresh();

      setModalMessage(`Project ${newProjectName} created.`);
      setNewProjectName("");
    } catch (error) {
      setModalMessage("Failed to create project.");
      console.error(error);
    }
  };
  useEffect(() => {
    if (!NodeToSend) return;
    console.log("<===NodeToSend===>", NodeToSend);
  }, [NodeToSend]);

  const itemStyle =
    "flex flex-col items-start justify-center p-2 m-1 border border-gray-300 rounded bg-gray-100 text-sm";

  return (
    <AnimatePresence mode="wait">
      {openInfoModal && (
        <motion.div
          key="info-project"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.1, ease: [0.25, 0.8, 0.5, 1] }}
          className="bg-navy rounded shadow-xl p-1  border border-slate-200  bottom-0 right-0 transform w-[calc(100vw-20px)]  fixed  z-5000"
        >
          <div className="grid grid-cols-[repeat(3_,max-content)_1fr_2fr] relative rounded border-2 border-[var(--teal)] p-1 text-[#000] h-full">
            <div className="flex flex-col gap-1 mt-2">
              <button
                onClick={() => setOpen(!Open)}
                className=" h-6 flex items-center gap-1 btn  btn-primary font-bold text-slate-800"
              >
                {!Open ? "⇨" : "⇦"}
                <span className="text-white ">
                  <CreateIcon />
                </span>
              </button>
              <AnimatePresence mode="wait">
                {Open && (
                  <motion.form
                    key="info-project"
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={{ duration: 0.1, ease: [0.25, 0.8, 0.5, 1] }}
                    className="flex flex-col mt-2  gap-1 max-w-[140px]"
                  >
                    <Input
                      typeInput="text"
                      data="Project name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                    <button
                      className="btn btn-teal text-[12px] text-white"
                      onClick={() => createNewProject()}
                    >
                      {createLoading ? "Creating..." : "Save"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
            {/*<button
              onClick={() => setOpenInfoModal(false)}
              className="absolute  -top-3 border   bg-slate-200 hover:bg-slate-300 transition-all duration-200   btn-teal w-[90%] left-[50%] translate-x-[-50%] !p-0.5"
            >
              <div className="w-full h-4  center border-2 border-[var(--teal)] rounded bg-[var(--teal-light)]">
                <СhevronRight width={10} height={10} />
              </div>
            </button>*/}
            <p className={itemStyle}>{NodeToSend?.tag}</p>
            <p className={itemStyle}>{NodeToSend?.class}</p>
            <p className={itemStyle}>{NodeToSend?.text}</p>
            <p className={itemStyle}>{NodeToSend?.style}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NodeInfo;
