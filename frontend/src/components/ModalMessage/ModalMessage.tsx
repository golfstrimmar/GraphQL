"use client";
import { motion } from "framer-motion";
import "./ModalMessage.scss";

interface ModalMessageProps {
  message: string;
  variant?: "success" | "error";
}

const ModalMessage: React.FC<ModalMessageProps> = ({
  message,
  variant = "success",
}) => {
  const isSuccess = variant === "success";

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
        <div
          className={
            "flex items-center gap-[10px] px-[10px] py-[5px] rounded-2xl border-2 " +
            (isSuccess
              ? "bg-[var(--teal-light)] border-[var(--teal)]"
              : "bg-red-50 border-red-500")
          }
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className={
              "w-8 h-8 block " +
              (isSuccess ? "text-[var(--teal)]" : "text-red-500")
            }
          >
            {isSuccess ? (
              // чек
              <path
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                clipRule="evenodd"
                fillRule="evenodd"
              />
            ) : (
              // крестик / error
              <path
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm2.12-10.12a.75.75 0 0 0-1.06-1.06L10 8.94 8.94 7.88a.75.75 0 1 0-1.06 1.06L8.94 10l-1.06 1.06a.75.75 0 0 0 1.06 1.06L10 11.06l1.06 1.06a.75.75 0 0 0 1.06-1.06L11.06 10l1.06-1.12Z"
                clipRule="evenodd"
                fillRule="evenodd"
              />
            )}
          </svg>

          <p
            className={
              (isSuccess ? "text-[var(--teal)]" : "text-red-600") +
              " !text-[24px] !italic"
            }
          >
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ModalMessage;
