"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
import CreateIcon from "@/components/icons/CreateIcon";
const ModalCreateClient = dynamic(() => import("./ModalCreateClient"), {
  ssr: false,
  loading: () => <Loading />,
});

const ModalCreateFigmaProject = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 mb-2 w-full mt-[30px] bg-navy rounded-2xl shadow-xl p-2   border border-slate-200 ">
      <button
        className=" h-6 flex items-center gap-2 btn  btn-primary font-bold text-slate-800"
        onClick={() => setModalOpen(!modalOpen)}
      >
        {!modalOpen ? (
          <span className="text-white mr-2">
            <CreateIcon />
          </span>
        ) : null}

        {!modalOpen ? "Create Figma Project ⇨" : "⇦"}
      </button>

      <ModalCreateClient modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </div>
  );
};
export default ModalCreateFigmaProject;
