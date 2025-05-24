import type { Metadata } from "next";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import { Footer } from "@/components/Layout/Footer";
import { AnalyticsWrapper } from "@/components/Analytics/Analytics";
// import { PerformanceDashboard } from "@/components/Analytics/PerformanceDashboard";
// import { GlobalPerformanceMonitor } from "@/components/Performance/GlobalPerformanceMonitor";
// import { PerformanceDebugger } from "@/components/Performance/PerformanceDebugger";
import { ApiCallMonitor } from "@/components/Performance/ApiCallMonitor";
import { BackToTop } from "@/components/UI/BackToTop";
import { getDefaultSiteMetadata } from "@/utils/seo/metadata";
import { getGSCVerificationMeta } from "@/config/seo-monitoring";

// 添加Google Search Console验证meta标签
const gscVerification = getGSCVerificationMeta();
const baseMetadata = getDefaultSiteMetadata();

export const metadata: Metadata = {
  ...baseMetadata,
  ...(gscVerification && {
    verification: {
      google: gscVerification,
    },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <div
            id="content-start"
            className="outline-none"
            tabIndex={-1}
            aria-hidden="true"
          ></div>
          {children}
        </main>
        <Footer />
        <AnalyticsWrapper />
        {/* 临时禁用所有性能监控组件以修复无限循环问题 */}
        {/* <GlobalPerformanceMonitor /> */}
        {/* <PerformanceDebugger /> */}
        {/* <PerformanceDashboard /> */}
        
        {/* 添加API调用监控组件 */}
        <ApiCallMonitor />
        
        {/* 返回顶部按钮 */}
        <BackToTop />
      </body>
    </html>
  );
}
