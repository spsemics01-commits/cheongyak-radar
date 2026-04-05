import "./globals.css";

export const metadata = {
  title: "청약레이더 성남",
  description: "성남·분당·판교·위례·복정 청약 공고 모아보기 - 매일 자동 업데이트",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "청약레이더",
  },
  openGraph: {
    title: "청약레이더 성남",
    description: "성남·분당·판교·위례·복정 청약 공고 모아보기",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="청약레이더" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Noto Sans KR', sans-serif", margin: 0 }}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered:', reg.scope))
                    .catch(err => console.log('SW registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
