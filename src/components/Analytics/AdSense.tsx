"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

// 开发环境广告位模拟组件
function AdSensePlaceholder() {
    return (
        <div className="fixed bottom-4 right-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm z-50">
            <div className="mb-2">📢 AdSense 广告位</div>
            <div className="text-xs">(开发环境模拟)</div>
        </div>
    );
}

export function AdSense() {
    const [isMounted, setIsMounted] = useState(false);
    const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 防止 hydration 错误：在客户端挂载前不渲染任何内容
    if (!isMounted) {
        return null;
    }

    // 在开发环境中显示广告位模拟
    if (process.env.NODE_ENV === 'development') {
        console.log('🚫 开发环境：跳过 AdSense 加载以避免警告和错误');
        return <AdSensePlaceholder />;
    }

    if (!adClient) {
        console.warn("⚠️ AdSense client ID is not configured. Please set NEXT_PUBLIC_ADSENSE_CLIENT_ID in your environment variables.");
        return null;
    }

    // 使用 next/script 的 afterInteractive 策略是解决此类问题的最佳实践。
    // 它能确保 AdSense 脚本在页面完成 Hydration、变得可交互后才加载，
    // 从而完美避开与 React 的初始化冲突，同时又不会过分延迟广告加载。
    return (
        <Script
            id="adsbygoogle-script"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
            crossOrigin="anonymous"
            onLoad={() => {
                console.log('✅ AdSense script loaded via next/script (afterInteractive)');
            }}
            onError={(e) => {
                console.error('AdSense script failed to load:', e);
            }}
        />
    );
} 