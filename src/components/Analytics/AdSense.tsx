"use client";

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

    // 生产环境：使用 requestIdleCallback 或 1.5s fallback 延迟加载脚本，避免 hydration 冲突
    useEffect(() => {
        // 若脚本已存在则跳过
        if (document.querySelector('script[src*="adsbygoogle.js"]')) return;

        const loadAdSense = () => {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
            script.crossOrigin = 'anonymous';
            script.onload = () => console.log('✅ AdSense script loaded (native)');
            script.onerror = (e) => console.error('AdSense script failed:', e);
            document.head.appendChild(script);
        };

        if ('requestIdleCallback' in window) {
            // @ts-ignore
            requestIdleCallback(loadAdSense, { timeout: 1500 });
        } else {
            setTimeout(loadAdSense, 1500);
        }
    }, [adClient]);

    // 生产环境无可见输出
    return null;
} 