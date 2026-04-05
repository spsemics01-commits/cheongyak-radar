"use client";
import { StatusBadge, TypeBadge } from "./Badges";

function cls(...a) { return a.filter(Boolean).join(" "); }

export function Card({ item, onClick, bookmarks, toggleBookmark, idx }) {
  const bked = bookmarks.includes(item.id);
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
      style={{ animation: "fadeUp .3s ease both", animationDelay: `${idx * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <div className="flex flex-wrap gap-1 mb-2">
            <TypeBadge type={item.type} />
            <StatusBadge status={item.status} />
            {item.is_hot && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                🔥
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">{item.name}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.location}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}
          className="text-lg flex-shrink-0 hover:scale-110 transition-transform active:scale-95"
          aria-label={bked ? "북마크 해제" : "북마크 추가"}
        >
          {bked ? "🔖" : "🤍"}
        </button>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 cursor-pointer" onClick={onClick}>
        {item.date && <span className="text-xs text-gray-500 dark:text-gray-400">📅 {item.date}</span>}
        {item.units && <span className="text-xs text-gray-500 dark:text-gray-400">🏠 {item.units}세대</span>}
        {item.price && <span className="text-xs text-gray-500 dark:text-gray-400">💰 {item.price}</span>}
      </div>
      <button
        onClick={onClick}
        className="w-full text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl py-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
      >
        자세히 보기 →
      </button>
    </div>
  );
}
