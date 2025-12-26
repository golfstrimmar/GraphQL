"use client";
import React, { useState } from "react";
import SandboxСomponent from "@/components/SandboxComponent/SandboxComponent";
import CustomSlider from "@/components/ui/CustomSlider/CustomSlider";

export default function PreviewComponent({ preview, setPreview }) {
  const [previewOpacity, setPreviewOpacity] = useState<number>(0);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  return (
    <div className="relative  mt-18 ">
      {preview && (
        <div className="absolute top-[-44px]  z-5000 border border-slate-200 ">
          <div className="flex items-center  ">
            <button
              onClick={() => {
                setPreview(null);
              }}
              className="btn btn-empty px-2  m-2  !text-[var(--teal)]"
            >
              Clear Preview
            </button>
            <div className="btn btn-empty  !flex items-center p-1 min-w-[650px]">
              <h6 className="mr-4 ">Preview Opacity</h6>
              <h5 className="mr-2 !text-[var(--teal)] min-w-[30px]">
                {previewOpacity}
              </h5>
              <CustomSlider
                value={previewOpacity}
                onChange={setPreviewOpacity}
                customClass="w-[450px] "
              />
            </div>
          </div>
          {/* =========preview=========== */}
          <div
            className={`w-[100vw] `}
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              opacity: previewOpacity / 100,
            }}
          >
            <div
              style={
                imgSize
                  ? {
                      width: `${imgSize.w}px`,
                      height: `${imgSize.h}px`,
                    }
                  : undefined
              }
            >
              <img
                src={preview.filePath}
                alt="preview"
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  setImgSize({
                    w: img.naturalWidth,
                    h: img.naturalHeight,
                  });
                }}
                style={{
                  display: "block",
                  maxWidth: "none",
                  width: imgSize ? `${imgSize.w}px` : "auto",
                  height: imgSize ? `${imgSize.h}px` : "auto",
                }}
              />
            </div>
          </div>
        </div>
      )}
      <SandboxСomponent
        heightPreview={imgSize?.h ?? 300}
        widthPreview={imgSize?.w ?? 0}
      />
    </div>
  );
}
