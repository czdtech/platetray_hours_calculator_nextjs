import type { Metadata } from "next";
import { Header } from "@/components/Layout/Header";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { Article } from "@/components/semantic/Article";
import { getMessagesSync } from "@/i18n/getMessages";
import { siteConfig } from "@/config/seo";
import { getHreflangTags } from "@/utils/seo/hreflang";

const locale = "es";
const messages = getMessagesSync(locale);
const hreflang = getHreflangTags("/about");

export const metadata: Metadata = {
  title: messages.about.title,
  description: messages.about.description,
  alternates: {
    canonical: `${siteConfig.url}/es/about`,
    languages: hreflang,
  },
  openGraph: {
    title: `${messages.about.title} | ${siteConfig.name}`,
    description: messages.about.description,
    url: `${siteConfig.url}/es/about`,
    type: "website",
  },
};

export default function SpanishAboutPage() {
  const breadcrumbItems = [
    { name: messages.common.home, url: "/es" },
    { name: messages.common.about, url: "/es/about" },
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
            {messages.about.title}
          </h2>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {messages.about.whatArePH}
            </h3>
            <p className="text-gray-600 mb-4">
              {messages.about.whatArePHText}
            </p>
            <p className="text-gray-600 mb-4">
              La secuencia de regentes sigue el orden caldeo de los planetas,
              basado en su velocidad aparente desde la perspectiva de la Tierra.
              El planeta que rige la primera hora del día (comenzando al
              amanecer) es el regente de ese día.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {messages.about.howCanBeUsed}
            </h3>
            <p className="text-gray-600 mb-4">
              {messages.about.howCanBeUsedText}
            </p>
            <ul className="list-disc pl-6 space-y-3 text-gray-600">
              <li>
                <strong className="text-gray-700">Hora del Sol:</strong> Buena
                para actividades relacionadas con liderazgo, vitalidad, éxito y
                buscar el favor de autoridades.
              </li>
              <li>
                <strong className="text-gray-700">Hora de Venus:</strong>{" "}
                Favorece el amor, la belleza, el arte, las actividades sociales
                y el placer.
              </li>
              <li>
                <strong className="text-gray-700">Hora de Mercurio:</strong>{" "}
                Adecuada para comunicación, aprendizaje, escritura, comercio y
                viajes.
              </li>
              <li>
                <strong className="text-gray-700">Hora de la Luna:</strong>{" "}
                Relacionada con asuntos domésticos, emociones, intuición y
                asuntos públicos.
              </li>
              <li>
                <strong className="text-gray-700">Hora de Saturno:</strong>{" "}
                Asociada con disciplina, responsabilidad, proyectos a largo
                plazo, superación de obstáculos y finales.
              </li>
              <li>
                <strong className="text-gray-700">Hora de Júpiter:</strong>{" "}
                Ideal para crecimiento, expansión, abundancia, búsqueda de
                sabiduría y asuntos financieros.
              </li>
              <li>
                <strong className="text-gray-700">Hora de Marte:</strong>{" "}
                Conectada con energía, coraje, acción, competencia y conflicto
                potencial.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {messages.about.keyFeatures}
            </h3>
            <ul className="list-disc pl-6 space-y-3 text-gray-600">
              <li>
                Entrada de ubicación con autocompletado de Google Places o
                geolocalización con un clic.
              </li>
              <li>
                Manejo automático de zona horaria para garantizar cálculos
                precisos de amanecer/atardecer y horas.
              </li>
              <li>Cambio entre formatos de hora de 12 y 24 horas.</li>
              <li>
                Navegación semanal para saltar rápidamente a cualquier día.
              </li>
              <li>
                Sugerencias contextuales sobre qué actividades son{" "}
                <em>buenas para</em> o deben ser <em>evitadas</em> durante cada
                hora.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {messages.about.limitations}
            </h3>
            <p className="text-gray-600 mb-4">
              Las horas planetarias se originan en la astrología tradicional. Los
              cálculos proporcionados aquí se basan en métodos históricos
              ampliamente aceptados y datos astronómicos modernos para el
              amanecer y el atardecer. Se ofrecen solo con fines informativos y
              de entretenimiento y no deben reemplazar el asesoramiento o la
              planificación profesional.
            </p>
          </section>

          <p className="text-gray-600">
            Esta calculadora te ayuda a determinar las horas planetarias para
            cualquier fecha y lugar, permitiéndote programar tareas en armonía
            con las energías planetarias predominantes.
          </p>
        </Article>
      </div>
    </>
  );
}
