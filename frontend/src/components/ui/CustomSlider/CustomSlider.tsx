// CustomSlider.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

type CustomSliderProps = {
  value: number; // внешнее значение
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  customClass?: string;
  debounceMs?: number;
};

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  customClass,
  debounceMs = 80,
}) => {
  const [innerValue, setInnerValue] = useState(value);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  // синк внешнего value внутрь
  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  // нормализуем и считаем процент
  const clamped = Math.min(Math.max(innerValue, min), max);
  const percentage = ((clamped - min) / (max - min)) * 100;

  // дебаунсим onChange наружу
  useEffect(() => {
    const id = setTimeout(() => {
      if (clamped !== value) {
        onChange(clamped);
      }
    }, debounceMs);
    return () => clearTimeout(id);
  }, [clamped, value, onChange, debounceMs]);

  // перевод пикселя мыши в значение
  const calcValueFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return clamped;

      const rect = track.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = Math.min(Math.max(x / rect.width, 0), 1);
      let raw = min + ratio * (max - min);

      // учитываем step
      if (step > 0) {
        raw = Math.round(raw / step) * step;
      }
      return Math.min(Math.max(raw, min), max);
    },
    [min, max, step, clamped],
  );

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const next = calcValueFromClientX(e.clientX);
    setInnerValue(next);
  };

  const handlePointerMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const next = calcValueFromClientX(e.clientX);
      setInnerValue(next);
    },
    [calcValueFromClientX],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
  }, []);

  // вешаем/снимаем глобальные слушатели при драге
  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return (
    <div className={customClass || ""}>
      <div className="mb-1 flex justify-between text-[10px] text-slate-500">
        <span
          className={
            value === 0.1
              ? "text-[var(--teal)] font-bold bg-[var(--teal-light)] p-1 h-6 rounded-full text-center "
              : "p-2"
          }
        >
          10%
        </span>
        <span
          className={
            value === 1
              ? "text-[var(--teal)] font-bold bg-[var(--teal-light)] p-1 h-6 rounded-full text-center "
              : "p-2"
          }
        >
          100%
        </span>
        <span
          className={
            value === max
              ? "text-[var(--teal)] font-bold bg-[var(--teal-light)] p-1  h-6 rounded-full text-center "
              : ""
          }
        >
          {max}00%
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative h-2 rounded-full bg-slate-200 cursor-pointer"
        onMouseDown={handlePointerDown}
      >
        {/* заполненная часть трека */}
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-[var(--teal)] transition-[width] duration-75"
          style={{ width: `${percentage}%` }}
        />

        {/* кастомный ползунок */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-[var(--teal)] shadow cursor-pointer transition-[left] duration-75"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
};

export default CustomSlider;
