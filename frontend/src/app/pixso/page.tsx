"use client";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  UPLOAD_FIGMA_JSON_PROJECT,
  REMOVE_FIGMA_PROJECT,
} from "@/apollo/mutations";
import {
  GET_FIGMA_PROJECTS_BY_USER,
  GET_FIGMA_PROJECT_DATA,
} from "@/apollo/queries";
import Button from "@/components/ui/Button/Button";
import "../figma/figma.scss";
import Loading from "@/components/ui/Loading/Loading";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import generateGoogleFontsImport from "@/utils/generateGoogleFontsImport";
import { AnimatePresence, motion } from "framer-motion";
import FigmaProjectsList from "@/components/FigmaProjectsList/FigmaProjectsList";
import Plaza from "@/app/plaza/page";
// --------
type FigmaProject = {
  id: string;
  name: string;
  fileKey: string;
  nodeId?: string | null;
  file?: any | null;
  owner: ProjectOwner;
};
type HtmlNode = {
  tag: string;
  class?: string;
  children?: HtmlNode[] | HtmlNode | string;
  text?: string;
  style?: string;
  attributes?: Record<string, string>;
};
type ProjectOwner = {
  id: string;
  name: string;
};
type Project = {
  id: string;
  name: string;
};
export default function FigmaPage() {
  const router = useRouter();
  const { user, setHtmlJson, setModalMessage } = useStateContext();
  const [file, setFile] = useState<File | null>(null); // archive
  const [name, setName] = useState<string>("");
  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<string[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [currentProject, setcurrentProject] = useState<FigmaProject | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  // Query
  const {
    data: figmaProjectsByUser,
    loading: allProjectsLoading,
    error: allProjectsError,
  } = useQuery(GET_FIGMA_PROJECTS_BY_USER, {
    variables: { userId: user?.id },
  });
  const {
    data: figmaProjectData,
    loading: figmaProjectLoading,
    error: figmaProjectError,
    refetch: figmaProjectRefetch,
  } = useQuery(GET_FIGMA_PROJECT_DATA, {
    variables: { projectId: projectId },
  });

  //Mutation
  const [uploadFigmaJsonProject, { loading }] = useMutation(
    UPLOAD_FIGMA_JSON_PROJECT
  );
  const [removeFigmaProject, { loading: removeLoading }] =
    useMutation(REMOVE_FIGMA_PROJECT);

  //

  useEffect(() => {
    if (figmaProjectsByUser?.figmaProjectsByUser) {
      setAllProjects(figmaProjectsByUser.figmaProjectsByUser);
    }
  }, [figmaProjectsByUser]);
  useEffect(() => {
    if (figmaProjectData?.getFigmaProjectData) {
      console.log(
        "<==🔥🔥🔥🔥==figmaProjectData ==🔥🔥🔥==>",
        figmaProjectData.getFigmaProjectData
      );
      setcurrentProject(figmaProjectData.getFigmaProjectData.project);
      setColors(figmaProjectData.getFigmaProjectData.colors);
      setFonts(figmaProjectData.getFigmaProjectData.fonts);
      setTexts(figmaProjectData.getFigmaProjectData.textNodes);
    }
  }, [figmaProjectData]);
  useEffect(() => {
    console.log("<====fonts====>", fonts);
    if (Object.keys(fonts).length > 0) {
      const links = Object.entries(fonts).map(([key, fontObj]) => ({
        fontFamily: key,
      }));
      console.log("<====links====>", links);
      const link = generateGoogleFontsImport(links);
      console.log("<====link====>", link);
      //   console.log("<====link====>", link);
      if (link) {
        const l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = link;
        document.head.appendChild(l);
      }
    }
  }, [fonts]);
  //////////////////

  useEffect(() => {
    if (texts.length > 0) {
      const styleStr =
        "background: rgb(226, 232, 240); padding: 2px 4px; border: 1px solid #adadad;";

      const newNodes: HtmlNode[] = texts.map((el, i) => ({
        tag: "div",
        text: el.text,
        class: "",
        style: styleStr,
        children: [],
      }));
      setHtmlJson((prev) => ({
        ...prev,
        children: [
          ...(Array.isArray(prev.children) ? prev.children : []),
          ...newNodes,
        ],
      }));
    }
  }, [texts]);
  //////////////////
  const handleUpload = async () => {
    if (!file) return;
    if (!user) {
      setModalMessage("You are not logged in.");
      return;
    }
    if (name.length === 0) {
      setModalMessage("Please enter a name.");
      return;
    }
    // Открываем FileReader
    const reader = new FileReader();
    reader.onload = async (e) => {
      const jsonString = e.target.result;
      const jsonContent = JSON.parse(jsonString);
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

    // file — это instance of File
    reader.readAsText(file);
  };
  const uniqueMixins = Object.values(
    texts.reduce((acc, el) => {
      const key = `${el.mixin}`;
      if (!acc[key]) {
        acc[key] = el;
      }
      return acc;
    }, {})
  );
  const toFontFamily = (fam) => `"${fam}", sans-serif`;
  //
  const colorVars = colors.map((value, idx) => ({
    name: `$color-${idx + 1}`,
    value,
  }));

  const allVars = colors
    .map((value, idx) => `$color-${idx + 1}: ${value};`)
    .join("\n");

  const getColorVarByValue = (colorValue) => {
    const found = colorVars.find((v) => v.value === colorValue);
    return found ? found.name : colorValue;
  };

  const renderColorVars = () => {
    return (
      <div className="flex flex-col gap-1 mt-4">
        <h4 className="opacity-30">SCSS color variables:</h4>
        {colors.map((value, idx) => (
          <div key={value} className="font-mono  py-1 flex items-center gap-3">
            <span>{`$color-${idx + 1}: ${value};`}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`$color-${idx + 1}: ${value};`);
                setModalMessage("Variable copied to clipboard");
              }}
              className="ml-2 px-2 py-1 border rounded text-xs bg-slate-200 hover:bg-slate-300"
            >
              Copy
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            navigator.clipboard.writeText(allVars);
            setModalMessage("Variables copied to clipboard");
          }}
          className="mt-1 w-fit px-3 py-1 border rounded text-xs bg-slate-200 hover:bg-slate-300 font-bold"
        >
          Copy all variables
        </button>
      </div>
    );
  };

  //
  return (
    <div className="figma">
      <div className="container">
        {loading && <Loading />}
        {allProjectsLoading && <Loading />}
        {figmaProjectLoading && <Loading />}
        {removeLoading && <Loading />}
        <h2 className="text-center mb-4">Figma projects</h2>
        {allProjects.length === 0 ? (
          <p className="text-center text-red-500 my-4">
            No Figma projects found
          </p>
        ) : (
          <FigmaProjectsList
            allProjects={allProjects}
            setAllProjects={setAllProjects}
            projectId={projectId}
            setColors={setColors}
            setFonts={setFonts}
            setTexts={setTexts}
            setProjectId={setProjectId}
            setcurrentProject={setcurrentProject}
            figmaProjectRefetch={figmaProjectRefetch}
            removeFigmaProject={removeFigmaProject}
          />
        )}

        <Button
          onClick={() => {
            setFile(null);
            setName("");
            setModalOpen(true);
          }}
        >
          Add project
        </Button>

        {currentProject && (
          <div className="mt-4 flex items-center gap-2">
            <h4 className="inline-block opacity-30">Current project:</h4>
            <span className="font-bold text-[25px]">{currentProject.name}</span>
          </div>
        )}
        {colors.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4 className=" opacity-30">Colors:</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {colors.map((value, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div
                    style={{
                      background: value,
                    }}
                    className="w-8 h-8 border rounded-full  ml-1"
                  />
                  <span>{value}</span>
                </div>
              ))}
            </div>
            {renderColorVars(colors)}
          </div>
        )}
        {fonts && Object.keys(fonts).length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4 className=" opacity-30">Fonts:</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {Object.entries(fonts).map(([key, fontObj]) => (
                <div
                  key={key}
                  style={{
                    padding: 8,
                    border: "1px solid #eee",
                    borderRadius: 8,
                  }}
                >
                  <b>{fontObj.family || key}</b>
                  <div style={{ fontSize: 13, opacity: 0.6 }}>{key}</div>
                  {fontObj.sizes && (
                    <div>sizes: {Object.values(fontObj.sizes).join(", ")}</div>
                  )}
                  {fontObj.weights && (
                    <div>
                      weights: {Object.values(fontObj.weights).join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {texts.length > 0 && (
          <div className="my-4">
            <h4 className=" opacity-30">Mixins:</h4>
            <div className="flex flex-col gap-1">
              {uniqueMixins.map((el) => {
                const colorVariable = getColorVarByValue(el.color);
                const scssMixin = `@mixin ${el.mixin} {
                font-family: "${el.fontFamily}", sans-serif;
                font-weight: ${el.fontWeight};
                font-size: ${el.fontSize};
                color: ${colorVariable};
              }`;

                return (
                  <button
                    key={el.mixin}
                    onClick={() => {
                      navigator.clipboard.writeText(scssMixin);
                      setModalMessage("Scss copied!");
                    }}
                    className="border rounded px-1 text-left whitespace-pre font-mono text-sm py-1 pl-6 relative"
                  >
                    <div className="absolute top-1 left-1">
                      <Image
                        src="/svg/copy.svg"
                        alt="copy"
                        width={16}
                        height={16}
                      />
                    </div>
                    {scssMixin}
                  </button>
                );
              })}
            </div>

            {/* <div className="flex flex-col gap-1 my-2">
              {uniqueMixins.map((el) => (
                <button
                  key={el.text}
                  onClick={() => {
                    navigator.clipboard.writeText(`@include ${el.mixin};`);
                    setModalMessage("Mixin copied!");
                  }}
                  className="border rounded px-1 relative"
                >
                  <div className="absolute top-1 left-1">
                    <Image
                      src="/svg/copy.svg"
                      alt="copy"
                      width={16}
                      height={16}
                    />
                  </div>
                  @include {el.mixin}
                </button>
              ))}
            </div> */}
            <div className="my-2">
              <h4 className=" opacity-30">Texts:</h4>
              <div className="flex flex-col gap-2">
                {texts.map((el, idx) => (
                  <div key={idx} className="grid grid-cols-[80%_1fr]">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${el.text}`);
                        setModalMessage("Text copied!");
                      }}
                      className="border rounded px-1 relative pl-6 bg-slate-200 overflow-hidden"
                    >
                      <div className="absolute top-1 left-1">
                        <Image
                          src="/svg/copy.svg"
                          alt="copy"
                          width={16}
                          height={16}
                        />
                      </div>
                      <div
                        style={{
                          fontFamily: toFontFamily(el.fontFamily),
                          fontWeight: el.fontWeight,
                          fontSize: el.fontSize,
                          color: el.color,
                        }}
                        className="whitespace-pre "
                      >
                        {el.text}
                      </div>
                    </button>

                    <button
                      key={el.text}
                      onClick={() => {
                        navigator.clipboard.writeText(`@include ${el.mixin};`);
                        setModalMessage("Mixin copied!");
                      }}
                      className="border rounded px-1 relative  pl-6 ml-2"
                    >
                      <div className="absolute top-1 left-1 ">
                        <Image
                          src="/svg/copy.svg"
                          alt="copy"
                          width={16}
                          height={16}
                        />
                      </div>
                      @include {el.mixin};
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/*🔹🔹🔹🔹🔹 Plaza 🔹🔹🔹🔹🔹*/}
        <Plaza />
        <AnimatePresence>
          {modalOpen && (
            <div onClick={() => setModalOpen(false)}>
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  y: -100,
                }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -100 }}
                transition={{ duration: 0.3 }}
                className=" w-[100vw] h-[100vh] fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-90 z-500"
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
                <Image
                  src="/svg/cross.svg"
                  alt="close"
                  width={24}
                  height={24}
                  className="absolute top-4 right-4 cursor-pointer"
                  onClick={() => setModalOpen(false)}
                />
                <div className="modal-content  min-w-[500px] bg-white p-6 rounded-lg ">
                  <form className="flex flex-col gap-2">
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="border rounded p-2 mb-1"
                      placeholder="Select a file"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border rounded p-2 mb-4"
                      placeholder="Project name"
                    />
                    <button
                      className="btn btn-primary"
                      disabled={!file || loading}
                      onClick={handleUpload}
                    >
                      {loading ? "Uploading..." : "Upload file"}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
