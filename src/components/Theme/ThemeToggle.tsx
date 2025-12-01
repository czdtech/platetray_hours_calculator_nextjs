'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * 主题切换按钮组件
 * 在亮色/暗色/系统主题之间切换
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // 防止 hydration 不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 返回占位符，防止布局跳动
    return (
      <button
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors"
        aria-label="Loading theme toggle"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const cycleTheme = () => {
    // 循环切换：light -> dark -> system -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor size={20} />;
    }
    return resolvedTheme === 'dark' ? <Moon size={20} /> : <Sun size={20} />;
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'System theme';
    }
    return resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode';
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                 text-gray-700 dark:text-gray-300 transition-all duration-200 
                 focus:outline-none focus:ring-2 focus:ring-purple-500/30
                 hover:scale-105 active:scale-95"
      aria-label={`Current: ${getLabel()}. Click to switch theme.`}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  );
}

