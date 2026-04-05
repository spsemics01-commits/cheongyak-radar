"use client";

function cls(...a) { return a.filter(Boolean).join(" "); }

export function StatusBadge({ status }) {
  const m = {
    "진행중": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    "마감임박": "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
    "예정": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "마감": "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  };
  return (
    <span className={cls("text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors", m[status] || m["예정"])}>
      {status}
    </span>
  );
}

export function TypeBadge({ type }) {
  const m = {
    "공공분양": "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
    "민간분양": "bg-violet-50 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300",
    "신혼희망타운": "bg-pink-50 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
    "공공임대": "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  };
  return (
    <span className={cls("text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors", m[type] || "bg-gray-50 text-gray-500")}>
      {type}
    </span>
  );
}

export function HotBadge() {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
      🔥 인기
    </span>
  );
}
