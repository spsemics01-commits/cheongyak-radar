"use client";
import { useState } from "react";

function cls(...a) { return a.filter(Boolean).join(" "); }

function formatWon(num) {
  if (num >= 10000) return `${(num / 10000).toFixed(1).replace(/\.0$/, "")}억 ${num % 10000 > 0 ? `${num % 10000}만` : ""}`.trim();
  return `${num}만`;
}

function formatMonth(num) {
  return `${Math.round(num).toLocaleString()}만원`;
}

export function LoanCalculator({ price }) {
  // 분양가에서 숫자 추출 (억 단위)
  const parsedPrice = (() => {
    if (!price) return null;
    const match = price.match(/(\d+\.?\d*)\s*억/);
    if (match) return Math.round(parseFloat(match[1]) * 10000);
    const match2 = price.match(/([\d,]+)\s*만/);
    if (match2) return parseInt(match2[1].replace(/,/g, ""));
    return null;
  })();

  const [totalPrice, setTotalPrice] = useState(parsedPrice || 50000); // 만원 단위
  const [myCash, setMyCash] = useState(20000); // 만원 단위
  const [rate, setRate] = useState(3.5); // 금리 %
  const [years, setYears] = useState(30); // 대출 기간
  const [open, setOpen] = useState(false);

  const loanAmount = Math.max(0, totalPrice - myCash);
  const ltvRatio = totalPrice > 0 ? ((loanAmount / totalPrice) * 100).toFixed(0) : 0;

  // 원리금균등상환 월 상환액 계산
  const monthlyPayment = (() => {
    if (loanAmount <= 0) return 0;
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    if (monthlyRate === 0) return loanAmount / months;
    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  })();

  const totalRepay = monthlyPayment * years * 12;
  const totalInterest = totalRepay - loanAmount;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-center text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl py-3 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
      >
        💰 자금 계산기 열기
      </button>
    );
  }

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 space-y-4" style={{ animation: "fadeUp .3s ease" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">💰 자금 계산기</p>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-400">접기</button>
      </div>

      {/* 분양가 */}
      <div>
        <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">분양가 (만원)</label>
        <input
          type="range" min={10000} max={150000} step={1000} value={totalPrice}
          onChange={(e) => setTotalPrice(Number(e.target.value))}
          className="w-full accent-emerald-600"
        />
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{formatWon(totalPrice)}원</p>
      </div>

      {/* 자기자금 */}
      <div>
        <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">내 자기자금 (만원)</label>
        <input
          type="range" min={0} max={totalPrice} step={500} value={Math.min(myCash, totalPrice)}
          onChange={(e) => setMyCash(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{formatWon(myCash)}원</p>
      </div>

      {/* 금리 & 기간 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">금리 (%)</label>
          <div className="flex gap-1">
            {[3.0, 3.5, 4.0, 4.5].map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={cls(
                  "flex-1 text-[11px] py-1.5 rounded-lg font-bold transition-colors",
                  rate === r
                    ? "bg-emerald-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                )}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 block">대출 기간</label>
          <div className="flex gap-1">
            {[20, 30, 40].map((y) => (
              <button
                key={y}
                onClick={() => setYears(y)}
                className={cls(
                  "flex-1 text-[11px] py-1.5 rounded-lg font-bold transition-colors",
                  years === y
                    ? "bg-emerald-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                )}
              >
                {y}년
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">필요 대출금</span>
          <span className="text-sm font-black text-red-600 dark:text-red-400">{formatWon(loanAmount)}원</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">LTV 비율</span>
          <span className={cls("text-sm font-bold", Number(ltvRatio) > 70 ? "text-red-600" : "text-emerald-600")}>
            {ltvRatio}% {Number(ltvRatio) > 70 ? "⚠️ 초과 가능" : "✅"}
          </span>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">월 상환금 (원리금균등)</span>
          <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
            {formatMonth(monthlyPayment)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">총 이자</span>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{formatWon(Math.round(totalInterest))}원</span>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
        * 원리금균등상환 기준 예상치입니다. 실제 대출 조건은 은행·신용등급에 따라 달라요.
        LTV 규제지역은 최대 70%, 비규제지역 80%까지 가능합니다.
      </p>
    </div>
  );
}
