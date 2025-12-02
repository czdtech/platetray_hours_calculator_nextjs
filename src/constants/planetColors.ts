/**
 * 行星颜色常量
 * 包含 CSS 类名和对应的十六进制颜色值
 * 通过共享的 JS 配置（planetColors.shared.js）实现单一数据源
 */

// 从共享 JS 中导入十六进制颜色，确保 Tailwind 和 TS 使用同一份配置
export { PLANET_COLOR_HEX } from "./planetColors.shared";

// CSS 类名形式的行星颜色
export const PLANET_COLOR_CLASSES = {
  Sun: "text-planet-sun",
  Moon: "text-planet-moon",
  Mercury: "text-planet-mercury",
  Venus: "text-planet-venus",
  Mars: "text-planet-mars",
  Jupiter: "text-planet-jupiter",
  Saturn: "text-planet-saturn",
};

// 行星符号
export const PLANET_SYMBOLS = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
};

// 以上三个常量都使用相同的键名，确保能够一致地引用
