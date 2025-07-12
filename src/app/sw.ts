import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, StaleWhileRevalidate, NetworkFirst, NetworkOnly } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Google Fonts - 高优先级缓存  
    {
      matcher: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: "google-fonts-stylesheets",
      }),
    },
    {
      matcher: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: "google-fonts-webfonts",
      }),
    },
    
    // 重要：绝对不缓存AdSense相关请求，避免影响广告投放和收益
    {
      matcher: ({ url }) => {
        return url.hostname.includes('googlesyndication.com') ||
               url.hostname.includes('googleadservices.com') ||
               url.hostname.includes('doubleclick.net') ||
               url.hostname.includes('google-analytics.com') ||
               url.hostname.includes('googletagmanager.com') ||
               url.pathname.includes('/pagead/') ||
               url.pathname.includes('/ads/');
      },
      handler: new NetworkOnly(),
    },
    
    // 其他静态资源缓存
    {
      matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-font-assets",
      }),
    },
    {
      matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-image-assets",
      }),
    },
    {
      matcher: /\/_next\/image\?url=.+$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "next-image",
      }),
    },
    {
      matcher: /\.(?:mp3|wav|ogg)$/i,
      handler: new CacheFirst({
        cacheName: "static-audio-assets",
      }),
    },
    {
      matcher: /\.(?:mp4|webm)$/i,
      handler: new CacheFirst({
        cacheName: "static-video-assets",
      }),
    },
    {
      matcher: /\.(?:js)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-js-assets",
      }),
    },
    {
      matcher: /\.(?:css|less)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-style-assets",
      }),
    },
    {
      matcher: /\/_next\/data\/.+\/.+\.json$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "next-data",
      }),
    },
    {
      matcher: /\.(?:json|xml|csv)$/i,
      handler: new NetworkFirst({
        cacheName: "static-data-assets",
      }),
    },
    {
      matcher: ({ request, sameOrigin }) => {
        return sameOrigin && request.url.includes("/api/");
      },
      handler: new NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
      }),
    },
    {
      matcher: ({ request, sameOrigin }) => {
        return (
          sameOrigin &&
          request.headers.get("RSC") === "1" &&
          request.headers.get("Next-Router-Prefetch") === "1"
        );
      },
      handler: new NetworkFirst({
        cacheName: "pages-rsc-prefetch",
      }),
    },
    {
      matcher: ({ request, sameOrigin }) => {
        return sameOrigin && request.headers.get("RSC") === "1";
      },
      handler: new NetworkFirst({
        cacheName: "pages-rsc",
      }),
    },
    {
      matcher: ({ sameOrigin }) => {
        return sameOrigin;
      },
      handler: new NetworkFirst({
        cacheName: "pages",
      }),
    },
    {
      matcher: ({ sameOrigin }) => {
        return !sameOrigin;
      },
      handler: new NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
      }),
    },
  ],
});

serwist.addEventListeners();