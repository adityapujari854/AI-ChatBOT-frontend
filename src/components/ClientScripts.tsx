// src/components/ClientScripts.tsx
"use client";

import { useEffect } from "react";

export default function ClientScripts() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Register service worker
      window.addEventListener("load", () => {
        navigator.serviceWorker
          ?.register("/sw.js")
          .then((reg) => console.log("✅ Service Worker registered:", reg))
          .catch((err) => console.error("❌ Service Worker failed:", err));
      });

      // Prevent zooming with Ctrl + scroll or Ctrl + [+/-]
      const preventZoom = (e: WheelEvent | KeyboardEvent) => {
        if ('ctrlKey' in e && e.ctrlKey) e.preventDefault();
      };

      // Prevent dev tools and view source
      const preventKeys = (e: KeyboardEvent) => {
        const zoomKeys = ["+", "-", "="];
        const devKeys = ["F12", "I", "J", "U"];
        if ((e.ctrlKey || e.metaKey) && zoomKeys.includes(e.key)) e.preventDefault();

        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && devKeys.includes(e.key)) ||
          (e.ctrlKey && e.key.toUpperCase() === "U")
        ) {
          e.preventDefault();
        }
      };

      // Other restrictions
      window.addEventListener("wheel", preventZoom, { passive: false });
      window.addEventListener("keydown", preventKeys);
      window.addEventListener("contextmenu", (e) => e.preventDefault());
      document.addEventListener("selectstart", (e) => e.preventDefault());
    }
  }, []);

  return null;
}