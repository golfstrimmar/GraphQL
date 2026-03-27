"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon"; import SlidersConstructor from "./SlidersConstructor";

interface ModalMessageProps {
  openModSliders: boolean;
  setOpenModSliders: (open: boolean) => void;
}
const ModSliders: React.FC<ModalMessageProps> = ({ openModSliders, setOpenModSliders }) => {
  return (
    <AnimatePresence>
      {openModSliders && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: [0.25, 0.8, 0.5, 1] }}
          className="w-[100vw] modalmessage h-[100vh] fixed top-0 left-0 flex justify-center items-center bg-[rgba(0,0,0,.98)] z-100 p-4"
        >
          <div className="flex items-center gap-[10px] px-[10px] py-[5px] rounded-2xl border-2 min-w-[98vw] min-h-[98vh]">
            <SlidersConstructor setOpenModSliders={setOpenModSliders} />
            <button className="w-4 h-4 block text-white absolute top-4 right-6 z-10000 hover:text-gray-500 cursor-pointer transition-colors duration-300"
              onClick={() => {
                setOpenModSliders(false);
              }}
            >
              <CloseIcon />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default ModSliders;