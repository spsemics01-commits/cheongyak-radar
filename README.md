# 🏠 청약레이더 성남

성남·분당·판교·위례·복정 청약 정보를 매일 자동 수집해서 보여주는 PWA 웹앱입니다.

## ✨ 주요 기능

- **자동 데이터 수집**: GitHub Actions + Claude API(웹 검색)로 매일 2회 최신 청약 정보 수집
- **AI 요약**: 오늘의 청약 현황을 AI가 2~3줄로 요약
- **청약 자격 체크**: 신혼희망타운/공공분양 자격을 간단한 문답으로 확인
- **관심 청약 저장**: 북마크 기능으로 관심 공고를 영구 저장 (localStorage)
- **다크모드**: 시스템 설정 연동 + 수동 전환 지원
- **PWA 오프라인**: 서비스 워커로 오프라인에서도 앱 접근 가능
- **반응형 모바일 UI**: 모바일 최적화 인터페이스

---

## 💰 운영 비용

| 항목 | 비용 |
|------|------|
| Vercel 호스팅 | **무료** |
| Supabase DB | **무료** (500MB 한도) |
| GitHub Actions | **무료** (월 2,000분) |
| Claude API (하루 2회) | **약 $0.03/일 = 월 1,000원** |
| **합계** | **월 ~1,000원** |

> Claude Sonnet 모델 사용으로 비용을 최적화했습니다.

---

## 🚀 배포 순서

### 사전 준비

