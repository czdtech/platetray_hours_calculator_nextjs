import type { Metadata } from "next";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Article } from "@/components/semantic/Article";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://planetaryhours.org";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read about how the Planetary Hours Calculator processes and protects your personal data.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | Planetary Hours Calculator",
    description:
      "Read about how the Planetary Hours Calculator processes and protects your personal data.",
    url: `${SITE_URL}/privacy`,
    type: "article",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header activePage="about" />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Article className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Privacy Policy
          </h2>
          <p className="text-gray-500 italic mb-8">
            Last updated: April 8, 2025
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Introduction
            </h3>
            <p className="text-gray-600 mb-4">
              Welcome to Planetary Hours Calculator. We are committed to
              protecting your personal information and your right to privacy. If
              you have any questions or concerns about our policy, or our
              practices with regards to your personal information, please
              contact us.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Information We Collect
            </h3>
            <p className="text-gray-600 mb-4">
              We collect personal information that you voluntarily provide to us
              when you use our services, such as location data if you grant
              permission through your browser's geolocation features. This
              location data (latitude and longitude) is used solely for the
              purpose of calculating accurate sunrise and sunset times required
              for determining planetary hours at your specific location.
            </p>
            <p className="text-gray-600 mb-4">
              We do not store your precise location data on our servers after
              the calculation is performed. If you manually enter a location
              name, we may temporarily process this information to find its
              coordinates for the calculation, but it is not persistently stored
              in association with you.
            </p>
            <p className="text-gray-600 mb-4">
              We may also collect non-personal information, such as browser
              type, operating system, and usage patterns, through standard web
              analytics tools to improve our service. This data is aggregated
              and cannot be used to identify individual users.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              How We Use Your Information
            </h3>
            <p className="text-gray-600 mb-4">
              We use the location information solely to perform the planetary
              hour calculations requested by you. Aggregated, non-personal usage
              data is used to understand how our service is used and to make
              improvements.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Sharing Your Information
            </h3>
            <p className="text-gray-600 mb-4">
              We do not share your personal location information with any third
              parties.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Data Security
            </h3>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical measures to protect the
              security of any information we process. However, please remember
              that no electronic transmission over the internet or information
              storage technology can be guaranteed to be 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Your Privacy Rights
            </h3>
            <p className="text-gray-600 mb-4">
              You can refuse to grant location permission or revoke it at any
              time through your browser settings. If you do so, you will need to
              manually enter a location for calculations.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Policy Updates
            </h3>
            <p className="text-gray-600 mb-4">
              We may update this privacy policy from time to time. The updated
              version will be indicated by an updated "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Third-Party Services
            </h3>
            <p className="text-gray-600 mb-4">
              We rely on several third-party services to provide core
              functionality:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Google Maps Platform</strong> – used for location
                auto-complete, geocoding, reverse geocoding and timezone lookup.
                When you search for or select a place, the relevant query (e.g.
                text input, latitude/longitude) is forwarded to Google's
                servers. Google may temporarily log this request in accordance
                with their own{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className="text-purple-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Vercel</strong> – our application is hosted on Vercel,
                which automatically stores standard HTTP access logs (IP
                address, user-agent, timestamp, requested URL) for a short
                period to ensure platform reliability and security. These logs
                are automatically rotated and are not used to identify
                individual users.
              </li>
            </ul>
            <p className="text-gray-600">
              We do not share additional personal data with these providers
              beyond what is strictly necessary to fulfil your request.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Server Logs & Cookies
            </h3>
            <p className="text-gray-600 mb-4">
              The application itself does{" "}
              <span className="font-semibold">not</span> set any tracking
              cookies nor uses browser local-storage to persist personal data.
              Our hosting provider (Vercel) may set essential cookies required
              for load-balancing or security. These cookies do not contain
              personal identifiers.
            </p>
            <p className="text-gray-600">
              Standard server logs described in the previous section are kept
              for a limited time solely for debugging and security purposes and
              are automatically purged.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Contact Us
            </h3>
            <p className="text-gray-600">
              If you have questions or comments about this policy, you may email
              us at{" "}
              <a
                href="mailto:support@planetaryhours.org"
                className="text-purple-600 hover:underline"
              >
                support@planetaryhours.org
              </a>
            </p>
          </section>
        </Article>
      </main>

      <Footer />
    </div>
  );
}
