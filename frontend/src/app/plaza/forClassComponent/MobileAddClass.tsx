"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon";
import { useStateContext } from "@/providers/StateProvider";

import addClass from "@/app/plaza/forClassComponent/addClass";

const commonClasses = [
  "rev-on-scroll",
  "rev--up",
  "rev--down",
  "rev--left",
  "rev--right",
  "rev--zoom",
] as const;


const inputClasses = [
  "input-field-filled",
  "input-field-outlined",
  "input-field-standard",
] as const;

const directionClasses = [
  "rev--up",
  "rev--down",
  "rev--left",
  "rev--right",
  "rev--zoom",
] as const;

type DirectionClass = (typeof directionClasses)[number];



export default function MobileAddClass({
  activeClassKey,
  openMobile,
  setOpenMobile,
}: {
  activeClassKey: string;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
}) {


  // ===========================================================================
  const ItemClass =
    "flex flex-wrap gap-2 rounded-2xl shadow-xl p-4 bg-[var(--lightest-slate)] border border-slate-200 mt-4";

  return createPortal(
    <AnimatePresence>
      {openMobile && (
        <motion.div
          key="modal-class"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.1, transition: { duration: 0.2 } }}
          transition={{ duration: 0.2 }}
          className="bg-black/60 backdrop-blur-lg fixed w-[100vw] h-[100vh] overflow-y-scroll py-10 z-6050 top-0 left-0"
          onClick={(e) => {
            e.stopPropagation();
            if (!(e.target as HTMLElement).closest(".modal-inner")) {
              setOpenMobile(false);
            }
          }}
        >
          <button
            className="w-4 h-4 block text-white absolute top-4 right-6 z-10000 hover:text-gray-500 cursor-pointer transition-colors duration-300"
            onClick={() => setOpenMobile(false)}
          >
            <CloseIcon />
          </button>
          <div className="modal-inner bg-white p-4 max-w-[95%] mx-auto rounded-lg mt-10 shadow-2xl">



            <button className="btn btn-primary" onClick={() => {
              addClass("_filled", activeClassKey)
            }}>Add _filled</button>

            <button className="btn btn-primary" onClick={() => {
              addClass("_empty", activeClassKey)
            }}>Add _empty</button>



            {/* {findNodeByKey(htmlJson, activeClassKey)?.class?.includes("js-container-input") && <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "_filled"])
            }}>Add filled</button>}
             {findNodeByKey(htmlJson, activeClassKey)?.class?.includes("js-container-input") && <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "_empty"])
            }}>Add empty</button>}
            <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "style-reveal", "script-reveal", "rev--up", "rev-on-scroll"])
            }}>Add rev--up</button>
            <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "style-reveal", "script-reveal", "rev--down", "rev-on-scroll"])
            }}>Add rev--down</button>
            <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "style-reveal", "script-reveal", "rev--left", "rev-on-scroll"])
            }}>Add rev--left</button>
            <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "style-reveal", "script-reveal", "rev--right", "rev-on-scroll"])
            }}>Add rev--right</button>
            <button className="btn btn-primary" onClick={() => {
              setFlaClasses(true)
              setAddingClasses([...addingClasses, "style-reveal", "script-reveal", "rev--zoom", "rev-on-scroll"])
            }}>Add rev--zoom</button> */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

