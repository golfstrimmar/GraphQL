"use client";
import { motion } from "framer-motion";
import "./ModalMessage.scss";

interface ModalMessageProps {
  message: string;
}

const ModalMessage: React.FC<ModalMessageProps> = ({ message }) => {
  return (
    <motion.div
      key="modal-message"
      initial={{ opacity: 0, scale: 0.2 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.1, transition: { duration: 0.2 } }}
      transition={{ duration: 0.2 }}
      className="modalmessage fixed inset-0 z-[7000] flex items-center justify-center bg-black/60 backdrop-blur-sm w-[100vw] h-[100vh]"
    >
      <div className="modalmessage-inner">
        <p className="modalmessage-message">{message}</p>
      </div>
    </motion.div>
  );
};

export default ModalMessage;
