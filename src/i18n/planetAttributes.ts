import type { Locale } from "@/i18n/config";

type PlanetName = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn";

interface PlanetAttributes {
  goodFor: string;
  avoid: string;
}

const PLANET_ATTRIBUTES_BY_LOCALE: Record<Locale, Record<PlanetName, PlanetAttributes>> = {
  en: {
    Sun: {
      goodFor: "Leadership, success, vitality, authority",
      avoid: "Humility, staying in the background, passive activities",
    },
    Moon: {
      goodFor: "Emotions, intuition, domestic matters, public affairs",
      avoid: "Major decisions, confrontations, risky ventures",
    },
    Mercury: {
      goodFor: "Communication, learning, writing, trade, travel",
      avoid: "Silence, isolation, physical labor",
    },
    Venus: {
      goodFor: "Love, beauty, art, social activities, pleasure",
      avoid: "Conflict, hard work, isolation",
    },
    Mars: {
      goodFor: "Energy, courage, action, competition",
      avoid: "Peace negotiations, gentle activities, meditation",
    },
    Jupiter: {
      goodFor: "Growth, expansion, abundance, wisdom, finances",
      avoid: "Restriction, limitation, pessimism",
    },
    Saturn: {
      goodFor: "Discipline, responsibility, long-term projects",
      avoid: "New ventures, spontaneity, risk-taking",
    },
  },
  es: {
    Sun: {
      goodFor: "Liderazgo, éxito, vitalidad, autoridad",
      avoid: "Humildad, pasar desapercibido, actividades pasivas",
    },
    Moon: {
      goodFor: "Emociones, intuición, asuntos domésticos, asuntos públicos",
      avoid: "Decisiones importantes, confrontaciones, actividades arriesgadas",
    },
    Mercury: {
      goodFor: "Comunicación, aprendizaje, escritura, comercio, viajes",
      avoid: "Silencio, aislamiento, trabajo físico",
    },
    Venus: {
      goodFor: "Amor, belleza, arte, actividades sociales, placer",
      avoid: "Conflicto, trabajo duro, aislamiento",
    },
    Mars: {
      goodFor: "Energía, coraje, acción, competencia",
      avoid: "Negociaciones de paz, actividades suaves, meditación",
    },
    Jupiter: {
      goodFor: "Crecimiento, expansión, abundancia, sabiduría, finanzas",
      avoid: "Restricción, limitación, pesimismo",
    },
    Saturn: {
      goodFor: "Disciplina, responsabilidad, proyectos a largo plazo",
      avoid: "Nuevos emprendimientos, espontaneidad, toma de riesgos",
    },
  },
  pt: {
    Sun: {
      goodFor: "Liderança, sucesso, vitalidade, autoridade",
      avoid: "Humildade, ficar em segundo plano, atividades passivas",
    },
    Moon: {
      goodFor: "Emoções, intuição, assuntos domésticos, assuntos públicos",
      avoid: "Decisões importantes, confrontos, atividades arriscadas",
    },
    Mercury: {
      goodFor: "Comunicação, aprendizado, escrita, comércio, viagens",
      avoid: "Silêncio, isolamento, trabalho físico",
    },
    Venus: {
      goodFor: "Amor, beleza, arte, atividades sociais, prazer",
      avoid: "Conflito, trabalho duro, isolamento",
    },
    Mars: {
      goodFor: "Energia, coragem, ação, competição",
      avoid: "Negociações de paz, atividades suaves, meditação",
    },
    Jupiter: {
      goodFor: "Crescimento, expansão, abundância, sabedoria, finanças",
      avoid: "Restrição, limitação, pessimismo",
    },
    Saturn: {
      goodFor: "Disciplina, responsabilidade, projetos de longo prazo",
      avoid: "Novos projetos, espontaneidade, tomada de risco",
    },
  },
};

export function getLocalizedPlanetAttributes(
  planet: string,
  locale: Locale,
): PlanetAttributes | null {
  const typedPlanet = planet as PlanetName;
  const localized = PLANET_ATTRIBUTES_BY_LOCALE[locale][typedPlanet];
  if (localized) {
    return localized;
  }

  const fallback = PLANET_ATTRIBUTES_BY_LOCALE.en[typedPlanet];
  return fallback ?? null;
}
