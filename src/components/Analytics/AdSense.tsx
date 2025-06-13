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
    // Hooks must be called at the top level
    const [isMounted, setIsMounted] = useState(false);
    const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // All conditional logic must be inside the hook
        if (!isMounted || process.env.NODE_ENV === 'development' || !adClient) {
            return;
        }
        
        // Skip if script is already present
        if (document.querySelector('script[src*="adsbygoogle.js"]')) {
            return;
        }

        const loadAdSense = () => {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        };

        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(loadAdSense, { timeout: 1500 });
        } else {
            setTimeout(loadAdSense, 1500);
        }
    }, [isMounted, adClient]);

    // Conditional returns are now after all hooks
    if (process.env.NODE_ENV === 'development') {
        if (!isMounted) return null; // Still prevent hydration mismatch for placeholder
        return <AdSensePlaceholder />;
    }
    
    // In production, this component renders nothing itself.
    return null;
} 