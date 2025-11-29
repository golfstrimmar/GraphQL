"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./ModalMessage.scss";

interface ModalMessageProps {
  message: string;
  open: boolean;
  isModalOpen: boolean;
}

const ModalMessage: React.FC<ModalMessageProps> = ({ message, open }) => {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="modal-message"
          initial={{
            opacity: 0,
            scale: 0.1,
          }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          exit={{
            opacity: 0,
            scale: 0.1,
            transition: { duration: 0.3 },
          }}
        >
          <div className="modalmessage fixed top-0 left-0  flex justify-center  items-center inset-0 bg-black/60 backdrop-blur-sm z-7000  rounded-lg w-[100vw] h-[100vh]">
            <div className="modalmessage-inner">
              <p className="modalmessage-message">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalMessage;
