import { useEffect } from "react";

export function usePreventLabelInputDoubleClick() {
  useEffect(() => {
    let lastLabelFor: string | null = null;
    let lastLabelTime = 0;
    const THRESHOLD = 200; // мс

    const handleClickCapture = (event: MouseEvent) => {
      const rawTarget = event.target as HTMLElement | null;
      if (!rawTarget) return;

      const now = Date.now();

      // 🔹 1. Ищем ближайший <label> вверх по DOM от места клика
      let el: HTMLElement | null = rawTarget;
      let labelEl: HTMLLabelElement | null = null;

      while (el) {
        if (el.tagName === "LABEL") {
          labelEl = el as HTMLLabelElement;
          break;
        }
        el = el.parentElement;
      }

      // Если нашли label – запоминаем его for
      if (labelEl) {
        const htmlFor = labelEl.getAttribute("for");
        if (htmlFor) {
          lastLabelFor = htmlFor;
          lastLabelTime = now;
        }
        // важно: не глушим сам клик по label – он нужен редактору
        return;
      }

      // 🔹 2. Клик по <input> или <textarea> сразу после label
      if (rawTarget.tagName === "INPUT" || rawTarget.tagName === "TEXTAREA") {
        const id = rawTarget.getAttribute("id");
        if (id && lastLabelFor === id && now - lastLabelTime < THRESHOLD) {
          // это "второй" технический клик от браузера – глушим
          event.stopPropagation();
          event.preventDefault();
        }
      }
    };

    document.addEventListener("click", handleClickCapture, true);
    return () => {
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, []);
}
