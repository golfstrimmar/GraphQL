"use client";
import { useRouter, usePathname } from "next/navigation";
import React, {
  memo,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ChangeEvent,
} from "react";
import { useStateContext } from "@/providers/StateProvider";
import EditModeIcon from "@/components/icons/EditModeIcon";
import { useMutation, useQuery } from "@apollo/client";
import { ensureNodeKeys } from "@/app/plaza/utils/ensureNodeKeys";
import {
  UPLOAD_ULON_IMAGE,
  UPDATE_FIGMA_PROJECT,
  REMOVE_FIGMA_IMAGE,
} from "@/apollo/mutations";
import { GET_FIGMA_PROJECT_DATA } from "@/apollo/queries";
import Image from "next/image";
import Loading from "@/components/ui/Loading/Loading";

import returnCurentImages from "./imageNodes";

// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
interface ImageFile {
  file: File;
  previewUrl: string;
}
type HtmlNode = {
  tag: string;
  class?: string;
  children?: HtmlNode[] | HtmlNode | string;
  text?: string;
  style?: string;
  attributes?: Record<string, string>;
};
interface ImageUploaderProps {
  project: any;
}

// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
const ImageUploader: React.FC<ImageUploaderProps> = ({ project }) => {
  const router = useRouter();
  const [isNewImages, setIsNewImages] = useState<boolean>(false);
  const [isPrev, setIsPrev] = useState<boolean>(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const {
    texts,
    setTexts,
    preview,
    setPreview,
    colors,
    htmlJson,
    setColors,
    setHtmlJson,
    setModalMessage,
    updateHtmlJson,
  } = useStateContext();
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const [uploadImage, { loading: uploadLoading }] =
    useMutation(UPLOAD_ULON_IMAGE);
  const [updateFigmaProject, { loading: updateLoading }] =
    useMutation(UPDATE_FIGMA_PROJECT);
  const [removeFigmaImage, { loading: removeLoading }] = useMutation(
    REMOVE_FIGMA_IMAGE,
    {
      update(cache, { data }) {
        const updatedProject = data?.removeFigmaImage;
        if (!updatedProject) return;

        // читаем из кеша текущие данные проекта
        const existing = cache.readQuery({
          query: GET_FIGMA_PROJECT_DATA,
          variables: { projectId: String(updatedProject.id) },
        }) as any;

        if (!existing?.getFigmaProjectData) return;

        cache.writeQuery({
          query: GET_FIGMA_PROJECT_DATA,
          variables: { projectId: String(updatedProject.id) },
          data: {
            getFigmaProjectData: {
              ...existing.getFigmaProjectData,
              project: {
                ...existing.getFigmaProjectData.project,
                figmaImages: updatedProject.figmaImages,
                fileCache: updatedProject.fileCache,
              },
            },
          },
        });
      },
    },
  );

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨э
  useEffect(() => {
    if (!project) return;
    console.log("<=🟢🟢🟢==project===>", project);

    const currentImgs = project.figmaImages || [];

    const tempPrev = currentImgs.find((img) => img.fileName === "preview.png");
    setPreview(tempPrev);

    const temp: ImageFile[] = currentImgs
      .filter((img) => img.fileName !== "preview.png")
      .map((img) => ({
        ...img,
        id: img.id,
        name: img.fileName,
        previewUrl: img.filePath,
      }));
    setImageFiles(temp);

    const res = returnCurentImages(currentImgs);
    if (res.length > 0) {
      updateHtmlJson((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const result = [...safePrev, ...res];
        return ensureNodeKeys(result);
      });
    }
  }, [project]);

  // -----
  useEffect(() => {
    console.log("<=🟢🟢🟢==imageFiles===>", imageFiles);

    imageFiles.forEach((img) => {
      if (img.file) {
        setIsNewImages(true);
        return;
      }
    });
  }, [imageFiles]);
  // -----
  useEffect(() => {
    return () => {
      imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [imageFiles]);
  // -----

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨э
  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, isPrev: boolean) => {
      if (event.target.files) {
        const newFiles = Array.from(event.target.files);
        if (isPrev) setIsPrev(true);
        const newImageFiles: ImageFile[] = newFiles.map((file) => {
          const targetFile = isPrev
            ? new File([file], "preview.png", { type: file.type })
            : file;

          return {
            file: targetFile,
            previewUrl: URL.createObjectURL(targetFile),
          };
        });

        // use functional update to avoid depending on current `imageFiles`
        setImageFiles((prev) => [...prev, ...newImageFiles]);
        event.target.value = "";
      }
    },
    [setImageFiles, setIsPrev],
  );

  const handleRemoveImage = useCallback(
    async (img) => {
      setImageFiles((prev) => prev.filter((f) => f.id !== img.id));
      if (project && img.id) {
        const { data } = await removeFigmaImage({
          variables: {
            figmaProjectId: project.id,
            figmaImageId: img.id,
          },
        });
        if (!data) {
          setModalMessage("Error removing image");
          return;
        }
        router.refresh();
        setModalMessage("Image removed successfully");
        console.log("<==Remove=img===>", data.removeFigmaImage.figmaImages);
      }
    },
    [setImageFiles, project, removeFigmaImage, setModalMessage],
  );

  const saveAllImages = useCallback(async () => {
    if (!imageFiles.length) return;

    const imageFilesToUpload = imageFiles.filter(
      (img) => img.file !== undefined,
    );
    const uploadPromises = imageFilesToUpload.map((imgFile) =>
      uploadImage({ variables: { file: imgFile.file } }),
    );
    const results = await Promise.all(uploadPromises);
    const urls = results.map((res) => res.data?.uploadImage?.url);

    // 1. Собираем уже существующие nodeId
    const existingImages = project.figmaImages || [];
    const existingNodeIds = existingImages
      .map((img) => Number(img.nodeId))
      .filter((n) => !isNaN(n));

    const maxNodeId = existingNodeIds.length
      ? Math.max(...existingNodeIds)
      : -1;

    // 2. Для новых картинок продолжаем нумерацию
    const images = urls.map((url, index) => {
      const srcImg = imageFilesToUpload[index];
      const fileName = srcImg?.file?.name ?? srcImg?.fileName ?? "";
      return {
        fileName,
        filePath: url,
        imageRef: url,
        type: "RASTER",
      };
    });
    setIsPrev(false);
    return { images };
  }, [imageFiles, uploadImage, project, setIsPrev]);

  const handleSaveProjectWithImages = useCallback(async () => {
    const projectId = project.id;
    if (!projectId) {
      setModalMessage?.("No projectId");
      return;
    }

    const result = await saveAllImages();
    if (!result) return;
    setModalMessage?.("Project updated with images");
    setIsNewImages(false);
    const { images } = result;
    try {
      const { data } = await updateFigmaProject({
        variables: {
          figmaProjectId: projectId,
          images: images,
        },
      });
      console.log("<===data===>", data.updateFigmaProject);
      if (data?.updateFigmaProject?.id) {
        router.refresh();
        setModalMessage?.("Project updated with images");
        setIsNewImages(false);
      }
    } catch (error) {
      console.error("Error updating Figma project:", error);
    }
  }, [
    project,
    saveAllImages,
    setModalMessage,
    setIsNewImages,
    updateFigmaProject,
  ]);
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 mb-8">
      {removeLoading && <Loading></Loading>}
      {updateLoading && <Loading></Loading>}
      <div className="flex items-center gap-3 mb-6">
        <div className=" p-1 bg-gradient-to-br from-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
          <span>🖼️</span>
        </div>
        <h5 className=" font-bold text-slate-800">Images</h5>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="image-upload" className="btn-teal">
          <EditModeIcon></EditModeIcon>
          Upload Images
        </label>
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*, .svg"
          onChange={(e) => {
            handleFileChange(e, false);
          }}
          className="hidden -z-2 absolute opacity-0"
        />
        {!preview && (
          <>
            <label htmlFor="image-Preview-upload" className="btn-teal">
              <EditModeIcon></EditModeIcon>
              Upload Preview
            </label>
            <input
              id="image-Preview-upload"
              type="file"
              multiple
              accept="image/*, .svg"
              onChange={(e) => {
                handleFileChange(e, true);
              }}
              className="hidden -z-2 absolute opacity-0"
            />
          </>
        )}
      </div>
      {preview && (
        <div className="border-slate-400 mt-2 w-[max-content] bg-slate-200 relative  rounded-lg p-2 border  text-center  group">
          <img
            src={preview.filePath}
            alt="preview"
            className="max-w-full h-auto max-h-34 object-contain rounded-md mb-2"
          />
          <p className="text-xs text-slate-600 break-all w-full mt-auto px-1">
            Preview
          </p>
          <button
            onClick={() => handleRemoveImage(preview)}
            className="absolute top-1 right-1 bg-red-200 text-white rounded-full hover:bg-red-400  p-1 w-5 h-5 flex items-center justify-center text-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove image"
          >
            <Image src="/svg/cross.svg" alt="copy" width={16} height={16} />
          </button>
        </div>
      )}

      {imageFiles.length > 0 && isNewImages && isPrev && (
        <button
          className="btn-teal mt-2"
          type="button"
          onClick={() => handleSaveProjectWithImages()}
        >
          {uploadLoading && <p>Loading ...</p>}
          {!uploadLoading && (
            <>
              <EditModeIcon></EditModeIcon>
              <span className=" font-medium">
                Updete Figmaproject
                <h3 className="inline-block mx-2 font-bold !text-[var(--teal)]">
                  {project.name}
                </h3>
                Preview
              </span>
            </>
          )}
        </button>
      )}
      {imageFiles.length > 0 && isNewImages && !isPrev && (
        <button
          className="btn-teal mt-2"
          type="button"
          onClick={() => handleSaveProjectWithImages()}
        >
          {uploadLoading && <p>Loading ...</p>}
          {!uploadLoading && (
            <>
              <EditModeIcon></EditModeIcon>
              <span className=" font-medium">
                Updete Figmaproject
                <h3 className="inline-block mx-2 font-bold !text-[var(--teal)]">
                  {project.name}
                </h3>
                with new images
              </span>
            </>
          )}
        </button>
      )}
      {imageFiles.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] mt-2 gap-4">
          {imageFiles.map((img, index) => (
            <div
              key={img.previewUrl || img.file?.name || index}
              className={`${img.file ? "border-[var(--teal)] bg-[var(--teal-navi)]" : "border-slate-200 bg-slate-100"} relative  rounded-lg p-2 border  text-center flex flex-col items-center justify-center group`}
            >
              <img
                src={img.previewUrl}
                alt={img?.name ? img?.name : img?.file?.name}
                className="max-w-full h-auto max-h-24 object-contain rounded-md mb-2"
              />
              <p className="text-xs text-slate-600 break-all w-full mt-auto px-1">
                {img?.name ? img?.name : img?.file?.name}
              </p>
              <button
                onClick={() => {
                  if (img.file) {
                    setImageFiles((prev) =>
                      prev.filter((foo) => foo.file?.name !== img.file?.name),
                    );
                  } else {
                    handleRemoveImage(img);
                  }
                }}
                className="absolute top-1 right-1 bg-red-200 text-white rounded-full hover:bg-red-400  p-1 w-5 h-5 flex items-center justify-center text-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <Image src="/svg/cross.svg" alt="copy" width={16} height={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(ImageUploader);
