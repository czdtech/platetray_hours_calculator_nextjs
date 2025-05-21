import { onCLS, onLCP, onINP, Metric } from 'web-vitals';

function sendToGA({ name, value, id }: Metric) {
  // @ts-expect-error -- gtag is injected by GA script at runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = window.gtag as (...args: any[]) => void | undefined;
  if (!gtag) return;

  const val = name === 'CLS' ? value * 1000 : value; // GA 需整数
  gtag('event', name, {
    event_category: 'Web Vitals',
    event_label: id,
    value: Math.round(val),
    non_interaction: true,
  });
}

export function reportWebVitals() {
  onCLS(sendToGA);
  onLCP(sendToGA);
  onINP(sendToGA);
} 