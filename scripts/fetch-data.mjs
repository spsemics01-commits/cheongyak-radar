// scripts/fetch-data.mjs
// GitHub Actions에서 매일 실행 → Claude API (웹 검색) → Supabase 저장 → 이메일 알림

import { createClient } from "@supabase/supabase-js";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const RESEND_API = "https://api.resend.com/emails";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 5000;
const NOTIFY_EMAIL = "fit6293@gmail.com";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateItem(item) {
  if (!item.name || typeof item.name !== "string") return false;
  if (!item.type || !["공공분양", "민간분양", "신혼희망타운", "공공임대"].includes(item.type)) return false;
  if (!item.status || !["진행중", "예정", "마감임박", "마감"].includes(item.status)) return false;
  return true;
}

function extractJSON(text) {
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function callClaudeAPI(prompt, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Claude API 호출 (시도 ${attempt + 1}/${retries + 1})...`);

      const res = await fetch(ANTHROPIC_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 4000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API ${res.status}: ${errText.slice(0, 200)}`);
      }

      const data = await res.json();
      const text = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      return text;
    } catch (err) {
      console.error(`❌ 시도 ${attempt + 1} 실패:`, err.message);
      if (attempt < retries) {
        console.log(`⏳ ${RETRY_DELAY_MS / 1000}초 후 재시도...`);
        await sleep(RETRY_DELAY_MS);
      } else {
        throw err;
      }
    }
  }
}

// 민간분양 위주로 주목할 공고 이메일 발송
async function sendNotification(items, summary) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("📧 RESEND_API_KEY 없음 - 이메일 알림 건너뜀");
    return;
  }

  // 민간분양 + 진행중/예정/마감임박 필터
  const notable = items.filter(
    (i) => i.type === "민간분양" && ["진행중", "예정", "마감임박"].includes(i.status)
  );

  // 주목할 공고 (is_hot이거나 마감임박)
  const hot = items.filter(
    (i) => (i.is_hot || i.status === "마감임박") && ["진행중", "예정", "마감임박"].includes(i.status)
  );

  // 알릴 게 없으면 스킵
  if (notable.length === 0 && hot.length === 0) {
    console.log("📧 알릴 만한 공고 없음 - 이메일 건너뜀");
    return;
  }

  const today = new Date().toLocaleDateString("ko-KR");

  // HTML 이메일 생성
  const makeCard = (item) => `
    <div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-bottom:12px;">
      <div style="display:flex;gap:8px;margin-bottom:8px;">
        <span style="background:${item.type === "민간분양" ? "#ede9fe" : "#e0f2fe"};color:${item.type === "민간분양" ? "#7c3aed" : "#0369a1"};font-size:11px;font-weight:bold;padding:2px 8px;border-radius:20px;">${item.type}</span>
        <span style="background:${item.status === "마감임박" ? "#fee2e2" : item.status === "진행중" ? "#d1fae5" : "#dbeafe"};color:${item.status === "마감임박" ? "#dc2626" : item.status === "진행중" ? "#059669" : "#2563eb"};font-size:11px;font-weight:bold;padding:2px 8px;border-radius:20px;">${item.status}</span>
        ${item.is_hot ? '<span style="font-size:11px;">🔥</span>' : ""}
      </div>
      <h3 style="margin:0 0 4px;font-size:15px;color:#111;">${item.name}</h3>
      <p style="margin:0 0 8px;font-size:13px;color:#666;">${item.location || ""}</p>
      <div style="font-size:12px;color:#555;">
        ${item.date ? `📅 ${item.date}<br>` : ""}
        ${item.units ? `🏠 ${item.units}세대<br>` : ""}
        ${item.price ? `💰 ${item.price}<br>` : ""}
      </div>
      ${item.detail ? `<p style="margin:8px 0 0;font-size:12px;color:#444;line-height:1.6;">${item.detail.replace(/\n/g, "<br>")}</p>` : ""}
    </div>`;

  const html = `
    <div style="max-width:480px;margin:0 auto;font-family:'Apple SD Gothic Neo',sans-serif;">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px;padding:20px;color:white;margin-bottom:16px;">
        <h1 style="margin:0;font-size:18px;">🏠 청약레이더 알림</h1>
        <p style="margin:4px 0 0;font-size:13px;opacity:0.8;">${today} 기준 성남·수지</p>
      </div>
      ${summary ? `<div style="background:#4f46e5;border-radius:12px;padding:14px;color:white;margin-bottom:16px;font-size:13px;line-height:1.5;">🤖 ${summary}</div>` : ""}
      ${notable.length > 0 ? `<h2 style="font-size:15px;color:#111;margin:16px 0 8px;">📋 민간분양 공고 (${notable.length}건)</h2>${notable.map(makeCard).join("")}` : ""}
      ${hot.length > 0 ? `<h2 style="font-size:15px;color:#111;margin:16px 0 8px;">🔥 주목할 공고 (${hot.length}건)</h2>${hot.map(makeCard).join("")}` : ""}
      <div style="text-align:center;margin-top:20px;">
        <a href="https://cheongyak-radar.vercel.app" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:bold;">앱에서 자세히 보기 →</a>
      </div>
      <p style="text-align:center;font-size:11px;color:#aaa;margin-top:16px;">청약레이더 자동 알림 | 매일 자정·오전 9시 발송</p>
    </div>`;

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "청약레이더 <onboarding@resend.dev>",
        to: [NOTIFY_EMAIL],
        subject: `[청약레이더] ${today} - 민간분양 ${notable.length}건${hot.length > 0 ? `, 주목 ${hot.length}건` : ""}`,
        html,
      }),
    });

    if (res.ok) {
      console.log(`📧 이메일 발송 성공! → ${NOTIFY_EMAIL}`);
    } else {
      const err = await res.text();
      console.error(`📧 이메일 발송 실패:`, err);
    }
  } catch (err) {
    console.error(`📧 이메일 오류:`, err.message);
  }
}

