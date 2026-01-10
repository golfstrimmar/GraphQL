"use client";
import { useRouter } from "next/navigation";
import React, {
  memo,
  useState,
  useCallback,
  useEffect,
  ChangeEvent,
} from "react";
import { useStateContext } from "@/providers/StateProvider";
import EditModeIcon from "@/components/icons/EditModeIcon";
import { useMutation } from "@apollo/client";
import {
  UPLOAD_ULON_IMAGE,
  UPDATE_FIGMA_PROJECT,
  REMOVE_FIGMA_IMAGE,
} from "@/apollo/mutations";
import { GET_FIGMA_PROJECT_DATA } from "@/apollo/queries";
import Image from "next/image";
import Loading from "@/components/ui/Loading/Loading";
import returnCurentImages from "./imageNodes";
import { ensureNodeKeys } from "@/app/plaza/utils/ensureNodeKeys";

interface ImageFile {
  file?: File;
  id?: number;
  name?: string;
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

const ImageUploader: React.FC<ImageUploaderProps> = ({ project }) => {
  const router = useRouter();
  const [isNewImages, setIsNewImages] = useState<boolean>(false);
  const [isPrev, setIsPrev] = useState<boolean>(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const { preview, setPreview, updateHtmlJson, setModalMessage } =
    useStateContext();

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

  const [htmlImagesInit, setHtmlImagesInit] = useState(false);

  // Инициализация из проекта, только один раз
  useEffect(() => {
    if (!project || htmlImagesInit) return;

    const currentImgs = project.figmaImages || [];

    const tempPrev = currentImgs.find(
      (img: any) => img.fileName === "preview.png",
    );
    setPreview(tempPrev);

    const temp: ImageFile[] = currentImgs
      .filter((img: any) => img.fileName !== "preview.png")
      .map((img: any) => ({
        id: img.id,
        name: img.fileName,
        previewUrl: img.filePath,
      }));
    setImageFiles(temp);

    const res = returnCurentImages(currentImgs);
    if (res.length > 0) {
      updateHtmlJson((prev: HtmlNode[] | HtmlNode | null) => {
        const safePrevArray: HtmlNode[] = Array.isArray(prev)
          ? prev
          : prev
            ? [prev]
            : [];

        // на всякий случай убираем старые img-container
        const withoutOldImages = safePrevArray.filter(
          (node) => !(node.tag === "div" && node.text === "img-container"),
        );

        const result = [...withoutOldImages, ...res];
        return ensureNodeKeys(result);
      });
    }

    setHtmlImagesInit(true);
  }, [project, htmlImagesInit, setPreview, setImageFiles, updateHtmlJson]);

  // Флаг новых картинок
  useEffect(() => {
    const hasNew = imageFiles.some((img) => img.file);
    setIsNewImages(hasNew);
  }, [imageFiles]);

  // Чистка blob-URL
  useEffect(() => {
    return () => {
      imageFiles.forEach((img) => {
        if (img.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [imageFiles]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, isPrevFlag: boolean) => {
      if (event.target.files) {
        const newFiles = Array.from(event.target.files);
        if (isPrevFlag) setIsPrev(true);

        const newImageFiles: ImageFile[] = newFiles.map((file) => {
          const targetFile = isPrevFlag
            ? new File([file], "preview.png", { type: file.type })
            : file;

          return {
            file: targetFile,
            previewUrl: URL.createObjectURL(targetFile),
          };
        });

        setImageFiles((prev) => [...prev, ...newImageFiles]);
        event.target.value = "";
      }
    },
    [],
  );

  const handleRemoveImage = useCallback(
    async (img: any) => {
      // локально убираем
      setImageFiles((prev) =>
        prev.filter((f) => f.id !== img.id && f.previewUrl !== img.filePath),
      );

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
      }
    },
    [project, removeFigmaImage, setModalMessage, router],
  );

  const saveAllImages = useCallback(async () => {
    if (!imageFiles.length) return;

    const imageFilesToUpload = imageFiles.filter(
      (img) => img.file !== undefined,
    );
    if (!imageFilesToUpload.length) return;

    const uploadPromises = imageFilesToUpload.map((imgFile) =>
      uploadImage({ variables: { file: imgFile.file as File } }),
    );
    const results = await Promise.all(uploadPromises);
    const urls = results.map((res) => res.data?.uploadImage?.url);

    const images = urls.map((url, index) => {
      const srcImg = imageFilesToUpload[index];
      const fileName = srcImg?.file?.name ?? srcImg?.name ?? "";
      return {
        fileName,
        filePath: url,
        imageRef: url,
        type: "RASTER",
      };
    });

    setIsPrev(false);
    return { images };
  }, [imageFiles, uploadImage, setIsPrev]);

  const handleSaveProjectWithImages = useCallback(async () => {
    const projectId = project?.id;
    if (!projectId) {
      setModalMessage?.("No projectId");
      return;
    }

    const result = await saveAllImages();
    if (!result) return;

    const { images } = result;

    try {
      const { data } = await updateFigmaProject({
        variables: {
          figmaProjectId: projectId,
          images,
        },
      });

      const updated = data?.updateFigmaProject;
      if (updated?.id) {
        // пересобираем imageFiles ТОЛЬКО из сервера
        const currentImgs = updated.figmaImages || [];

        const tempPrev = currentImgs.find(
          (img: any) => img.fileName === "preview.png",
        );
        setPreview(tempPrev);

        const temp: ImageFile[] = currentImgs
          .filter((img: any) => img.fileName !== "preview.png")
          .map((img: any) => ({
            id: img.id,
            name: img.fileName,
            previewUrl: img.filePath,
          }));

        setImageFiles(temp);
        setIsNewImages(false);
        setModalMessage?.("Project updated with images");
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating Figma project:", error);
      setModalMessage?.("Error updating Figma project");
    }
  }, [
    project,
    saveAllImages,
    updateFigmaProject,
    setPreview,
    setImageFiles,
    setIsNewImages,
    setModalMessage,
    router,
  ]);

  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 mb-8">
      {removeLoading && <Loading />}
      {updateLoading && <Loading />}

      <div className="flex items-center gap-3 mb-6">
        <div className="p-1 bg-gradient-to-br from-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
          <span>🖼️</span>
        </div>
        <h5 className="font-bold text-slate-800">Images</h5>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="image-upload" className="btn-teal">
          <EditModeIcon />
          Upload Images
        </label>
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*, .svg"
          onChange={(e) => handleFileChange(e, false)}
          className="hidden -z-2 absolute opacity-0"
        />
        {!preview && (
          <>
            <label htmlFor="image-Preview-upload" className="btn-teal">
              <EditModeIcon />
              Upload Preview
            </label>
            <input
              id="image-Preview-upload"
              type="file"
              multiple
              accept="image/*, .svg"
              onChange={(e) => handleFileChange(e, true)}
              className="hidden -z-2 absolute opacity-0"
            />
          </>
        )}
      </div>

      {preview && (
        <div className="border-slate-400 mt-2 w-[max-content] bg-slate-200 relative rounded-lg p-2 border text-center group">
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
            className="absolute top-1 right-1 bg-red-200 text-white rounded-full hover:bg-red-400 p-1 w-5 h-5 flex items-center justify-center text-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove image"
          >
            <Image src="/svg/cross.svg" alt="copy" width={16} height={16} />
          </button>
        </div>
      )}

      {imageFiles.length > 0 && isNewImages && (
        <button
          className="btn-teal mt-2"
          type="button"
          onClick={handleSaveProjectWithImages}
        >
          {uploadLoading && <p>Loading ...</p>}
          {!uploadLoading && (
            <>
              <EditModeIcon />
              <span className="font-medium">
                Update Figmaproject
                <h3 className="inline-block mx-2 font-bold !text-[var(--teal)]">
                  {project.name}
                </h3>
                {isPrev ? "Preview" : " with new images"}
              </span>
            </>
          )}
        </button>
      )}

      {imageFiles.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] mt-2 gap-4">
          {imageFiles.map((img, index) => (
            <div
              key={img.previewUrl || img.name || index}
              className="border-slate-200 bg-slate-100 relative rounded-lg p-2 border text-center flex flex-col items-center justify-center group"
            >
              <img
                src={img.previewUrl}
                alt={img.name || img.file?.name || "image"}
                className="max-w-full h-auto max-h-24 object-contain rounded-md mb-2"
              />
              <p className="text-xs text-slate-600 break-all w-full mt-auto px-1">
                {img.name || img.file?.name}
              </p>
              <button
                onClick={() => {
                  if (img.file) {
                    setImageFiles((prev) =>
                      prev.filter(
                        (foo) =>
                          foo.previewUrl !== img.previewUrl &&
                          foo.file?.name !== img.file?.name,
                      ),
                    );
                  } else {
                    handleRemoveImage(img);
                  }
                }}
                className="absolute top-1 right-1 bg-red-200 text-white rounded-full hover:bg-red-400 p-1 w-5 h-5 flex items-center justify-center text-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
