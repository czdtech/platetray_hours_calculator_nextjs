import { formatInTimeZone } from "date-fns-tz";
import { City } from "@/data/cities";
import { JsonLd } from "@/components/SEO/JsonLd";
import { getFAQPageSchema } from "@/utils/seo/jsonld";

interface CityFAQProps {
  city: City;
  sunrise: Date;
  sunset: Date;
  dayRuler: string;
  timezone: string;
  daytimeHourDuration: number;
}

export function CityFAQ({ city, sunrise, sunset, dayRuler, timezone, daytimeHourDuration }: CityFAQProps) {
  const sunriseFormatted = formatInTimeZone(sunrise, timezone, "h:mm a");
  const sunsetFormatted = formatInTimeZone(sunset, timezone, "h:mm a");
  const nighttimeHourDuration = Math.round(((24 * 60 - daytimeHourDuration * 12) / 12) * 100) / 100;
  const dateFormatted = formatInTimeZone(new Date(), timezone, "MMMM d, yyyy");

  const faqItems = [
    {
      question: `What are the planetary hours in ${city.name} today?`,
      answer: `Today (${dateFormatted}), planetary hours in ${city.name} begin at sunrise (${sunriseFormatted}) and are ruled by ${dayRuler}. Each daytime planetary hour lasts approximately ${daytimeHourDuration.toFixed(0)} minutes, while each nighttime hour lasts approximately ${nighttimeHourDuration.toFixed(0)} minutes. The day ends at sunset (${sunsetFormatted}), after which nighttime planetary hours begin.`,
    },
    {
      question: `What time does sunrise and sunset occur in ${city.name}?`,
      answer: `Today in ${city.name} (${city.timezone}), sunrise is at ${sunriseFormatted} and sunset is at ${sunsetFormatted}. These times determine the division of daytime and nighttime planetary hours. Each set of 12 hours (day and night) is calculated based on these exact sunrise and sunset times.`,
    },
    {
      question: `Which planet rules today in ${city.name}?`,
      answer: `Today's day ruler in ${city.name} is ${dayRuler}. The day ruler is the planet that governs the first planetary hour after sunrise. In the Chaldean order, each day of the week is ruled by a specific planet: Sun (Sunday), Moon (Monday), Mars (Tuesday), Mercury (Wednesday), Jupiter (Thursday), Venus (Friday), and Saturn (Saturday).`,
    },
    {
      question: `How long are planetary hours in ${city.name}?`,
      answer: `Planetary hours in ${city.name} are not fixed at 60 minutes. Today, each daytime planetary hour lasts about ${daytimeHourDuration.toFixed(0)} minutes and each nighttime hour lasts about ${nighttimeHourDuration.toFixed(0)} minutes. At ${city.name}'s latitude (${Math.abs(city.latitude).toFixed(1)}°${city.latitude >= 0 ? "N" : "S"}), these durations vary seasonally — longer daytime hours in summer and shorter in winter${city.latitude < 0 ? " (reversed in the Southern Hemisphere)" : ""}.`,
    },
    {
      question: `How are planetary hours calculated for ${city.name}?`,
      answer: `Planetary hours for ${city.name} are calculated using the city's precise coordinates (${Math.abs(city.latitude).toFixed(4)}°${city.latitude >= 0 ? "N" : "S"}, ${Math.abs(city.longitude).toFixed(4)}°${city.longitude >= 0 ? "E" : "W"}) and timezone (${city.timezone}). The time between sunrise and sunset is divided into 12 equal daytime planetary hours, and the time between sunset and the next sunrise is divided into 12 equal nighttime hours. Each hour is assigned a planet following the ancient Chaldean order.`,
    },
  ];

  const faqSchema = getFAQPageSchema(faqItems);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <JsonLd data={faqSchema} />
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqItems.map((faq, index) => (
          <details
            key={index}
            className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer px-4 py-3 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 pr-4">
                {faq.question}
              </h3>
              <span className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0">
                ▼
              </span>
            </summary>
            <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
