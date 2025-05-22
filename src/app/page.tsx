import type { Metadata } from 'next';
import { Header } from '@/components/Layout/Header';
import CalculatorPageClient from './CalculatorPageClient'; // 将创建这个客户端组件
import { getFAQPageSchema } from '@/utils/seo/jsonld'; // Assuming this path is correct

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // Fallback for local dev

const faqItems = [
  { question: 'How are planetary hours calculated?', answer: 'Planetary hours are calculated by dividing the time between sunrise and sunset (for daytime hours) and sunset and the next sunrise (for nighttime hours) into 12 equal parts. The length of these "hours" varies depending on the season and latitude.' },
  { question: 'Why are the hours not exactly 60 minutes long?', answer: 'Because the length of daylight and nighttime changes throughout the year, the duration of each planetary hour also changes. They are only close to 60 minutes near the equinoxes.' },
  { question: 'Do I need to know my exact sunrise/sunset times?', answer: 'No, this calculator handles that automatically based on the location and date you provide. It uses precise astronomical calculations.' },
  { question: 'Which planets are used?', answer: 'The system uses the seven traditional astrological planets: Sun, Moon, Mercury, Venus, Mars, Jupiter, and Saturn. Uranus, Neptune, and Pluto are not part of this traditional system.' },
  { question: 'Is this scientifically proven?', answer: 'Planetary hours are part of traditional astrology and are not based on modern scientific principles. They are used as a symbolic or spiritual timing system by those who follow these traditions.' },
  { question: 'How accurate is the location detection?', answer: 'If you allow location access, the calculator uses your browser\'s geolocation capabilities, which are generally quite accurate for determining sunrise/sunset times. You can also manually enter any location worldwide.' },
];
const faqSchema = getFAQPageSchema(faqItems);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Planetary Hours Calculator | Find Your Planetary Hours Online',
  description: 'Calculate planetary hours based on your location and date. Discover the perfect time for your activities with ancient planetary wisdom.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Planetary Hours Calculator',
    description: 'Calculate planetary hours based on your location and date.',
    url: '/', // 相对于 NEXT_PUBLIC_SITE_URL
    images: [
      {
        url: '/og-image.jpg', // 确保这个图片在 public 目录下
        width: 1200,
        height: 630,
        alt: 'Planetary Hours Calculator Open Graph Image',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planetary Hours Calculator',
    description: 'Calculate planetary hours based on your location and date.',
    images: ['/og-image.jpg'], // 确保这个图片在 public 目录下
  },
  other: {
     'application/ld+json': JSON.stringify(faqSchema),
  }
};

export default function HomePage() {
  return (
    <>
      <Header activePage="calculator" />
      <CalculatorPageClient />
    </>
  );
}
