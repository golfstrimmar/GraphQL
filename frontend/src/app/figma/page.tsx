"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
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
import PlazaComponent from "@/components/PlazaComponent/PlazaComponent";
import SandboxComponent from "@/components/SandboxComponent/SandboxComponent";
import ImageUploader from "@/components/ImageUploader/ImageUploader";
import RenderColorVars from "@/components/RenderColorVars/RenderColorVars";
// --------
type FigmaProject = {
  id: string;
  name: string;
  fileKey: string;
  nodeId?: string | null;
  file?: any | null;
  owner: ProjectOwner;
};

type ProjectOwner = {
  id: string;
  name: string;
};
type Project = {
  id: string;
  name: string;
};
type FontObject = {
  family?: string;
  sizes?: Record<string, number>;
  weights?: Record<string, number>;
};
type FontsData = Record<string, FontObject>;
type TextNode = {
  text: string;
  mixin: string;
  color: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: string;
};
interface ImageFile {
  file?: File;
  previewUrl: string;
  fileName?: string;
  id?: string;
  nodeId?: string;
}
export default function FigmaPage() {
  const router = useRouter();
  const { user, setHtmlJson, setModalMessage, texts, setTexts } =
    useStateContext();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<FontsData>({});
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [currentProject, setcurrentProject] = useState<FigmaProject | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [preview, setPreview] = useState<ImageFile>(null);
  const [ScssMixVar, setScssMixVar] = useState<string>("");
  const [openSandbox, setOpenSandbox] = useState<boolean>(false);
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
    UPLOAD_FIGMA_JSON_PROJECT,
  );
  const [removeFigmaProject, { loading: removeLoading }] =
    useMutation(REMOVE_FIGMA_PROJECT);

  //////--------------------
  useEffect(() => {
    if (figmaProjectsByUser?.figmaProjectsByUser) {
      setAllProjects(figmaProjectsByUser.figmaProjectsByUser);
    }
  }, [figmaProjectsByUser]);

  useEffect(() => {
    const data = figmaProjectData?.getFigmaProjectData;

    if (!data) return;

    console.log("<==🔥🔥🔥🔥==figmaProjectData ==🔥🔥🔥==>", data);

    setcurrentProject(data.project);
    setColors(data.colors);
    setFonts(data.fonts);
    setTexts(data.textNodes);

    const currentImgs = data.project.figmaImages || [];
    const tempPrev = currentImgs.find((img) => img.fileName === "preview.png");
    setPreview(tempPrev);
    const temp: ImageFile[] = currentImgs
      .filter((img) => img.fileName !== "preview.png")
      .map((img) => ({
        ...img,
        name: img.fileName,
        previewUrl: img.filePath,
      }));
    setImageFiles(temp);
    const imageNodes: HtmlNode[] = currentImgs
      .filter((img) => img.fileName !== "preview.png")
      .map((img, index) => ({
        tag: "div",
        class: "",
        text: "img-container",
        style:
          "background: rgb(226, 232, 240);padding: 2px 4px;border: 1px solid #adadad;position: relative; min-height: 50px;",
        children: [
          {
            tag: "div",
            text: "imgs",
            class: "imgs",
            style:
              "background: rgb(226, 232, 240);padding: 2px 4px;border: 1px solid #adadad;overflow: hidden;position: absolute;width: 100%;height: 100%;top: 0;left: 0;",
            children: [
              {
                tag: "img",
                text: "",
                class: "",
                style:
                  "background: #0ea5e9; padding: 2px 4px; border: 1px solid #adadad;",
                children: [],
                attributes: {
                  alt: img.nodeId ?? index.toString(),
                  src: img.filePath,
                },
              },
            ],
          },
        ],
      }));

    setHtmlJson((prev) => {
      const base: HtmlNode =
        prev && prev.tag
          ? {
              ...prev,
              children: [
                ...(prev.children || []).filter(
                  (ch) => ch.tag !== "div" || ch.text !== "img-container",
                ),
                ...imageNodes,
              ],
            }
          : {
              tag: "div",
              class: "",
              text: "",
              style: "",
              children: imageNodes,
            };

      return base;
    });
  }, [figmaProjectData]);

  useEffect(() => {
    if (Object.keys(fonts).length > 0) {
      const links = Object.entries(fonts).map(([key, fontObj]) => ({
        fontFamily: key,
      }));
      const link = generateGoogleFontsImport(links);
      if (link) {
        const l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = link;
        document.head.appendChild(l);
      }
    }
  }, [fonts]);

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
  //////////////////
  const colorsTo = useMemo(() => {
    if (colors.length > 0) {
      return colors.map((color, index) => `$color-${index + 1}: ${color};`);
    }
    return [];
  }, [colors]);
  const uniqueMixins = Object.values(
    texts.reduce<Record<string, TextNode>>((acc, el) => {
      const key = `${el.mixin}`;
      if (!acc[key]) {
        acc[key] = el;
      }
      return acc;
    }, {}),
  );
  const toFontFamily = (fam: string): string => `"${fam}", sans-serif`;
  //
  const colorVars = colors.map((value, idx) => ({
    name: `$color-${idx + 1}`,
    value,
  }));
  const getColorVarByValue = (colorValue: string): string => {
    const found = colorVars.find((v) => v.value === colorValue);

    return found ? found.name : colorValue;
  };
  const renderColorPalette = () => {
    if (colors.length === 0) return null;
    return (
      <div className="bg-navy rounded-2xl shadow-xl p-2 mb-4 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span>🎨</span>
          </div>
          <h5 className="text-2xl font-bold text-slate-800">Color Palette</h5>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] gap-2">
          {colors.map((value, index) => (
            <div
              key={index}
              className="group relative bg-slate-50 rounded-xl p-2 border border-slate-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(value);
                setModalMessage(`Color ${value} copied!`);
              }}
            >
              <div
                style={{ background: value }}
                className="w-full h-14 rounded-lg shadow-md mb-3 border-2 border-white"
              />
              <div className="text-center">
                <p className="text-xs font-mono text-slate-600 font-medium">
                  {value}
                </p>
                <p className="text-xs text-slate-400 mt-1">Click to copy</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 transition-all duration-200 group-hover:opacity-100 ">
                <div className="bg-white rounded-full p-1.5 shadow-md">
                  <Image
                    src="/svg/copy.svg"
                    alt="copy"
                    width={12}
                    height={12}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderTypography = () => {
    if (!fonts || Object.keys(fonts).length === 0) return null;
    return (
      <div className="bg-navy rounded-2xl shadow-xl p-2  mb-4 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span>Aa</span>
          </div>
          <h5 className=" font-bold text-slate-800">Typography</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(fonts).map(([key, fontObj]) => (
            <div
              key={key}
              className="group bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">
                    {fontObj.family || key}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-1">{key}</p>
                </div>
                <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-slate-600">T</span>
                </div>
              </div>
              {fontObj.sizes && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    Sizes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(fontObj.sizes).map((size, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-navy rounded-md text-xs font-mono text-slate-700 border border-slate-200"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {fontObj.weights && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    Weights
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(fontObj.weights).map((weight, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-navy rounded-md text-xs font-mono text-slate-700 border border-slate-200"
                      >
                        {weight}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderScssMixins = () => {
    if (texts.length === 0) return null;
    return (
      <div className="bg-navy rounded-2xl shadow-xl p-2  border border-slate-200  mb-4">
        <div className="flex items-center gap-3 mb-6 ">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span>{"{ }"}</span>
          </div>
          <h5 className=" font-bold text-slate-800">SCSS Mixins</h5>
        </div>
        <div className="mb-4  grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-2">
          {uniqueMixins.map((el) => {
            const colorVariable = getColorVarByValue(el.color);
            const scssMixin = `@mixin ${el.mixin} {
            font-family: "${el.fontFamily}", sans-serif;
            font-weight: ${el.fontWeight};
            font-size: ${el.fontSize};
            color: ${colorVariable};
            }`;

            return (
              <div
                key={el.mixin}
                className="group relative bg-slate-900 rounded-xl p-2 border border-slate-700 hover:border-purple-500 transition-all overflow-hidden"
              >
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(scssMixin);
                    setModalMessage("Mixin copied!");
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 transition-colors opacity-20  group-hover:opacity-100 z-10"
                >
                  Copy
                </button>
                <pre className="text-sm font-mono text-slate-100 overflow-x-auto">
                  <code>{scssMixin}</code>
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const renderTextStyles = () => {
    if (texts.length === 0) return null;
    return (
      <div className="bg-navy rounded-2xl shadow-xl p-2  border border-slate-200  mb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <span>🧻</span>
          </div>
          <h5 className="text-2xl font-bold text-slate-800">Text Styles</h5>
        </div>
        <div className="space-y-3">
          {texts.map((el, idx) => (
            <div
              key={idx}
              className="group bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-2 border border-slate-200 hover:shadow-lg hover:border-green-300 transition-all"
            >
              <div className="flex items-start gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${el.text}`);
                    setModalMessage("Text copied!");
                  }}
                  className="flex-1 text-left p-2 bg-slate-300 rounded-lg border border-slate-200 hover:border-[var(--teal)] transition-colors relative overflow-hidden group"
                >
                  <div className="absolute top-[50%] translate-y-[-50%] right-2 opacity-40 group-hover:opacity-100 transition-opacity ">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Copy Text
                    </div>
                  </div>
                  <p
                    style={{
                      fontFamily: toFontFamily(el.fontFamily),
                      fontWeight: el.fontWeight,
                      fontSize: el.fontSize,
                      color: el.color,
                    }}
                    className="whitespace-nowrap "
                  >
                    {el.text}
                  </p>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`@include ${el.mixin};`);
                    setModalMessage("Mixin copied!");
                  }}
                  className="px-4 py-2  rounded-lg border hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors font-mono text-sm whitespace-nowrap z-50"
                >
                  @include {el.mixin};
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  //--------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl pt-[100px]">
        {loading && <Loading />}
        {allProjectsLoading && <Loading />}
        {figmaProjectLoading && <Loading />}
        {removeLoading && <Loading />}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Figma Design Tokens
          </h1>
          <p className="text-slate-600 text-lg">
            Extract and manage your design system
          </p>
        </div>
        <div className="bg-navy rounded-2xl shadow-xl p-2 pb-0 mb-8 border border-slate-200">
          {allProjects.length === 0 ? (
            <div className="text-center  py-4 pb-2">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📁</span>
              </div>
              <p className="text-slate-600 text-lg py-4 mb-6">
                {user
                  ? "No Figma projects found"
                  : "Please,  login to see Projects"}
              </p>
              {user && (
                <Button
                  onClick={() => {
                    setFile(null);
                    setName("");
                    setModalOpen(true);
                  }}
                >
                  Add Your First Project
                </Button>
              )}
            </div>
          ) : (
            <div className="pb-2">
              <div className="flex text-center  gap-3 ">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span>📁</span>
                </div>
                <h5 className="mb-2">Your Projects</h5>
              </div>

              {projectId && (
                <button
                  onClick={() => {
                    setPreview(null);
                    setFile(null);
                    setProjectId("");
                    setcurrentProject(null);
                    setColors([]);
                    setFonts([]);
                    setTexts([]);
                    setScssMixVar("");
                    setHtmlJson(null);
                  }}
                  className="btn btn-empty px-2 my-2 mr-2"
                >
                  Quit active Project
                </button>
              )}
              <button
                onClick={() => {
                  setFile(null);
                  setName("");
                  setModalOpen(true);
                }}
                className="btn btn-empty px-2 my-2 "
              >
                + Add Project
              </button>
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
                setScssMixVar={setScssMixVar}
              />
            </div>
          )}
        </div>
        {user && currentProject && (
          <ImageUploader
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            currentProject={currentProject}
            preview={preview}
            setPreview={setPreview}
          />
        )}
        {renderColorPalette()}
        {projectId && <RenderColorVars colorsTo={colorsTo} />}
        {renderTypography()}
        {renderScssMixins()}
        {renderTextStyles()}
        {/*<button
          className="btn btn-empty"
          type="button"
          onClick={() => setOpenSandbox(!openSandbox)}
        >
          Open Sandbox
        </button>*/}
        {user && openSandbox && <SandboxComponent />}
        {user && (
          // <Plaza
          //   preview={preview}
          //   uniqueMixins={uniqueMixins}
          //   colorsTo={colorsTo}
          //   ScssMixVar={ScssMixVar}
          //   setScssMixVar={setScssMixVar}
          //   setOpenSandbox={setOpenSandbox}
          //   openSandbox={openSandbox}
          // />
          <PlazaComponent
            preview={preview}
            uniqueMixins={uniqueMixins}
            colorsTo={colorsTo}
            ScssMixVar={ScssMixVar}
            setScssMixVar={setScssMixVar}
            setOpenSandbox={setOpenSandbox}
            openSandbox={openSandbox}
          />
        )}
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
      </div>
    </div>
  );
}
