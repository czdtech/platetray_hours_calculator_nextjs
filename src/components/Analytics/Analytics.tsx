"use client";

import Script from "next/script";
import { useEffect } from "react";
import { reportWebVitals, reportSEOMetrics } from "@/utils/reportWebVitals";

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { 
            send_page_view: false,
            custom_map: { 'custom_parameter.metric_rating': 'metric_rating' }
          });
        `}
      </Script>
    </>
  );
}

export function AnalyticsWrapper() {
  useEffect(() => {
    // 启动Web Vitals监控
    reportWebVitals();

    // 启动SEO性能监控
    reportSEOMetrics();
  }, []);

  return <Analytics />;
}
