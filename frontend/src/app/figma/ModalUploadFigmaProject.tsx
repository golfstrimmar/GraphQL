"use client";
import React, { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMutation } from "@apollo/client";
import { UPLOAD_FIGMA_JSON_PROJECT } from "@/apollo/mutations";
const ModalUploadFigmaProject: React.FC = ({
  modalOpen,
  setModalOpen,
  setColors,
  setFonts,
  setTexts,
  allProjects,
  setAllProjects,
}) => {
  /////////----Mutation
  const [uploadFigmaJsonProject, { loading }] = useMutation(
    UPLOAD_FIGMA_JSON_PROJECT,
  );
  //////////////////
  const { setModalMessage, user } = useStateContext();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  //////////////////
  const handleUpload = async () => {
    if (!user) {
      setModalMessage("You are not logged in.");
      return;
    }
    if (!file) {
      setModalMessage("Please select a file.");
      return;
    }
    if (name.length === 0) {
      setModalMessage("Please enter a name.");
      return;
    }
    // Открываем FileReader
    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result;
      if (typeof result !== "string") return;

      const jsonContent = JSON.parse(result);
      const { data } = await uploadFigmaJsonProject({
        variables: { ownerId: user.id, name, jsonContent },
      });
      if (data) {
        setModalOpen(false);
      }
      setColors(data.uploadFigmaJsonProject.colors);
      setFonts(data.uploadFigmaJsonProject.fonts);
      setTexts(data.uploadFigmaJsonProject.textNodes);
      setAllProjects(() => {
        return [
          ...allProjects,
          {
            id: data.uploadFigmaJsonProject.project.id,
            name: data.uploadFigmaJsonProject.project.name,
          },
        ];
      });
    };

    reader.readAsText(file);
  };
  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-500 p-2"
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="modal-content bg-navy rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Upload Project</h3>
                  <p className="text-sm text-white/80 mt-1">
                    Import your Figma JSON file
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-navy/20 hover:bg-navy/30 flex items-center justify-center transition-colors"
                >
                  <Image
                    src="/svg/cross.svg"
                    alt="close"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project File
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  accept=".json"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter project name"
                />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  handleUpload();
                  e.preventDefault();
                }}
                className="btn btn-primary w-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Uploading..." : "Upload Project"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalUploadFigmaProject;
