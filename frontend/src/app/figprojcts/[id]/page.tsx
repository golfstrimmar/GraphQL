"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStateContext } from "@/providers/StateProvider";
import { useQuery, useMutation } from "@apollo/client";
import { GET_FIGMA_PROJECT_DATA } from "@/apollo/queries";
import Loading from "@/components/ui/Loading/Loading";
import generateGoogleFontsImport from "@/utils/generateGoogleFontsImport";
import ImageUploader from "@/app/figprojcts/[id]/ImageUploader";
import RenderColorVars from "./RenderColorVars";
import RenderColorPalette from "./RenderColorPalette";
import RenderTypography from "./RenderTypography";
import RenderScssMixins from "./RenderScssMixins";
import RenderTextStyles from "./RenderTextStyles";
// -------------
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
// 🟢🟢🟢🟢🟢🟢🟢🟢
const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const { texts, setModalMessage, setTexts, setHtmlJson } = useStateContext();
  const router = useRouter();
  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<FontsData>({});
  const [preview, setPreview] = useState<ImageFile>(null);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  // ====  Queries
  const { data, loading, error } = useQuery(GET_FIGMA_PROJECT_DATA, {
    variables: { projectId: id },
    skip: !id,
  });
  const [project, setProject] = useState<any>(null);

  //==== Обновление состояния при получении данных
  useEffect(() => {
    if (!data?.getFigmaProjectData) return;
    const curentProject = data?.getFigmaProjectData;
    console.log("<=🔥🔥🔥🔥==project from db=🔥🔥🔥🔥==>", curentProject);
    setProject(curentProject.project);
    setColors(curentProject.colors);
    setFonts(curentProject.fonts);
    setTexts(curentProject.textNodes);
  }, [data]);

  useEffect(() => {
    if (!project) return;
    const currentImgs = project.figmaImages || [];
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
  }, [project]);

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
  //=====
  return (
    <div className="container">
      <div className="p-4 mt-[60px] mb-8 w-full">
        {loading && <Loading />}
        <div className=" p-4  shadow-md  w-full">
          <div className="flex items-center  gap-1  bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 mb-8">
            <span>Fgma project: </span>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
              {project?.name}
            </h2>
          </div>
          {project && (
            <ImageUploader
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
              currentProject={project}
              preview={preview}
              setPreview={setPreview}
            />
          )}
          <RenderColorPalette colors={colors} />
          {project?.id && <RenderColorVars colorsTo={colorsTo} />}
          <RenderTypography fonts={fonts} />
          <RenderScssMixins texts={texts} colors={colors} />
          <RenderTextStyles />
        </div>
      </div>
    </div>
  );
};
export default ProjectPage;
