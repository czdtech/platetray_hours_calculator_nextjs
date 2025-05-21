/// <reference types="react" />

export function safeTag<T extends keyof React.JSX.IntrinsicElements>(tag: T): T {
  return tag;
} 