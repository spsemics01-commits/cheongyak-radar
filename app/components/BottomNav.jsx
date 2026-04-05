"use client";

function cls(...a) { return a.filter(Boolean).join(" "); }

export function BottomNav({ tab, setTab, bookmarkCount }) {
  const items = [
    { id: "home", label: "홈", icon: "🏠" },
    { id: "list", label: "청약", icon: "📋" },
    { id: "check", label: "자격체크", icon: "✅" },
    { id: "bookmarks", label: "관심", icon: "🔖", badge: bookmarkCount },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center px-2 py-2 flex-shrink-0">
      {items.map(({ id, label, icon, badge }) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          className={cls(
            "flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors",
            tab === id ? "bg-indigo-50 dark:bg-indigo-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-800"
          )}
          aria-label={label}
          aria-current={tab === id ? "page" : undefined}
        >
          <span className="text-lg relative">
            {icon}
            {badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </span>
          <span className={cls("text-[10px] font-bold", tab === id ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500")}>
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}