- [Node.js 20+](https://nodejs.org) 설치
- [GitHub](https://github.com) 계정
- [Supabase](https://supabase.com) 계정
- [Vercel](https://vercel.com) 계정
- [Anthropic API Key](https://console.anthropic.com) (Claude API)

### 1단계: Supabase 설정

1. [supabase.com](https://supabase.com) 가입 → **New Project** 생성
   - 프로젝트 이름: `cheongyak-radar`
   - 리전: **Northeast Asia (Seoul)** 선택 권장
   - DB 비밀번호 설정 후 기억해두기

2. 프로젝트 생성 완료 후 **SQL Editor** 열기
   - `supabase/schema.sql` 파일의 내용 전체 복사 → 붙여넣기 → **Run** 실행
   - `cheongyak_meta` 테이블도 생성:
   ```sql
   create table if not exists cheongyak_meta (
     id int primary key default 1,
     summary text,
     last_fetched timestamptz default now()
   );
   alter table cheongyak_meta enable row level security;
   create policy "public read meta" on cheongyak_meta for select using (true);
   ```

3. **Settings → API** 에서 값 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY` (**절대 공개 금지!**)

### 2단계: GitHub 설정

1. 이 프로젝트를 새 GitHub 레포지토리로 push
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/{username}/cheongyak-radar.git
   git push -u origin main
   ```

2. **Settings → Secrets and variables → Actions → New repository secret** 에서 3개 등록:

   | Secret 이름 | 값 |
   |---|---|
   | `ANTHROPIC_API_KEY` | Anthropic 콘솔에서 발급한 API 키 |
   | `SUPABASE_URL` | Supabase Project URL |
   | `SUPABASE_SERVICE_KEY` | Supabase service_role key |

3. **Actions 탭** → "🏠 청약 데이터 자동 수집" → **Run workflow** 클릭 (첫 수동 실행)
   - ✅ 성공 → Supabase에 데이터가 들어감
   - ❌ 실패 → 로그에서 API 키 확인
   - 이후 매일 자정 + 오전 9시에 자동 실행

### 3단계: Vercel 배포

1. [vercel.com](https://vercel.com) 가입 → **New Project** → GitHub 레포 연결

2. **Environment Variables** 추가 (2개만 필요):

   | 변수 이름 | 값 |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |

3. **Deploy** 클릭! 배포 완료 후 URL로 접속하면 끝!

### 4단계: PWA 아이콘 (선택)

`public/icons/` 폴더에 아이콘 파일을 추가하면 홈화면에 앱 아이콘이 표시됩니다:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

> 무료 도구: [favicon.io](https://favicon.io) 또는 [realfavicongenerator.net](https://realfavicongenerator.net)

---

## 📱 PWA 홈화면 설치

- **iOS Safari**: 공유 버튼 → "홈 화면에 추가"
- **Android Chrome**: 주소창 → "앱 설치" 또는 메뉴 → "홈 화면에 추가"

---

## 🔧 로컬 개발

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 실제 Supabase 값 입력

# 개발 서버 실행
npm run dev
# http://localhost:3000 접속
```

---

## 📁 파일 구조

```
cheongyak-radar/
├── .github/workflows/
│   └── daily-fetch.yml          # 매일 자정+오전9시 자동 실행
├── app/
│   ├── components/
│   │   ├── Badges.jsx           # 상태/유형 배지 컴포넌트
│   │   ├── BottomNav.jsx        # 하단 네비게이션
│   │   ├── Card.jsx             # 청약 공고 카드
│   │   ├── DetailModal.jsx      # 상세 정보 모달
│   │   ├── EligibilityPage.jsx  # 자격 체크 페이지
│   │   ├── Skeleton.jsx         # 로딩 스켈레톤
│   │   └── Toast.jsx            # 토스트 알림
│   ├── constants/
│   │   └── index.js             # 상수 (지역, 유형, 폴백 데이터)
│   ├── hooks/
│   │   ├── useDarkMode.js       # 다크모드 커스텀 훅
│   │   └── useLocalStorage.js   # localStorage 커스텀 훅
│   ├── layout.jsx               # 루트 레이아웃 (PWA, 메타태그, SW 등록)
│   ├── page.jsx                 # 메인 앱 UI
│   └── globals.css              # 글로벌 스타일 (다크모드 포함)
├── lib/
│   └── supabase.js              # Supabase 클라이언트
├── scripts/
│   └── fetch-data.mjs           # Claude API → Supabase 저장 (재시도 로직 포함)
├── supabase/
│   └── schema.sql               # DB 테이블 생성 SQL
├── public/
│   ├── icons/                   # PWA 아이콘
│   ├── manifest.json            # PWA 설정
│   └── sw.js                    # 서비스 워커 (오프라인 지원)
└── .env.example                 # 환경변수 예시
```

---

## ❓ 트러블슈팅

**GitHub Actions 실패 시**
→ Actions 탭에서 로그 확인. 주로 API 키 오타 또는 만료가 원인.
→ Anthropic 콘솔에서 크레딧 잔액도 확인하세요.

**Supabase에 데이터 없음**
→ Actions 탭에서 워크플로우를 수동 실행(`Run workflow`)해보세요.
→ Supabase Table Editor에서 `cheongyak` 테이블 확인.

**앱에 "샘플" 표시됨**
→ Vercel 환경변수가 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필수).
→ Vercel에서 Redeploy 실행.

**다크모드가 적용 안 됨**
→ `tailwind.config.js`에 `darkMode: "class"` 설정 확인.

**서비스 워커 캐시 문제**
→ 브라우저 DevTools → Application → Service Workers → Unregister 후 새로고침.

---

## 🔄 v2.0 변경 사항

- ✅ 컴포넌트 분리 (모놀리식 → 모듈화)
- ✅ 북마크 영구 저장 (localStorage)
- ✅ 다크모드 (시스템 연동 + 수동 전환)
- ✅ 서비스 워커 오프라인 지원
- ✅ 자격 체크 확장 (무주택 여부, 한부모가족, 진행률 표시)
- ✅ UI/UX 개선 (토스트 알림, 호버 효과, 검색 초기화, 빈 상태 안내)
- ✅ 에러 처리 강화 (재시도 로직, 데이터 검증, 에러 배너)
- ✅ fetch 스크립트 최적화 (Sonnet 모델, 재시도, 검증)
- ✅ GitHub Actions 하루 2회 실행 (자정 + 오전 9시)
- ✅ 접근성 개선 (aria-label, focus 스타일, 시맨틱 마크업)
