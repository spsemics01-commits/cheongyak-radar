-- ================================================
-- 청약레이더 성남 - Supabase 테이블 생성 SQL
-- SQL Editor에서 이 전체를 복사→붙여넣기→Run 하세요
-- ================================================

-- 1) 청약 공고 테이블
create table if not exists cheongyak (
  id bigserial primary key,
  name text not null,
  type text,
  location text,
  date text,
  units text,
  price text,
  status text,
  is_hot boolean default false,
  area text,
  detail text,
  eligibility text,
  caution text,
  fetched_at timestamptz default now()
);

-- 2) 메타 정보 테이블 (AI 요약, 마지막 수집 시간)
create table if not exists cheongyak_meta (
  id int primary key default 1,
  summary text,
  last_fetched timestamptz default now()
);

-- 3) 공개 읽기 허용 (프론트에서 anon key로 조회 가능하게)
alter table cheongyak enable row level security;
create policy "public read cheongyak" on cheongyak for select using (true);

alter table cheongyak_meta enable row level security;
create policy "public read meta" on cheongyak_meta for select using (true);
