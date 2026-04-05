"use client";
import { StatusBadge, TypeBadge, HotBadge } from "./Badges";

function cls(...a) { return a.filter(Boolean).join(" "); }

export function DetailModal({ item, onClose, bookmarks, toggleBookmark }) {
  const bked = bookmarks.includes(item.id);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900" style={{ animation: "slideUp .25s ease" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={onClose}
          className="text-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h2 className="flex-1 text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">{item.name}</h2>
        <button
          onClick={() => toggleBookmark(item.id)}
          className="text-xl hover:scale-110 transition-transform"
          aria-label={bked ? "북마크 해제" : "북마크 추가"}
        >
          {bked ? "🔖" : "🤍"}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* 배지 */}
        <div className="flex flex-wrap gap-2">
          <TypeBadge type={item.type} />
          {item.status && <StatusBadge status={item.status} />}
          {item.is_hot && <HotBadge />}
        </div>

        {/* 핵심 정보 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ["📍 위치", item.location],
            ["📅 일정", item.date],
            ["🏠 세대수", item.units ? item.units + "세대" : null],
            ["💰 분양가", item.price],
          ]
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">{value}</p>
              </div>
            ))}
        </div>

        {/* 상세 정보 */}
        {item.detail && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">📋 상세 정보</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{item.detail}</p>
          </div>
        )}

        {/* 신청 자격 */}
        {item.eligibility && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">✅ 신청 자격</p>
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-line">{item.eligibility}</p>
          </div>
        )}

        {/* 주의사항 */}
        {item.caution && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">⚠️ 주의사항</p>
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed whitespace-pre-line">{item.caution}</p>
          </div>
        )}

        {/* 외부 링크 */}
        <a
          href="https://apply.lh.or.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl py-3.5 transition-colors"
        >
          LH청약플러스 공식 확인 →
        </a>
        <a
          href="https://www.applyhome.co.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-2xl py-3 transition-colors"
        >
          청약홈 바로가기 →
        </a>
      </div>
    </div>
  );
}
