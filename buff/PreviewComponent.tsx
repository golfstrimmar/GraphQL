"use client";
import React, { useState, useRef } from "react";
import { useStateContext } from "@/providers/StateProvider";
import PageHeader from "../frontend/src/app/plaza/PageHeader";
import CustomSlider from "@/components/ui/CustomSlider/CustomSlider";

export default function PreviewComponent() {
  const { preview } = useStateContext();
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [naturalWidth, setNaturalWidth] = useState(0);

  const handleImgLoad = () => {
    if (!imgRef.current) return;
    setNaturalWidth(imgRef.current.naturalWidth);
  };

  const scaledWidth = naturalWidth ? naturalWidth * scale : undefined;

  return (
    <>
      <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 relative mt-[25px]">
        {PageHeader("PreviewIcon", "Preview")}
        <div className="mt-4 mb-2">
          <CustomSlider
            value={scale}
            min={0.1}
            max={2}
            step={0.1}
            onChange={setScale}
          />
        </div>
      </div>

      {preview && (
        <div className="max-w-[100vw] max-h-[500px] overflow-auto custom-scrollbar">
          <img
            ref={imgRef}
            src={preview.filePath}
            alt="Preview"
            onLoad={handleImgLoad}
            style={{
              width: scaledWidth ? `${scaledWidth}px` : "auto",
              height: "auto",
              display: "block",
              maxWidth: "none", // критично: разрешаем > 100%
            }}
            className="preview-img"
          />
        </div>
      )}
    </>
  );
}
