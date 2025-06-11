import type { Metadata } from "next";
import { Header } from "@/components/Layout/Header";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { Article } from "@/components/semantic/Article";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://planetaryhours.org";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about the mission, methodology and team behind the Planetary Hours Calculator.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About | Planetary Hours Calculator",
    description:
      "Learn about the mission, methodology and team behind the Planetary Hours Calculator.",
    url: `${SITE_URL}/about`,
    type: "website",
  },
};

export default function AboutPage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ];

  return (
    <>
      <Header activePage="about" />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <Article className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            About Planetary Hours
          </h2>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              What are Planetary Hours?
            </h3>
            <p className="text-gray-600 mb-4">
              Planetary hours are an ancient astrological system that divides
              the time between sunrise and sunset, and sunset and sunrise, into
              12 unequal &quot;hours.&quot; Each hour is ruled by one of the seven
              traditional planets (Sun, Moon, Mercury, Venus, Mars, Jupiter,
              Saturn).
            </p>
            <p className="text-gray-600 mb-4">
              The sequence of rulers follows the Chaldean order of the planets,
              based on their apparent speed from Earth&apos;s perspective. The planet
              ruling the first hour of the day (starting at sunrise) is the
              ruler of that day.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              How Can They Be Used?
            </h3>
            <p className="text-gray-600 mb-4">
              Practitioners believe that the nature of the ruling planet
              influences the energy and suitability of that hour for certain
              activities. For example:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-gray-600">
              <li>
                <strong className="text-gray-700">Sun Hour:</strong> Good for
                activities related to leadership, vitality, success, and seeking
                favor from authorities.
              </li>
              <li>
                <strong className="text-gray-700">Venus Hour:</strong> Favors
                love, beauty, art, social activities, and pleasure.
              </li>
              <li>
                <strong className="text-gray-700">Mercury Hour:</strong>{" "}
                Suitable for communication, learning, writing, trade, and
                travel.
              </li>
              <li>
                <strong className="text-gray-700">Moon Hour:</strong> Related to
                domestic matters, emotions, intuition, and public affairs.
              </li>
              <li>
                <strong className="text-gray-700">Saturn Hour:</strong>{" "}
                Associated with discipline, responsibility, long-term projects,
                dealing with obstacles, and endings.
              </li>
              <li>
                <strong className="text-gray-700">Jupiter Hour:</strong> Ideal
                for growth, expansion, abundance, seeking wisdom, and financial
                matters.
              </li>
              <li>
                <strong className="text-gray-700">Mars Hour:</strong> Connected
                to energy, courage, action, competition, and potential conflict.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Key Features
            </h3>
            <ul className="list-disc pl-6 space-y-3 text-gray-600">
              <li>
                Location input with Google Places auto-complete or one-click
                geolocation.
              </li>
              <li>
                Automatic timezone handling to ensure accurate sunrise/sunset
                and hour calculations.
              </li>
              <li>Toggle between 12-hour and 24-hour time formats.</li>
              <li>Week navigation to quickly jump to any day.</li>
              <li>
                Contextual suggestions on what activities are <em>good for</em>{" "}
                or should be <em>avoided</em> during each hour.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Limitations & Disclaimer
            </h3>
            <p className="text-gray-600 mb-4">
              Planetary hours originate from traditional astrology. The
              calculations provided here are based on widely accepted historical
              methods and modern astronomical data for sunrise and sunset. They
              are offered for informational and entertainment purposes only and
              should not replace professional advice or planning.
            </p>
          </section>

          <p className="text-gray-600">
            This calculator helps you determine planetary hours for any date and
            place, empowering you to schedule tasks in harmony with the
            prevailing planetary energies.
          </p>
        </Article>
      </div>
    </>
  );
}
