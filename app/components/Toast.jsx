"use client";
import { useEffect } from "react";

export function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-indigo-600",
    warning: "bg-amber-600",
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-[fadeUp_0.25s_ease]">
      <div className={`${colors[type] || colors.info} text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg`}>
        {message}
      </div>
    </div>
  );
}
