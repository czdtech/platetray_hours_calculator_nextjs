import type { Metadata } from "next";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import { Footer } from "@/components/Layout/Footer";
import { AnalyticsWrapper } from "@/components/Analytics/Analytics";
import { StagewiseToolbar } from '@stagewise/toolbar-next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Planetary Hours Calculator',
    template: '%s | Planetary Hours Calculator',
  },
  description: 'Calculate planetary hours based on your location and date. Discover the perfect time for your activities with ancient planetary wisdom.',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'theme-color': '#ffffff',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const stagewiseConfig = {
    plugins: []
  };

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {/* 只添加跳过导航链接，不修改main标签结构 */}
        <a
          href="#content-start"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-purple-600 text-white px-4 py-2 rounded-md focus:outline-none"
        >
          Skip to content
        </a>

        {/* 保持原始结构不变，只在children前添加锚点 */}
        <main className="flex-grow">
          <div id="content-start" className="outline-none" tabIndex={-1} aria-hidden="true"></div>
          {children}
        </main>
        <Footer />
        <AnalyticsWrapper />
        {process.env.NODE_ENV === 'development' && (
          <StagewiseToolbar config={stagewiseConfig} />
        )}
      </body>
    </html>
  );
}