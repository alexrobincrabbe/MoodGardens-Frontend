// ScrollToHash.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.slice(1); // "#login" -> "login"

    let attempts = 0;

    const scroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempts < 10) {
        attempts += 1;
        // Try again shortly in case the DOM isn't ready yet
        setTimeout(scroll, 50);
      }
    };

    scroll();
  }, [location]); // runs every time path OR hash changes

  return null;
}
