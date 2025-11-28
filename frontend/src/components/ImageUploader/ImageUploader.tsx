"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import EditModeIcon from "@/components/icons/EditModeIcon";
import { useMutation } from "@apollo/client";
import { UPLOAD_ULON_IMAGE } from "@/apollo/mutations";
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
}

// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageFiles,
  setImageFiles,
}) => {
  const { setHtmlJson, setModalMessage } = useStateContext();

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const [uploadImage, { loading: uploadLoading }] =
    useMutation(UPLOAD_ULON_IMAGE);

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  useEffect(() => {
    return () => {
      imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [imageFiles]);
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
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
  const handleRemoveImage = (indexToRemove: number) => {
    setImageFiles((prev) => {
      const newImages = prev.filter((_, index) => index !== indexToRemove);
      URL.revokeObjectURL(prev[indexToRemove].previewUrl);
      return newImages;
    });
  };
  const handleClearAllImages = () => {
    imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImageFiles([]);
  };
  const saveAllImages = async () => {
    if (!imageFiles.length) return;

    try {
      const uploadPromises = imageFiles.map((imgFile) =>
        uploadImage({
          variables: { file: imgFile.file },
        })
      );

      const results = await Promise.all(uploadPromises);

      const urls = results.map((res) => res.data?.uploadImage?.url);
      console.log("<==== uploaded urls ====>", urls);
      const newNodes: HtmlNode[] = urls.map((imgFile, index) => ({
        tag: "div",
        class: "",
        text: "img container",
        style:
          "background: rgb(226, 232, 240);padding: 2px 4px;border: 1px solid #adadad;position: relative; ",

        children: [
          {
            tag: "div",
            text: "imgs",
            class: "imgs",
            style:
              "background: rgb(226, 232, 240);padding: 2px 4px;border: 1px solid #adadad;overflow: hidden;  position: absolute;  width: 100%;  height: 100%;  top: 0;  left: 0;",
            children: [
              {
                tag: "img",
                text: "",
                class: "",
                style:
                  "background: #0ea5e9; padding: 2px 4px; border: 1px solid #adadad;",
                children: [],
                attributes: {
                  alt: index.toString(),
                  src: imgFile,
                },
              },
            ],
          },
        ],
      }));
      setHtmlJson((prev) => ({
        ...prev,
        children: [...(prev?.children || []), ...newNodes],
      }));
    } catch (error) {
      console.error("Error saving images:", error);
      setModalMessage?.("Error saving images");
    }
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

      <div className="mb-6 flex gap-3 items-center">
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

        {imageFiles.length > 0 && (
          <div className="flex gap-4">
            <button
              className={`btn-teal`}
              type="button"
              onClick={() => saveAllImages()}
            >
              <EditModeIcon></EditModeIcon>
              <span className=" font-medium"> Save all Images</span>
            </button>
            <button onClick={handleClearAllImages} className="btn btn-allert">
              Remove all images
            </button>
          </div>
        )}
      </div>

      {imageFiles.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
          {imageFiles.map((img, index) => (
            <div
              key={img.previewUrl}
              className="relative bg-slate-100 rounded-lg p-2 border border-slate-200 text-center flex flex-col items-center justify-center group"
            >
              <img
                src={img.previewUrl}
                alt={img.file.name}
                className="max-w-full h-auto max-h-24 object-contain rounded-md mb-2"
              />
              <p className="text-xs text-slate-600 break-all w-full truncate px-1">
                {img.file.name}
              </p>
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
