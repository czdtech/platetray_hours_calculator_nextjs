/**
 * 行星颜色常量
 * 包含CSS类名和对应的十六进制颜色值
 * 在项目中统一使用这些常量来确保一致性
 */

// CSS类名形式的行星颜色
export const PLANET_COLOR_CLASSES = {
  Sun: 'text-planet-sun',
  Moon: 'text-planet-moon',
  Mercury: 'text-planet-mercury',
  Venus: 'text-planet-venus',
  Mars: 'text-planet-mars',
  Jupiter: 'text-planet-jupiter',
  Saturn: 'text-planet-saturn'
};

// 十六进制形式的行星颜色（与tailwind.config.js中定义的颜色值保持一致）
export const PLANET_COLOR_HEX = {
  Sun: '#B45309',     // amber-800
  Moon: '#6366F1',    // indigo-500
  Mercury: '#0EA5E9', // sky-500
  Venus: '#BE185D',   // pink-800
  Mars: '#DC2626',    // red-600
  Jupiter: '#A855F7', // purple-600
  Saturn: '#6B7280',  // gray-500
};

// 行星符号
export const PLANET_SYMBOLS = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄'
};

// 以上三个常量都使用相同的键名，确保能够一致地引用