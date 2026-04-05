"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { AREAS, TYPES, FALLBACK } from "./constants";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useDarkMode } from "./hooks/useDarkMode";
import { StatusBadge, TypeBadge } from "./components/Badges";
import { Skeleton } from "./components/Skeleton";
import { Card } from "./components/Card";
import { DetailModal } from "./components/DetailModal";
import { BottomNav } from "./components/BottomNav";
import { EligibilityPage } from "./components/EligibilityPage";
import { Toast } from "./components/Toast";

function cls(...a) { return a.filter(Boolean).join(" "); }

// 데이터 신선도 표시 (몇 시간 전 업데이트)
function timeSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "방금 전 업데이트";
  if (hours < 24) return `${hours}시간 전 업데이트`;
  const days = Math.floor(hours / 24);
  return `${days}일 전 업데이트`;
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);
  const [lastFetchedRaw, setLastFetchedRaw] = useState(null);
  const [area, setArea] = useState("전체");
  const [type, setType] = useState("전체");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  // 영구 저장 북마크 & 다크모드
  const [bookmarks, setBookmarks] = useLocalStorage("cheongyak-bookmarks", []);
  const [dark, setDark] = useDarkMode();

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("cheongyak")
        .select("*")
        .order("is_hot", { ascending: false });

      if (fetchError || !data || data.length === 0) {
        setItems(FALLBACK);
        setUsingFallback(true);
      } else {
        setItems(data);
        setUsingFallback(false);
      }

      const { data: meta } = await supabase
        .from("cheongyak_meta")
        .select("*")
        .eq("id", 1)
        .single();

      if (meta) {
        setSummary(meta.summary || "");
        setLastFetched(new Date(meta.last_fetched).toLocaleDateString("ko-KR"));
        setLastFetchedRaw(meta.last_fetched);
      }
    } catch (err) {
      setItems(FALLBACK);
      setUsingFallback(true);
      setError("데이터를 불러오지 못했어요. 샘플 데이터를 표시합니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleBookmark = useCallback((id) => {
    setBookmarks((b) => {
      const next = b.includes(id) ? b.filter((x) => x !== id) : [...b, id];
      showToast(
        next.includes(id) ? "관심 청약에 추가했어요" : "관심 청약에서 제거했어요",
        next.includes(id) ? "success" : "info"
      );
      return next;
    });
  }, [setBookmarks, showToast]);

  const filtered = items.filter((i) => {
    const a = area === "전체" || (i.area || i.location || "").includes(area);
    const t = type === "전체" || i.type === type;
    const s = !search || (i.name || "").includes(search) || (i.location || "").includes(search);
    return a && t && s;
  });

  const active = items.filter((i) => i.status === "진행중");
  const upcoming = items.filter((i) => i.status === "예정");
  const closing = items.filter((i) => i.status === "마감임박");
  const hot = items.filter((i) => i.is_hot);
  const saved = items.filter((i) => bookmarks.includes(i.id));

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0 transition-colors">
        <div>
          <h1 className="text-base font-black text-gray-900 dark:text-gray-100">
            청약레이더 <span className="text-indigo-500">성남·수지·하남</span>
          </h1>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            {lastFetched
              ? `${lastFetched} 기준 · ${timeSince(lastFetchedRaw) || ""}`
              : "분당 · 판교 · 위례 · 수지 · 하남"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {usingFallback && (
            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full font-bold">
              샘플
            </span>
          )}
          <button
            onClick={() => setDark((d) => !d)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
            aria-label="다크모드 전환"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900 px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
          <button onClick={() => { setError(null); loadData(); }} className="text-xs font-bold text-red-600 dark:text-red-300">
            재시도
          </button>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* ===== HOME ===== */}
        {tab === "home" && (
          <div className="px-4 py-5 space-y-5">
            {/* Hero */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 text-white shadow-lg">
              <p className="text-xs opacity-60 mb-1">📍 성남 · 분당 · 판교 · 수지 · 하남</p>
              <h2 className="text-xl font-black leading-tight mb-1">성남·수지·하남 청약레이더</h2>
              <p className="text-xs opacity-75 mb-4">내 집 마련 기회를 놓치지 마세요</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTab("list")}
                  className="bg-white text-indigo-700 text-xs font-black px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  전체 공고 보기 →
                </button>
                <button
                  onClick={() => setTab("check")}
                  className="bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-white/30 transition-colors"
                >
                  자격 체크
                </button>
              </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "진행중", value: active.length, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
                { label: "마감임박", value: closing.length, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/30" },
                { label: "예정", value: upcoming.length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
                { label: "전체", value: items.length, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} onClick={() => setTab("list")} className={cls("rounded-2xl p-3 text-center cursor-pointer hover:scale-[1.02] transition-transform", bg)}>
                  {loading
                    ? <div className="h-7 bg-white/50 dark:bg-gray-700/50 rounded animate-pulse mx-2 mb-1" />
                    : <p className={cls("text-xl font-black", color)}>{value}</p>
                  }
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {/* AI 요약 */}
            {summary && (
              <div className="bg-indigo-600 dark:bg-indigo-800 rounded-2xl p-4 text-white">
                <p className="text-[10px] font-bold opacity-70 mb-1">🤖 AI 요약</p>
                <p className="text-xs leading-relaxed">{summary}</p>
              </div>
            )}

            {/* 주목할 단지 */}
            {hot.length > 0 && (
              <div>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 mb-3">🔥 주목할 단지</p>
                <div className="space-y-2">
                  {hot.map((item, i) => (
                    <div
                      key={item.id || i}
                      onClick={() => setDetail(item)}
                      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-3 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
                    >
                      <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-lg">🏢</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{item.date}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && <><Skeleton /><Skeleton /></>}

            {/* 마감 임박 알림 */}
            {closing.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-2xl p-4">
                <p className="text-xs font-bold text-red-600 dark:text-red-300 mb-1">⏰ 마감 임박 공고</p>
                <p className="text-xs text-red-700 dark:text-red-200 leading-relaxed">
                  {closing.length}건의 공고가 곧 마감돼요. 서둘러 확인하세요!
                </p>
              </div>
            )}

            {/* 청약 꿀팁 */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">💡 청약 꿀팁</p>
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                신혼희망타운 공고는 1~2주 전에 올라와요. 매일 확인하는 게 중요해요!
              </p>
            </div>

            {/* 빠른 링크 */}
            <div className="grid grid-cols-2 gap-2">
              <a href="https://apply.lh.or.kr" target="_blank" rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-3 text-center hover:shadow-md transition-all">
                <p className="text-lg mb-1">🏛️</p>
                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">LH청약플러스</p>
              </a>
              <a href="https://www.applyhome.co.kr" target="_blank" rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-3 text-center hover:shadow-md transition-all">
                <p className="text-lg mb-1">🏠</p>
                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">청약홈</p>
              </a>
            </div>
          </div>
        )}

        {/* ===== LIST ===== */}
        {tab === "list" && (
          <div className="flex flex-col">
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 pt-4 pb-3 space-y-3 transition-colors">
              {/* 검색 */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="단지명, 지역 검색..."
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* 지역 필터 */}
              <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                {AREAS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setArea(a)}
                    className={cls(
                      "flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-colors",
                      area === a
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
              {/* 유형 필터 */}
              <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cls(
                      "flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors",
                      type === t
                        ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 py-4 space-y-3">
              {loading && <><Skeleton /><Skeleton /><Skeleton /></>}
              {!loading && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">총 {filtered.length}건</p>
                  {(area !== "전체" || type !== "전체" || search) && (
                    <button
                      onClick={() => { setArea("전체"); setType("전체"); setSearch(""); }}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold"
                    >
                      필터 초기화
                    </button>
                  )}
                </div>
              )}
              {filtered.map((item, i) => (
                <Card
                  key={item.id}
                  item={item}
                  idx={i}
                  onClick={() => setDetail(item)}
                  bookmarks={bookmarks}
                  toggleBookmark={toggleBookmark}
                />
              ))}
              {!loading && filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🏙️</p>
                  <p className="text-sm font-bold text-gray-400 dark:text-gray-500">해당 조건의 공고가 없어요</p>
                  <button
                    onClick={() => { setArea("전체"); setType("전체"); setSearch(""); }}
                    className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold"
                  >
                    필터 초기화하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ELIGIBILITY ===== */}
        {tab === "check" && <EligibilityPage />}

        {/* ===== BOOKMARKS ===== */}
        {tab === "bookmarks" && (
          <div className="px-4 py-5 space-y-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">관심 청약</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {saved.length > 0 ? `${saved.length}개 저장됨` : "저장한 공고예요"}
              </p>
            </div>
            {saved.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-3">🔖</p>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500">저장한 청약이 없어요</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">카드에서 🤍 눌러 저장하세요</p>
                <button
                  onClick={() => setTab("list")}
                  className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  청약 공고 둘러보기 →
                </button>
              </div>
            ) : (
              saved.map((item, i) => (
                <Card
                  key={item.id}
                  item={item}
                  idx={i}
                  onClick={() => setDetail(item)}
                  bookmarks={bookmarks}
                  toggleBookmark={toggleBookmark}
                />
              ))
            )}
          </div>
        )}
      </main>

      <BottomNav tab={tab} setTab={setTab} bookmarkCount={bookmarks.length} />

      {detail && (
        <DetailModal
          item={detail}
          onClose={() => setDetail(null)}
          bookmarks={bookmarks}
          toggleBookmark={toggleBookmark}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
