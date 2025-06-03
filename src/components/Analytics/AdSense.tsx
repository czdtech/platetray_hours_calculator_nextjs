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
    const [shouldLoadAds, setShouldLoadAds] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        // 在开发环境中不加载 AdSense
        if (process.env.NODE_ENV === 'development') {
            console.log('🚫 开发环境：跳过 AdSense 加载以避免警告和错误');
            return;
        }

        // 检查是否已经加载了 AdSense 脚本
        const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
        if (existingScript) {
            console.log('✅ AdSense 脚本已存在，跳过重复加载');
            return;
        }

        // 加载 AdSense 脚本的函数
        const loadAdSenseScript = () => {
            if (shouldLoadAds) return; // 防止重复加载

            setShouldLoadAds(true);

            // 创建原生 script 标签，避免 Next.js Script 组件的 data-nscript 属性
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1444054360166733';
            script.crossOrigin = 'anonymous';

            script.onload = () => {
                console.log('✅ AdSense 已加载，广告开始优化展示');
            };

            script.onerror = (e) => {
                console.error('AdSense 加载失败:', e);
            };

            // 添加到 head 标签
            document.head.appendChild(script);
        };

        // 优化广告收益：减少延迟时间，更快加载广告
        const timer = setTimeout(() => {
            loadAdSenseScript();
        }, 800); // 仅延迟 0.8 秒，优先保障广告收益

        // 用户任何交互立即加载广告
        const handleInteraction = () => {
            loadAdSenseScript();
            // 移除事件监听器
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('mouseenter', handleInteraction);
            clearTimeout(timer);
        };

        // 扩大交互触发范围，包括鼠标进入
        window.addEventListener('scroll', handleInteraction, { passive: true });
        window.addEventListener('click', handleInteraction, { passive: true });
        window.addEventListener('touchstart', handleInteraction, { passive: true });
        window.addEventListener('mouseenter', handleInteraction, { passive: true });

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('mouseenter', handleInteraction);
        };
    }, [isMounted, shouldLoadAds]);

    // 防止 hydration 错误：在客户端挂载前不渲染任何内容
    if (!isMounted) {
        return null;
    }

    // 在开发环境中显示广告位模拟
    if (process.env.NODE_ENV === 'development') {
        return <AdSensePlaceholder />;
    }

    // 生产环境不需要渲染任何可见内容，脚本已通过 useEffect 加载
    return null;
} 