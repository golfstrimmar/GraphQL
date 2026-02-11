"use client";

import Spinner from "@/components/icons/Spinner";
import React, { useEffect, useState } from "react";
import ClearIcon from "@/components/icons/ClearIcon";
import {
  saveImage,
  getAllImages,
  clearImages,
  deleteImage,
  type StoredImage,
} from "./utils/imageStore";

type LocalImage = {
  id: string;
  name: string;
  url: string; // ObjectURL для превью
};

// ----------------------
export default function DesignImages({
  images,
  setImages,
}: {
  images: LocalImage[];
  setImages: React.Dispatch<React.SetStateAction<LocalImage[]>>;
}) {
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored: StoredImage[] = await getAllImages();
        const mapped = stored.map((item) => ({
          id: item.id,
          name: item.name,
          url: URL.createObjectURL(item.blob),
        }));
        setImages(mapped);
      } catch (e) {
        console.error("Failed to load images from IndexedDB", e);
      }
    })();
  }, [setImages]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsSaving(true);
    try {
      const newImages: LocalImage[] = [];

      for (const file of Array.from(files)) {
        const id = await saveImage(file, file.name);
        const url = URL.createObjectURL(file);
        newImages.push({ id, name: file.name, url });
      }

      setImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error("Failed to save images", err);
    } finally {
      setIsSaving(false);
      e.target.value = "";
    }
  };

  const handleClear = async () => {
    await clearImages();
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
  };

  const handleDeleteOne = async (id: string) => {
    const img = images.find((i) => i.id === id);
    try {
      await deleteImage(id);
      if (img) URL.revokeObjectURL(img.url);
      setImages((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error("Failed to delete image", e);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <label className="btn btn-teal w-fit cursor-pointer">
          {isSaving ? <Spinner /> : "Choose images"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleChange}
          />
        </label>
        {images.length > 0 && (
          <button
            className="btn btn-allert"
            type="button"
            onClick={handleClear}
          >
            <ClearIcon width={16} height={16} />
          </button>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative w-24 h-24 overflow-hidden rounded border border-slate-600"
              title={img.name}
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-xs text-white flex items-center justify-center z-20 btn btn-allert"
                onClick={() => handleDeleteOne(img.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
