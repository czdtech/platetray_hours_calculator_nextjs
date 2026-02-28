import { formatInTimeZone } from "date-fns-tz";
import { City } from "@/data/cities";
import { FAQSection } from "@/components/FAQ/FAQSection";
import { getMessagesSync } from "@/i18n/getMessages";
import { buildCityFaqItems } from "@/i18n/cityFaq";

interface CityFAQProps {
  city: City;
  sunrise: Date;
  dayRuler: string;
  timezone: string;
  daytimeHourDuration: number;
}

export function CityFAQ({ city, sunrise, dayRuler, timezone, daytimeHourDuration }: CityFAQProps) {
  const messages = getMessagesSync("en");
  const sunriseFormatted = formatInTimeZone(sunrise, timezone, "h:mm a");
  const nighttimeHourDuration =
    Math.round(((24 * 60 - daytimeHourDuration * 12) / 12) * 100) / 100;

  const faqItems = buildCityFaqItems(
    {
      city,
      sunriseFormatted,
      dayRulerLabel: dayRuler,
      daytimeHourDuration,
      nighttimeHourDuration,
    },
    messages,
  );

  return (
    <FAQSection
      faqs={faqItems}
      includeSchema
      locale="en"
      messages={messages}
      title={messages.cityPage.faq}
    />
  );
}