async function fetchCheongyak() {
  const startTime = Date.now();
  console.log("🔍 청약 정보 수집 시작...", new Date().toISOString());

  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  const prompt = `당신은 부동산 청약 전문가입니다. ${today} 기준 아래 지역의 아파트 청약 공고를 웹에서 검색해서 알려주세요.

대상 지역: 성남시(분당·판교·위례·복정 포함), 용인시 수지구

검색할 사이트:
- LH청약플러스 (apply.lh.or.kr)
- 청약홈 (applyhome.co.kr)
- SH서울주택도시공사
- 관련 뉴스 기사

반드시 아래 JSON 형식만 응답하세요. 마크다운이나 설명 없이 순수 JSON만:

{
  "summary": "${today} 기준 성남·용인수지 청약 현황 2~3문장 요약",
  "items": [
    {
      "name": "단지명 (정확한 공식 명칭)",
      "type": "공공분양|민간분양|신혼희망타운|공공임대 중 하나",
      "location": "상세 주소",
      "date": "청약 일정 (예: 2026년 4월 10일~15일)",
      "units": "세대수 (숫자 문자열, 미확정이면 null)",
      "price": "분양가 또는 임대료 요약",
      "status": "진행중|예정|마감임박|마감 중 하나",
      "isHot": true/false (주목할 만한 단지인지),
      "area": "성남|분당|판교|위례|복정|수지 중 가장 가까운 곳",
      "detail": "일반인이 이해하기 쉽게 3~5줄 핵심 정보",
      "eligibility": "신청 자격 핵심 요약",
      "caution": "꼭 알아야 할 주의사항"
    }
  ]
}

주의: 마감된 공고도 최근 1개월 이내라면 포함하세요. 예정 공고는 가능한 많이 포함해주세요.`;

  try {
    const text = await callClaudeAPI(prompt);
    console.log("📝 응답 길이:", text.length);

    const parsed = extractJSON(text);
    if (!parsed) {
      throw new Error("JSON 파싱 실패. 응답: " + text.slice(0, 300));
    }

    const rawItems = parsed.items || [];
    const summary = parsed.summary || "";

    // 데이터 검증
    const validItems = rawItems.filter((item, idx) => {
      if (validateItem(item)) return true;
      console.warn(`⚠️ 항목 ${idx + 1} 검증 실패:`, JSON.stringify(item).slice(0, 100));
      return false;
    });

    console.log(`✅ 파싱 완료: 총 ${rawItems.length}개 중 ${validItems.length}개 유효`);

    if (validItems.length === 0) {
      console.warn("⚠️ 유효한 공고가 0개입니다. 기존 데이터를 유지합니다.");
      await supabase.from("cheongyak_meta").upsert({
        id: 1,
        summary: summary || "오늘은 새로운 공고가 확인되지 않았습니다.",
        last_fetched: new Date().toISOString(),
      });
      return;
    }

    // 기존 데이터 삭제 후 새 데이터 삽입
    const { error: deleteError } = await supabase.from("cheongyak").delete().neq("id", 0);
    if (deleteError) throw new Error("Supabase 삭제 오류: " + deleteError.message);

    const rows = validItems.map((item) => ({
      name: item.name,
      type: item.type,
      location: item.location || "",
      date: item.date || "",
      units: item.units,
      price: item.price || "",
      status: item.status,
      is_hot: item.isHot || false,
      area: item.area || "성남",
      detail: item.detail || "",
      eligibility: item.eligibility || "",
      caution: item.caution || "",
      fetched_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase.from("cheongyak").insert(rows);
    if (insertError) throw new Error("Supabase 삽입 오류: " + insertError.message);

    // 메타 업데이트
    await supabase.from("cheongyak_meta").upsert({
      id: 1,
      summary,
      last_fetched: new Date().toISOString(),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🎉 완료! ${validItems.length}개 공고 저장 (${elapsed}초 소요)`);
    console.log("요약:", summary);

    // 이메일 알림 발송
    await sendNotification(rows, summary);

  } catch (err) {
    console.error("❌ 최종 오류:", err.message);
    process.exit(1);
  }
}

fetchCheongyak();
