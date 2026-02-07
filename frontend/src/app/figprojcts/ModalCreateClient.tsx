"use client";
import React, { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import Input from "@/components/ui/Input/Input";
import { CREATE_DESIGN } from "@/apollo/mutations";
import Spinner from "@/components/icons/Spinner";
// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function ModalCreateClient({ modalOpen, setModalOpen }) {
  const router = useRouter();
  const { user, setModalMessage } = useStateContext();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [figmaUrl, setFigmaUrl] = useState<string>("");
  const [hover, setHover] = useState(false);
  //   // -----------------------
  const [createDesigne, { loading }] = useMutation(CREATE_DESIGN, {
    onCompleted: () => {
      setModalMessage("Figma Project created successfully");
    },
  });
  // ---------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user === null || name === "" || figmaUrl === "") {
      setModalMessage("All fields are required.");
      return;
    }

    // 2. Парсим JSON
    // let json;
    // try {
    //   json = JSON.parse(text);
    // } catch (e) {
    //   console.error("Invalid JSON file", e);
    //   setModalMessage("Invalid JSON file");
    //   return;
    // }

    try {
      const { data } = await createDesigne({
        variables: {
          ownerId: user?.id,
          name: name,
          figmaUrl: figmaUrl,
        },
      });

      if (data.createDesigne) {
        console.log(
          `✅ Figma Project ${data.createDesigne.name} created successfully`,
          data.createDesigne.name,
        );
        setModalOpen(false);
        router.refresh();
        setName("");
        setFigmaUrl("");
      }
    } catch (err: any) {
      setModalOpen(false);
      setModalMessage(err.message);
    }
  };

  // ---------------

  return (
    <AnimatePresence>
      {modalOpen && (
        <div onClick={() => setModalOpen(false)}>
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full "
            onClick={(e) => {
              e.stopPropagation();
              if (
                !e.target.closest(".modal-content") &&
                !e.target.classList.contains("modal-content")
              ) {
                setModalOpen(false);
              }
            }}
          >
            {/*<button className="absolute top-2 right-2 z-3000">
                <Image
                  src="./svg/cross.svg"
                  alt="close"
                  width={20}
                  height={20}
                  onClick={() => setModalOpen(false)}
                />
              </button>*/}
            <form
              onSubmit={handleSubmit}
              className="modal-content flex flex-col  bg-slate-400 p-6 rounded-lg w-full gap-4"
            >
              <div className="flex flex-col gap-2">
                <input
                  id="figma-json-file"
                  type="file"
                  style={{ display: "none" }}
                  accept=".json"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <div className="text text-slate-500">
                  {file ? file.name : "No file selected"}
                </div>
                <label
                  htmlFor="figma-json-file"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer shadow-sm bg-slate-100 hover:bg-slate-300"
                >
                  {file ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Change file
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Choose file
                    </>
                  )}
                </label>
              </div>
              <Input
                typeInput="text"
                id="name"
                data="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                classInput="modalInput"
              />
              <Input
                typeInput="text"
                id="name"
                data="FigmaUrl"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                classInput="modalInput"
              />
              <div className="flex gap-2">
                <button
                  className="btn btn-primary "
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : "Save"}
                </button>
                <button
                  className="btn btn-allert"
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setName("");
                    setModalOpen(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
