"use client";
import { useState, useEffect } from "react";

export function useDarkMode() {
  const [dark, setDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) {
        setDark(JSON.parse(stored));
      } else {
        // 시스템 다크모드 감지
        setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    } catch {
      // 기본값 유지
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("darkMode", JSON.stringify(dark));
    } catch {}
  }, [dark, isLoaded]);

  return [dark, setDark];
}
