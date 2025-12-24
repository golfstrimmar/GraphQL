"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { REMOVE_FIGMA_PROJECT } from "@/apollo/mutations";
import { GET_FIGMA_PROJECT_DATA } from "@/apollo/queries";

import "../figma/figma.scss";
import Loading from "@/components/ui/Loading/Loading";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import generateGoogleFontsImport from "@/utils/generateGoogleFontsImport";
// import FigmaProjectsList from "../figprojcts/FigmaProjectsList";
import PlazaComponent from "@/components/PlazaComponent/PlazaComponent";
import SandboxComponent from "@/components/SandboxComponent/SandboxComponent";
import ImageUploader from "../ImageUploader";
import RenderColorVars from "../RenderColorVars/RenderColorVars";
import RenderColorPalette from "../RenderColorPalette";
import RenderTypography from "../RenderTypography";
import RenderScssMixins from "../RenderScssMixins";
import RenderTextStyles from "../RenderTextStyles";
import ModalUploadFigmaProject from "../ModalUploadFigmaProject";
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

type FontObject = {
  family?: string;
  sizes?: Record<string, number>;
  weights?: Record<string, number>;
};
type FontsData = Record<string, FontObject>;

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
  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<FontsData>({});
  const [projectId, setProjectId] = useState<string>("");
  const [currentProject, setcurrentProject] = useState<FigmaProject | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [preview, setPreview] = useState<ImageFile>(null);
  const [ScssMixVar, setScssMixVar] = useState<string>("");
  const [openSandbox, setOpenSandbox] = useState<boolean>(false);
  //////--- Query
  const {
    data: figmaProjectData,
    loading: figmaProjectLoading,
    error: figmaProjectError,
    refetch: figmaProjectRefetch,
  } = useQuery(GET_FIGMA_PROJECT_DATA, {
    variables: { projectId: projectId },
  });
  //////---Mutation
  const [removeFigmaProject, { loading: removeLoading }] =
    useMutation(REMOVE_FIGMA_PROJECT);

  //////--------------------

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
  const colorsTo = useMemo(() => {
    if (colors.length > 0) {
      return colors.map((color, index) => `$color-${index + 1}: ${color};`);
    }
    return [];
  }, [colors]);

  //

  //--------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl pt-[100px]">
        {/*{loading && <Loading />}*/}

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
          <div className="pb-2">
            <div className="flex text-center  gap-3 ">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span>📁</span>
              </div>
              <h5 className="mb-2">Your Projects</h5>
            </div>

            {/*<FigmaProjectsList
            projectId={projectId}
            setColors={setColors}
            setFonts={setFonts}
            setProjectId={setProjectId}
            setcurrentProject={setcurrentProject}
            figmaProjectRefetch={figmaProjectRefetch}
            removeFigmaProject={removeFigmaProject}
            setScssMixVar={setScssMixVar}
            />*/}
          </div>
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
        <RenderColorPalette colors={colors} />
        {projectId && <RenderColorVars colorsTo={colorsTo} />}
        <RenderTypography fonts={fonts} />
        <RenderScssMixins texts={texts} colors={colors} />
        <RenderTextStyles />
        {/*<button
          className="btn btn-empty"
          type="button"
          onClick={() => setOpenSandbox(!openSandbox)}
        >
          Open Sandbox
        </button>*/}
        {user && openSandbox && <SandboxComponent />}
        {user && (
          <PlazaComponent
            preview={preview}
            colorsTo={colorsTo}
            ScssMixVar={ScssMixVar}
            setScssMixVar={setScssMixVar}
            setOpenSandbox={setOpenSandbox}
            openSandbox={openSandbox}
          />
        )}
        {/*<ModalUploadFigmaProject
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          allProjects={allProjects}
          setFonts={setFonts}
          setTexts={setTexts}
          setAllProjects={setAllProjects}
        />*/}
      </div>
    </div>
  );
}
