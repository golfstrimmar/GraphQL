"use client";
import React, { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import Input from "@/components/ui/Input/Input";
import { CREATE_FIGMA_PROJECT } from "@/apollo/mutations";
// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function ModalCreateClient({ modalOpen, setModalOpen }) {
  const router = useRouter();
  const { user, setModalMessage } = useStateContext();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [hover, setHover] = useState(false);
  //   // -----------------------
  const [createFigmaProject, { loading }] = useMutation(CREATE_FIGMA_PROJECT, {
    onCompleted: () => {
      setModalMessage("Figma Project created successfully");
    },
  });
  // ---------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (file === null || name === "") {
      setModalMessage("All fields are required.");
      return;
    }
    console.log("<===createFigmaProject===>", user.id, name, file);
    const text = await file.text();

    // 2. Парсим JSON
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("Invalid JSON file", e);
      setModalMessage("Invalid JSON file");
      return;
    }

    try {
      const { data } = await createFigmaProject({
        variables: {
          ownerId: user.id,
          name: name,
          fileCache: json,
        },
      });

      if (data.createFigmaProject) {
        setModalOpen(false);
        router.refresh();
        setName("");
        setFile(null);
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
              className="modal-content flex flex-col  bg-white p-6 rounded-lg w-full gap-4"
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
                  className=" px-[10px] py-1 text-[12px] rounded  cursor-pointer  text-[#193756]"
                  style={{
                    border: `1px solid ${hover ? "#007bff" : "rgb(173, 173, 173)"}`,
                  }}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                >
                  {file ? "Change file" : "Choose file"}
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
              <div className="flex gap-2">
                <button
                  className="btn btn-primary "
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn btn-allert"
                  type="button"
                  onClick={() => setModalOpen(false)}
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

// "use client";
// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { AnimatePresence, motion } from "framer-motion";
// import Input from "@/components/ui/Input/Input";
// import { useStateContext } from "@/providers/StateProvider";
// import { CREATE_FIGMA_PROJECT } from "@/apollo/mutations";
// import { useMutation } from "@apollo/client";
// import FProject from "@/types/FProject";

// interface ModalCreateFigmaProjectProps {
//   modalOpen: boolean;
//   setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
//   setAllProjects: React.Dispatch<React.SetStateAction<FProject[] | null>>;
// }

// const ModalCreateFigmaProject: React.FC<ModalCreateFigmaProjectProps> = ({
//   modalOpen,
//   setModalOpen,
//   setAllProjects,
// }) => {
//   const { user } = useStateContext();
//   const router = useRouter();
//   const { setModalMessage } = useStateContext();
//   const [file, setFile] = useState<File | null>(null);
//   const [name, setName] = useState<string>("");
//   const [hover, setHover] = useState(false);
//   // -----------------------
//   const [createFigmaProject, { loading }] = useMutation(CREATE_FIGMA_PROJECT, {
//     onCompleted: () => {
//       setModalMessage("Figma Project created successfully");
//     },
//   });
//   // -----------------------
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (file === null || name === "") {
//       setModalMessage("All fields are required.");
//       return;
//     }
//     console.log("<===createFigmaProject===>", user.id, name, file);
//     const text = await file.text();

//     // 2. Парсим JSON
//     let json;
//     try {
//       json = JSON.parse(text);
//     } catch (e) {
//       console.error("Invalid JSON file", e);
//       setModalMessage("Invalid JSON file");
//       return;
//     }

//     try {
//       const { data } = await createFigmaProject({
//         variables: {
//           ownerId: user.id,
//           name: name,
//           fileCache: json,
//         },
//       });

//       if (data.createFigmaProject) {
//         setAllProjects((prev) => {
//           if (!prev.find((p) => p.id === data.createFigmaProject.id)) {
//             return [...prev, data.createFigmaProject];
//           }
//           return prev;
//         });
//         setModalOpen(false);
//         router.refresh();
//         setName("");
//         setFile(null);
//       }
//     } catch (err: any) {
//       setModalOpen(false);
//       setModalMessage(err.message);
//     }
//   };

//   return (
//     <AnimatePresence>
//       {modalOpen && (
//         <div onClick={() => setModalOpen(false)}>
//           <motion.div
//             initial={{ height: 0, opacity: 0, y: -10 }}
//             animate={{ height: "auto", opacity: 1, y: 0 }}
//             exit={{ height: 0, opacity: 0, y: -10 }}
//             transition={{ duration: 0.2, ease: "easeInOut" }}
//             className="w-full "
//             onClick={(e) => {
//               e.stopPropagation();
//               if (
//                 !e.target.closest(".modal-content") &&
//                 !e.target.classList.contains("modal-content")
//               ) {
//                 setModalOpen(false);
//               }
//             }}
//           >
//             {/*<button className="absolute top-2 right-2 z-3000">
//               <Image
//                 src="./svg/cross.svg"
//                 alt="close"
//                 width={20}
//                 height={20}
//                 onClick={() => setModalOpen(false)}
//               />
//             </button>*/}
//             <form
//               onSubmit={handleSubmit}
//               className="modal-content flex flex-col  bg-white p-6 rounded-lg w-full gap-4"
//             >
//               <div className="flex flex-col gap-2">
//                 <input
//                   id="figma-json-file"
//                   type="file"
//                   style={{ display: "none" }}
//                   accept=".json"
//                   onChange={(e) => setFile(e.target.files?.[0] || null)}
//                 />

//                 <div className="text text-slate-500">
//                   {file ? file.name : "No file selected"}
//                 </div>
//                 <label
//                   htmlFor="figma-json-file"
//                   className=" px-[10px] py-1 text-[12px] rounded  cursor-pointer  text-[#193756]"
//                   style={{
//                     border: `1px solid ${hover ? "#007bff" : "rgb(173, 173, 173)"}`,
//                   }}
//                   onMouseEnter={() => setHover(true)}
//                   onMouseLeave={() => setHover(false)}
//                 >
//                   {file ? "Change file" : "Choose file"}
//                 </label>
//               </div>
//               <Input
//                 typeInput="text"
//                 id="name"
//                 data="Project Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 classInput="modalInput"
//               />
//               <div className="flex gap-2">
//                 <button
//                   className="btn btn-primary "
//                   type="submit"
//                   disabled={loading}
//                 >
//                   {loading ? "Saving..." : "Save"}
//                 </button>
//                 <button
//                   className="btn btn-allert"
//                   type="button"
//                   onClick={() => setModalOpen(false)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default ModalCreateFigmaProject;
