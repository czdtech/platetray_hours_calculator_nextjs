import type { Metadata } from "next";
import "../globals.css";
import "react-datepicker/dist/react-datepicker.css";
import { Footer } from "@/components/Layout/Footer";
import { AnalyticsWrapper } from "@/components/Analytics/Analytics";
import { AdSense } from "@/components/Analytics/AdSense";
import { BackToTop } from "@/components/UI/BackToTop";
import { ResourcePreloader, SmartPrefetcher } from "@/components/Performance/ResourcePreloader";
import { FontOptimizer, FontDisplayCSS } from "@/components/Performance/FontOptimizer";
import { SimpleMonitoringSetup } from "@/components/Monitoring/SimpleMonitoringSetup";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import { getDefaultSiteMetadata } from "@/utils/seo/metadata";
import { getGSCVerificationMeta } from "@/config/seo-monitoring";

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

export default function PortugueseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning={true}>
        <ThemeProvider>
          <a
            href="#content-start"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-purple-600 text-white px-4 py-2 rounded-md focus:outline-none"
          >
            Pular para o conteúdo
          </a>

          <main className="flex-grow">
            <div
              id="content-start"
              className="outline-none"
              tabIndex={-1}
              aria-hidden="true"
            ></div>
            {children}
          </main>
          <Footer locale="pt" />
          <AnalyticsWrapper />
          <AdSense />
          <ResourcePreloader />
          <SmartPrefetcher />
          <FontOptimizer />
          <FontDisplayCSS />
          <SimpleMonitoringSetup />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
