"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import EditModeIcon from "@/components/icons/EditModeIcon";
import { useMutation, useQuery } from "@apollo/client";
import {
  UPLOAD_ULON_IMAGE,
  UPDATE_FIGMA_PROJECT,
  REMOVE_FIGMA_IMAGE,
} from "@/apollo/mutations";
import { GET_FIGMA_PROJECT_DATA } from "@/apollo/queries";
import Image from "next/image";
import Loading from "@/components/ui/Loading/Loading";
// import {
//   findAndUploadImages,
//   ProjectNode,
//   ImageFile,
// } from "@/utils/imageUploadHelper";

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
  imageFiles: ImageFile[];
  setImageFiles: (files: ImageFile[]) => void;
  currentProject: any;
}

// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageFiles,
  setImageFiles,
  currentProject,
}) => {
  const { htmlJson, setHtmlJson, setModalMessage } = useStateContext();
  const [isNewImages, setIsNewImages] = useState<boolean>(false);
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const [uploadImage, { loading: uploadLoading }] =
    useMutation(UPLOAD_ULON_IMAGE);
  const [updateFigmaProject, { loading: updateLoading }] =
    useMutation(UPDATE_FIGMA_PROJECT);
  const [removeFigmaImage] = useMutation(REMOVE_FIGMA_IMAGE, {
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
  });

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨э
  useEffect(() => {
    imageFiles.forEach((img) => {
      console.log("<==!!!==img====>", img);
      if (img.file) {
        setIsNewImages(true);
        return;
      }
    });
  }, [imageFiles]);
  useEffect(() => {
    console.log("<==== isNewImages====>", isNewImages);
  }, [isNewImages]);
  useEffect(() => {
    console.log("<====imageFiles====>", imageFiles);
    return () => {
      imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [imageFiles]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const newImageFiles: ImageFile[] = newFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setImageFiles([...imageFiles, ...newImageFiles]);
      event.target.value = "";
    }
  };
  const handleRemoveImage = async (img) => {
    if (currentProject && img.nodeId) {
      setImageFiles((prev) => prev.filter((f) => f.nodeId !== img.nodeId));
      await removeFigmaImage({
        variables: {
          figmaProjectId: currentProject.id,
          nodeId: img.nodeId,
        },
      });
    } else {
      setImageFiles((prev) =>
        prev.filter((f) => f.file.name !== img.file.name)
      );
    }
  };

  // const handleClearAllImages = () => {
  //   imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));
  //   setImageFiles([]);
  // };
  const saveAllImages = async () => {
    if (!imageFiles.length) return;

    const imageFilesToUpload = imageFiles.filter(
      (img) => img.file !== undefined
    );
    const uploadPromises = imageFilesToUpload.map((imgFile) =>
      uploadImage({ variables: { file: imgFile.file } })
    );
    const results = await Promise.all(uploadPromises);
    const urls = results.map((res) => res.data?.uploadImage?.url);

    // 1. Собираем уже существующие nodeId
    const existingImages = currentProject.figmaImages || [];
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
        nodeId: String(maxNodeId + 1 + index),
        imageRef: url,
        type: "RASTER",
        fileKey: currentProject.fileKey,
      };
    });

    return { images };
  };

  // const saveAllImages = async () => {
  //   if (!imageFiles.length) return;
  //   console.log("<===Uploader imageFiles=====>", imageFiles);

  //   const imageFilesToUpload = imageFiles.filter(
  //     (img) => img.file !== undefined
  //   );
  //   console.log("<====imageFilesToUpload====>", imageFilesToUpload);

  //   try {
  //     const uploadPromises = imageFilesToUpload.map((imgFile) =>
  //       uploadImage({
  //         variables: { file: imgFile.file },
  //       })
  //     );

  //     const results = await Promise.all(uploadPromises);
  //     console.log("<====results====>", results);

  //     // const urls = results.map((res) => res.data?.uploadImage?.url);

  //     // const newNodes: HtmlNode[] = urls.map((url, index) => ({
  //     //   tag: "div",
  //     //   class: "",
  //     //   text: "img container",
  //     //   style:
  //     //     "background: rgb(226, 232, 240);padding: 2px 4px;border: 1px solid #adadad;position: relative; ",
  //     //   children: [
  //     //     {
  //     //       tag: "div",
  //     //       text: "imgs",
  //     //       class: "imgs",
  //     //       style:
  //     //         "background: rgb(226, 232, 240);padding: 2px 4px;border: 1px solid #adadad;overflow: hidden;position: absolute;width: 100%;height: 100%;top: 0;left: 0;",
  //     //       children: [
  //     //         {
  //     //           tag: "img",
  //     //           text: "",
  //     //           class: "",
  //     //           style:
  //     //             "background: #0ea5e9; padding: 2px 4px; border: 1px solid #adadad;",
  //     //           children: [],
  //     //           attributes: {
  //     //             alt: index.toString(),
  //     //             src: url,
  //     //           },
  //     //         },
  //     //       ],
  //     //     },
  //     //   ],
  //     // }));

  //     // const newHtmlJson = {
  //     //   ...htmlJson,
  //     //   children: [...(htmlJson.children || []), ...newNodes],
  //     // };
  //     // setHtmlJson(newHtmlJson);

  //     // ВАЖНО: используем тот же imageFilesToUpload
  //     // const images = urls.map((url, index) => {
  //     // const srcImg = imageFilesToUpload[index];
  //     // const fileName = srcImg?.file?.name ?? srcImg?.fileName ?? "";
  //     const images = results.map((res, index) => {
  //       const url = res.data?.uploadImage?.url;
  //       const fileName = res.data?.uploadImage?.filename;
  //       console.log("<====url====>", url, fileName);
  //       return {
  //         fileName,
  //         filePath: url,
  //         nodeId: String(index),
  //         imageRef: url,
  //         type: "RASTER",
  //         fileKey: currentProject.fileKey,
  //       };
  //     });
  //     return { images };
  //   } catch (error) {
  //     console.error("Error saving images:", error);
  //     setModalMessage("Error saving images", error);
  //   }
  // };

  const handleSaveProjectWithImages = async () => {
    const projectId = currentProject.id;
    if (!projectId) {
      setModalMessage?.("No projectId");
      return;
    }

    const result = await saveAllImages();
    if (!result) return;

    const { images } = result;
    await updateFigmaProject({
      variables: {
        figmaProjectId: projectId,
        images: images,
      },
    });
    setIsNewImages(false);
    setModalMessage?.("Project updated with images");
  };
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
          <span className="text-xl">🖼️</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Images</h3>
      </div>

      <div className=" flex gap-3 items-center">
        <label htmlFor="image-upload" className="btn-teal">
          <EditModeIcon></EditModeIcon>
          Upload Images
        </label>
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*, .svg"
          onChange={handleFileChange}
          className="hidden -z-2 absolute opacity-0"
        />

        {imageFiles.length > 0 && isNewImages && (
          <button
            className={`btn-teal`}
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
                    {currentProject.name}
                  </h3>
                  with new images
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {imageFiles.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] mt-2 gap-4">
          {imageFiles.map((img, index) => (
            <div
              key={img.previewUrl}
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
                onClick={() => handleRemoveImage(img)}
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

export default ImageUploader;
