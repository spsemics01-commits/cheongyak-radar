"use client";
import { useState } from "react";

function cls(...a) { return a.filter(Boolean).join(" "); }

const QUESTIONS = [
  { key: "married", q: "혼인 상태", opts: ["신혼부부 (7년 이내)", "예비신혼부부", "한부모가족", "미혼·일반기혼"] },
  { key: "children", q: "자녀 현황", opts: ["6세 이하 자녀 있음", "미성년 자녀 있음", "자녀 없음"] },
  { key: "asset", q: "총 자산 (부동산 포함)", opts: ["3억 4,500만원 이하", "3억 4,500만원 초과"] },
  { key: "income", q: "월 소득 (도시근로자 평균 대비)", opts: ["70% 이하 (외벌이)", "70~90% (맞벌이)", "90~100%", "100% 초과"] },
  { key: "house", q: "주택 소유 여부", opts: ["무주택", "유주택"] },
];

function getResult(ans) {
  const { married, children, asset, income, house } = ans;

  // 유주택 → 불가
  if (house === "유주택") {
    return {
      grade: "❌", title: "공공청약 자격 미달", color: "red",
      msg: "공공청약은 무주택 세대구성원만 신청 가능해요.\n민간분양은 주택 소유와 무관하게 청약 가능합니다.",
      suggestions: ["민간분양 청약 확인하기"],
    };
  }

  // 소득·자산 초과
  if (income === "100% 초과" || asset === "3억 4,500만원 초과") {
    return {
      grade: "❌", title: "공공청약 소득/자산 기준 초과", color: "red",
      msg: "소득 또는 자산이 기준을 초과해요.\n민간분양 청약통장은 별도 자격 제한이 없으니 민간분양을 노려보세요!",
      suggestions: ["민간분양 청약 확인하기", "청약통장 가입 확인"],
    };
  }

  // 미혼·일반기혼
  if (married === "미혼·일반기혼") {
    return {
      grade: "ℹ️", title: "일반공급 대상", color: "blue",
      msg: "신혼특공 대상은 아니지만 일반공급·생애최초 특공으로 청약 가능해요.\n청약통장 가입기간과 납입횟수를 확인하세요.",
      suggestions: ["생애최초 특공 조건 확인", "일반공급 가점 계산"],
    };
  }

  // 한부모가족
  if (married === "한부모가족") {
    return {
      grade: "✅", title: "신혼희망타운 신청 가능", color: "green",
      msg: "한부모가족은 신혼희망타운 우선공급 대상이에요.\n소득 기준과 자녀 수에 따라 순위가 결정됩니다.",
      suggestions: ["LH청약플러스에서 공고 확인"],
    };
  }

  // 신혼·예비신혼 + 자녀 있음
  if (children === "6세 이하 자녀 있음") {
    return {
      grade: "🎉", title: "신혼희망타운 1~2순위!", color: "green",
      msg: "6세 이하 자녀가 있어 높은 순위로 지원 가능해요!\n자녀 수가 많을수록 우선순위가 올라갑니다.\n소득 기준: 도시근로자 평균의 70%(맞벌이 90%) 이하",
      suggestions: ["성남 신혼희망타운 공고 확인"],
    };
  }

  if (children === "미성년 자녀 있음") {
    return {
      grade: "✅", title: "신혼희망타운 2순위", color: "green",
      msg: "자녀가 있어 2순위 해당! 자녀 수가 많을수록 우선순위가 올라가요.\n6세 이하 자녀가 있으면 더 높은 순위를 받을 수 있어요.",
      suggestions: ["성남 신혼희망타운 공고 확인"],
    };
  }

  // 신혼·예비신혼 + 자녀 없음
  return {
    grade: "✅", title: "신혼희망타운 3순위", color: "green",
    msg: "자녀가 없는 신혼/예비신혼은 3순위예요.\n자녀 계획이 있으면 향후 순위가 올라갑니다!",
    suggestions: ["성남 신혼희망타운 공고 확인"],
  };
}

export function EligibilityPage() {
  const [ans, setAns] = useState({});
  const [result, setResult] = useState(null);

  const allAnswered = Object.keys(ans).length === QUESTIONS.length;
  const progress = (Object.keys(ans).length / QUESTIONS.length) * 100;

  const check = () => {
    if (!allAnswered) {
      alert("모든 항목을 선택해주세요!");
      return;
    }
    setResult(getResult(ans));
  };

  const reset = () => {
    setAns({});
    setResult(null);
  };

  const cc = {
    green: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
    red: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    blue: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  };
  const tc = {
    green: "text-emerald-700 dark:text-emerald-300",
    red: "text-red-600 dark:text-red-300",
    blue: "text-blue-700 dark:text-blue-300",
  };

  return (
    <div className="px-4 py-5 space-y-5">
      {/* 헤더 */}
      <div>
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">내 청약 자격 체크</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">신혼희망타운 / 공공분양 기준</p>
      </div>

      {/* 진행률 바 */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 질문들 */}
      {QUESTIONS.map(({ key, q, opts }) => (
        <div key={key}>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{q}</p>
          <div className="flex flex-col gap-2">
            {opts.map((opt) => (
              <button
                key={opt}
                onClick={() => { setAns((a) => ({ ...a, [key]: opt })); setResult(null); }}
                className={cls(
                  "text-xs py-2.5 px-4 rounded-xl border text-left font-medium transition-all",
                  ans[key] === opt
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                {ans[key] === opt ? "● " : "○ "}{opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 확인 / 초기화 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={check}
          disabled={!allAnswered}
          className={cls(
            "flex-1 py-3.5 rounded-2xl font-black text-sm transition-all",
            allAnswered
              ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          )}
        >
          자격 확인하기
        </button>
        {Object.keys(ans).length > 0 && (
          <button
            onClick={reset}
            className="px-4 py-3.5 rounded-2xl font-bold text-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {/* 결과 */}
      {result && (
        <div className={cls("rounded-2xl p-4 border", cc[result.color])} style={{ animation: "fadeUp .3s ease" }}>
          <p className={cls("text-base font-black mb-1", tc[result.color])}>
            {result.grade} {result.title}
          </p>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">{result.msg}</p>
          {result.suggestions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {result.suggestions.map((s) => (
                <span key={s} className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                  💡 {s}
                </span>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">
            정확한 자격은 LH 콜센터 1600-1004 또는 청약홈에서 확인하세요
          </p>
        </div>
      )}
    </div>
  );
}
