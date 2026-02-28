import { useEffect } from "react";

export function usePreventAllScrollOnFocus() {
  useEffect(() => {
    let lastScrollX = window.scrollX;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      lastScrollX = window.scrollX;
      lastScrollY = window.scrollY;
    };

    const handleFocusIn = () => {
      const x = lastScrollX;
      const y = lastScrollY;
      requestAnimationFrame(() => {
        window.scrollTo(x, y);
      });
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("focusin", handleFocusIn, true);
    };
  }, []);
}
