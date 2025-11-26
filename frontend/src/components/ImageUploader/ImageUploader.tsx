"use client";

import React, { useState, ChangeEvent, useEffect } from "react";

interface ImageFile {
  file: File;
  previewUrl: string;
}

interface ImageUploaderProps {
  imageFiles: ImageFile[];
  setImageFiles: (files: ImageFile[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageFiles,
  setImageFiles,
}) => {
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

  useEffect(() => {
    return () => {
      imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [imageFiles]);

  return (
    <div className="bg-navy rounded-2xl shadow-xl p-4 border border-slate-200 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
          <span className="text-xl">🖼️</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Images</h3>
      </div>

      <div className="mb-6 flex gap-3 items-center">
        <label
          htmlFor="image-upload"
          className="cursor-pointer inline-block px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
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
          <button
            onClick={handleClearAllImages}
            className="px-4 py-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm"
          >
            Clear All
          </button>
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
