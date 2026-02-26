import { blogPosts } from "./blogPosts";
import type { BlogPost } from "@/types/blog";

const translatedSlugs = new Set([
  "venus-hour-guide",
  "jupiter-hour-guide",
  "saturn-hour-guide",
  "mercury-hour-guide",
  "mars-hour-guide",
  "sun-hour-guide",
  "moon-hour-guide",
  "planetary-hours-and-their-meanings",
  "planetary-hours-for-love",
  "planetary-hours-for-magic",
  "planetary-hours-for-manifestation",
  "planetary-hours-for-money",
  "best-planetary-hour-for-marriage",
]);

const spanishOverrides: Record<string, { title: string; excerpt: string }> = {
  "venus-hour-guide": {
    title: "Hora de Venus en Astrología: Significado, Mejores Actividades y Horarios de Hoy",
    excerpt: "Descubre el significado de la hora de Venus en astrología, las mejores actividades durante las horas planetarias de Venus y por qué el viernes amplifica la energía venusina. Aprende a encontrar tu próxima hora de Venus hoy.",
  },
  "jupiter-hour-guide": {
    title: "Hora de Júpiter en Astrología: Crecimiento, Abundancia y Oportunidad",
    excerpt: "Conoce el significado de la hora de Júpiter en astrología — el momento más propicio del Gran Benéfico para el crecimiento, la riqueza, los asuntos legales y la expansión. Descubre por qué el jueves amplifica el poder de Júpiter.",
  },
  "saturn-hour-guide": {
    title: "Hora de Saturno en Astrología: Disciplina, Estructura y Planificación Estratégica",
    excerpt: "Comprende el significado y las actividades de la hora de Saturno en astrología. Descubre por qué las horas planetarias de Saturno favorecen la disciplina, la planificación a largo plazo y el trabajo serio — especialmente el sábado.",
  },
  "mercury-hour-guide": {
    title: "Hora de Mercurio en Astrología: Comunicación, Aprendizaje y Claridad Mental",
    excerpt: "Explora el significado de la hora de Mercurio en astrología. Descubre las mejores actividades para las horas planetarias de Mercurio — desde la escritura y el estudio hasta las negociaciones y la planificación de viajes.",
  },
  "mars-hour-guide": {
    title: "Hora de Marte en Astrología: Energía, Coraje y Poder de Acción",
    excerpt: "Conoce el significado de la hora de Marte en astrología — el momento del planeta guerrero para la acción, el coraje, la competencia y la energía física. Descubre por qué el martes amplifica el poder de Marte.",
  },
  "sun-hour-guide": {
    title: "Hora del Sol en Astrología: Liderazgo, Vitalidad y Éxito",
    excerpt: "Descubre el significado de la hora del Sol en astrología — la hora planetaria más radiante para el liderazgo, el éxito, la vitalidad y obtener el favor de las autoridades. Aprende por qué el domingo es el pico del Sol.",
  },
  "moon-hour-guide": {
    title: "Hora de la Luna en Astrología: Intuición, Emociones y Ritmos Lunares",
    excerpt: "Explora el significado de la hora de la Luna en astrología — la hora planetaria lunar para la intuición, las emociones, los asuntos domésticos y la conexión con el público. Descubre por qué el lunes magnifica la energía lunar.",
  },
  "planetary-hours-and-their-meanings": {
    title: "Horas Planetarias y Sus Significados: Guía de Referencia Completa",
    excerpt: "Una guía completa sobre las siete horas planetarias y sus significados. Aprende qué representa cada hora planetaria, la energía de su planeta regente y las mejores actividades para cada hora.",
  },
  "planetary-hours-for-love": {
    title: "Horas Planetarias para el Amor y las Relaciones: Guía Completa de Timing",
    excerpt: "Descubre las mejores horas planetarias para el amor, el romance y las relaciones. Aprende por qué la hora de Venus es ideal para citas, la hora de la Luna para los vínculos emocionales y cómo sincronizar tus actividades románticas.",
  },
  "planetary-hours-for-magic": {
    title: "Horas y Días Planetarios para la Magia: Guía del Practicante",
    excerpt: "Aprende a alinear tus trabajos mágicos con las horas y días planetarios para mayor eficacia. Una guía completa de correspondencias planetarias, sincronización de hechizos y planificación de rituales.",
  },
  "planetary-hours-for-manifestation": {
    title: "Horas Planetarias para la Manifestación: Alinea Tus Intenciones con el Timing Cósmico",
    excerpt: "Aprende a usar las horas planetarias para la manifestación y el establecimiento de intenciones. Descubre qué horas planetarias amplifican la abundancia, el amor, el éxito profesional y el crecimiento espiritual.",
  },
  "planetary-hours-for-money": {
    title: "Mejores Horas Planetarias para el Dinero, los Negocios y el Éxito Financiero",
    excerpt: "Descubre las mejores horas planetarias para decisiones financieras, acuerdos de negocios y creación de riqueza. Aprende por qué la hora de Júpiter es el momento principal para asuntos de dinero en astrología.",
  },
  "best-planetary-hour-for-marriage": {
    title: "Mejor Hora Planetaria para el Matrimonio y la Boda",
    excerpt: "Encuentra las mejores horas planetarias para ceremonias de matrimonio, propuestas y planificación de bodas. Aprende qué timing cósmico crea las condiciones más auspiciosas para un amor duradero.",
  },
};

export const blogPostsEs: BlogPost[] = blogPosts
  .filter((post) => translatedSlugs.has(post.slug))
  .map((post) => {
    const override = spanishOverrides[post.slug];
    if (override) {
      return { ...post, title: override.title, excerpt: override.excerpt };
    }
    return post;
  });
