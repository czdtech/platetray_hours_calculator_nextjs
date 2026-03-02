import { formatInTimeZone } from "date-fns-tz";
import { City } from "@/data/cities";
import { FAQSection } from "@/components/FAQ/FAQSection";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/getMessages";
import { buildCityFaqItems } from "@/i18n/cityFaq";

interface CityFAQProps {
  city: City;
  sunrise: Date;
  dayRuler: string;
  timezone: string;
  daytimeHourDuration: number;
  locale: Locale;
  messages: Messages;
}

export function CityFAQ({
  city,
  sunrise,
  dayRuler,
  timezone,
  daytimeHourDuration,
  locale,
  messages,
}: CityFAQProps) {
  const sunriseFormatted = formatInTimeZone(sunrise, timezone, "h:mm a");
  const nighttimeHourDuration =
    Math.round(((24 * 60 - daytimeHourDuration * 12) / 12) * 100) / 100;
  const localizedPlanets = messages.planets as Record<string, string>;
  const dayRulerLabel = localizedPlanets[dayRuler] || dayRuler;

  const faqItems = buildCityFaqItems(
    {
      city,
      sunriseFormatted,
      dayRulerLabel,
      daytimeHourDuration,
      nighttimeHourDuration,
    },
    messages,
  );

  return (
    <FAQSection
      faqs={faqItems}
      includeSchema
      locale={locale}
      messages={messages}
      title={messages.cityPage.faq}
    />
  );
}
