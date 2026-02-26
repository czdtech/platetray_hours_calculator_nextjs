import type { Metadata } from "next";
import { Header } from "@/components/Layout/Header";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { Article } from "@/components/semantic/Article";
import { getMessagesSync } from "@/i18n/getMessages";
import { siteConfig } from "@/config/seo";
import { getHreflangTags } from "@/utils/seo/hreflang";

const locale = "pt";
const messages = getMessagesSync(locale);
const hreflang = getHreflangTags("/about");

export const metadata: Metadata = {
  title: messages.about.title,
  description: messages.about.description,
  alternates: {
    canonical: `${siteConfig.url}/pt/about`,
    languages: hreflang,
  },
  openGraph: {
    title: `${messages.about.title} | ${siteConfig.name}`,
    description: messages.about.description,
    url: `${siteConfig.url}/pt/about`,
    type: "website",
  },
};

export default function PortugueseAboutPage() {
  const breadcrumbItems = [
    { name: messages.common.home, url: "/pt" },
    { name: messages.common.about, url: "/pt/about" },
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
              A sequência de regentes segue a ordem caldeia dos planetas, baseada
              na sua velocidade aparente a partir da perspectiva da Terra. O
              planeta que rege a primeira hora do dia (começando ao nascer do
              sol) é o regente desse dia.
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
                <strong className="text-gray-700">Hora do Sol:</strong> Boa para
                atividades relacionadas à liderança, vitalidade, sucesso e
                buscar o favor de autoridades.
              </li>
              <li>
                <strong className="text-gray-700">Hora de Vênus:</strong>{" "}
                Favorece o amor, a beleza, a arte, as atividades sociais e o
                prazer.
              </li>
              <li>
                <strong className="text-gray-700">Hora de Mercúrio:</strong>{" "}
                Adequada para comunicação, aprendizagem, escrita, comércio e
                viagens.
              </li>
              <li>
                <strong className="text-gray-700">Hora da Lua:</strong>{" "}
                Relacionada a assuntos domésticos, emoções, intuição e assuntos
                públicos.
              </li>
              <li>
                <strong className="text-gray-700">Hora de Saturno:</strong>{" "}
                Associada à disciplina, responsabilidade, projetos de longo
                prazo, superação de obstáculos e finalizações.
              </li>
              <li>
                <strong className="text-gray-700">Hora de Júpiter:</strong>{" "}
                Ideal para crescimento, expansão, abundância, busca de sabedoria
                e assuntos financeiros.
              </li>
              <li>
                <strong className="text-gray-700">Hora de Marte:</strong>{" "}
                Conectada à energia, coragem, ação, competição e conflito
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
                Entrada de localização com autocompletar do Google Places ou
                geolocalização com um clique.
              </li>
              <li>
                Tratamento automático de fuso horário para garantir cálculos
                precisos de nascer/pôr do sol e horas.
              </li>
              <li>Alternância entre formatos de hora de 12 e 24 horas.</li>
              <li>
                Navegação semanal para saltar rapidamente para qualquer dia.
              </li>
              <li>
                Sugestões contextuais sobre quais atividades são{" "}
                <em>boas para</em> ou devem ser <em>evitadas</em> durante cada
                hora.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {messages.about.limitations}
            </h3>
            <p className="text-gray-600 mb-4">
              As horas planetárias se originam na astrologia tradicional. Os
              cálculos fornecidos aqui são baseados em métodos históricos
              amplamente aceitos e dados astronômicos modernos para o nascer e o
              pôr do sol. São oferecidos apenas para fins informativos e de
              entretenimento e não devem substituir aconselhamento ou
              planejamento profissional.
            </p>
          </section>

          <p className="text-gray-600">
            Esta calculadora ajuda você a determinar as horas planetárias para
            qualquer data e lugar, permitindo que você programe tarefas em
            harmonia com as energias planetárias predominantes.
          </p>
        </Article>
      </div>
    </>
  );
}
