// 청약레이더 서비스 워커 - 오프라인 지원
const CACHE_NAME = "cheongyak-radar-v2";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
];

// 설치 시 정적 자원 캐시
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 활성화 시 이전 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 네트워크 우선, 실패 시 캐시 (Stale-While-Revalidate)
self.addEventListener("fetch", (event) => {
  // API 요청은 항상 네트워크
  if (event.request.url.includes("supabase.co") || event.request.url.includes("api.anthropic.com")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 성공 시 캐시 업데이트
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // 오프라인 시 캐시에서 반환
        return caches.match(event.request).then((cached) => {
          return cached || new Response("오프라인입니다.", { status: 503, statusText: "Offline" });
        });
      })
  );
});
