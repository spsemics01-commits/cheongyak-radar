"use client";
import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch {
      // localStorage 접근 불가 시 기본값 유지
    }
    setIsLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장 실패 시 무시
    }
  }, [key, value, isLoaded]);

  return [value, setValue, isLoaded];
}
