import { blogPosts } from "./blogPosts";
import type { BlogPost } from "@/types/blog";
import { TRANSLATED_SLUGS } from "@/i18n/translatedSlugs";

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
  "planetary-hours-faq": {
    title: "FAQ de Horas Planetarias: Respuestas Expertas a las Preguntas Más Importantes",
    excerpt: "Resuelve las dudas más comunes sobre horas planetarias con respuestas claras y prácticas: conceptos básicos, aplicación diaria, precisión y uso profesional.",
  },
  "mobile-planetary-hours-guide": {
    title: "Horas Planetarias en Móvil: Timing Cósmico en Cualquier Lugar",
    excerpt: "Aprende a usar la calculadora en tu celular como PWA, con instalación rápida, hábitos de uso diario y consejos para aprovechar el timing sobre la marcha.",
  },
  "planetary-hours-business-success": {
    title: "Ventaja Competitiva Profesional: Cómo las Horas Planetarias Mejoran tu Eficiencia",
    excerpt: "Aplica horas planetarias a reuniones, negociación, liderazgo y foco profundo para tomar mejores decisiones y elevar resultados de negocio.",
  },
  "planetary-hours-chart-pdf": {
    title: "Tabla de Horas Planetarias: Guía de Referencia Imprimible Gratis (PDF)",
    excerpt: "Descarga una tabla de horas planetarias en PDF para consulta rápida con orden caldeo, regentes diarios y usos recomendados de cada planeta.",
  },
  "planetary-hours-history-culture": {
    title: "De Babilonia al Presente: Historia y Viaje Cultural de las Horas Planetarias",
    excerpt: "Un recorrido histórico por la evolución de las horas planetarias y su relevancia práctica actual para timing, enfoque y conciencia temporal.",
  },
  "introduction": {
    title: "Calculadora de Horas Planetarias: Precisión Moderna para un Timing con Sentido",
    excerpt: "Conoce la herramienta, por qué destaca en precisión astronómica y cómo empezar a usar horas planetarias en tu rutina en pocos minutos.",
  },
  "2025-astronomical-events-planetary-hours": {
    title: "Espectáculo Astronómico 2025: Cómo las Alineaciones Potencian tus Horas Planetarias",
    excerpt: "Análisis práctico del evento astronómico de enero 2025 y cómo aprovechar alineaciones planetarias para entrenar timing consciente.",
  },
  "algorithm-behind-calculator": {
    title: "¿Cómo se Calculan las Horas Planetarias? Análisis Técnico del Algoritmo de Precisión",
    excerpt: "Explicación técnica de cómo funciona la calculadora: eventos solares, división 12+12, orden caldeo y conversión horaria local precisa.",
  },
  "best-planetary-hour-for-marriage": {
    title: "Mejor Hora Planetaria para el Matrimonio y la Boda",
    excerpt: "Encuentra las mejores horas planetarias para ceremonias de matrimonio, propuestas y planificación de bodas. Aprende qué timing cósmico crea las condiciones más auspiciosas para un amor duradero.",
  },
  "what-are-planetary-hours": {
    title: "Horas Planetarias Explicadas: Guía para Principiantes sobre Origen, Principios y Significado",
    excerpt: "¿Qué son las horas planetarias? Descubre su origen, el Orden Caldeo y cómo funciona este sistema antiguo de timing para usarlo con claridad en la vida diaria.",
  },
  "using-planetary-hours": {
    title: "Cómo Usar las Horas Planetarias: Guía Práctica para Optimizar tu Día",
    excerpt: "Aprende a aplicar la energía de cada hora planetaria al trabajo, las relaciones y el bienestar con estrategias de timing concretas y fáciles de implementar.",
  },
  "monday-moon-day": {
    title: "Lunes: Día de la Luna — Significado, Energía y Mejores Actividades",
    excerpt: "El lunes está regido por la Luna. Descubre cómo aprovechar su energía emocional e intuitiva para planificar mejor, nutrir vínculos y empezar la semana con claridad.",
  },
  "planetary-days-of-the-week": {
    title: "Días Planetarios de la Semana: Guía Completa de Regentes Diarios",
    excerpt: "Descubre qué planeta rige cada día de la semana y cómo usar esa energía para tomar mejores decisiones de timing en trabajo, relaciones y bienestar.",
  },
  "sunday-sun-day": {
    title: "Domingo: Día del Sol — Significado, Energía y Mejores Actividades",
    excerpt: "El domingo está regido por el Sol. Aprende a usar su energía de liderazgo, vitalidad y visibilidad para iniciar la semana con dirección.",
  },
  "friday-venus-day": {
    title: "Viernes: Día de Venus — Significado, Energía y Mejores Actividades",
    excerpt: "El viernes es día de Venus: amor, belleza y armonía. Descubre por qué es la mejor jornada para vínculos, arte y vida social consciente.",
  },
  "tuesday-mars-day": {
    title: "Martes: Día de Marte — Significado, Energía y Mejores Actividades",
    excerpt: "El martes está regido por Marte. Aprende a canalizar su energía de acción, coraje y ejecución para avanzar con enfoque y decisión.",
  },
  "wednesday-mercury-day": {
    title: "Miércoles: Día de Mercurio — Significado, Energía y Mejores Actividades",
    excerpt: "Miércoles pertenece a Mercurio. Descubre cómo usar su energía para comunicar mejor, negociar con claridad y optimizar tu trabajo mental.",
  },
  "thursday-jupiter-day": {
    title: "Jueves: Día de Júpiter — Significado, Energía y Mejores Actividades",
    excerpt: "Jueves está regido por Júpiter, planeta de expansión y abundancia. Usa este día para decisiones de crecimiento, visión estratégica y oportunidades.",
  },
  "saturday-saturn-day": {
    title: "Sábado: Día de Saturno — Significado, Energía y Mejores Actividades",
    excerpt: "Sábado está regido por Saturno: disciplina, estructura y resultados duraderos. Aprende a usar este día para construir bases sólidas.",
  },
  "best-planetary-hour-for-interview": {
    title: "Mejor Hora Planetaria para Entrevistas de Trabajo y Saltos de Carrera",
    excerpt: "Descubre qué horas planetarias favorecen comunicación, presencia y negociación para entrevistas y decisiones profesionales.",
  },
  "best-planetary-hour-for-surgery": {
    title: "Mejor Hora Planetaria para Cirugía y Procedimientos Médicos",
    excerpt: "Guía histórica y cultural sobre astrología médica y timing quirúrgico, con enfoque responsable: la decisión clínica siempre depende de tu equipo médico.",
  },
};

export const blogPostsEs: BlogPost[] = blogPosts
  .filter((post) => TRANSLATED_SLUGS.es.has(post.slug))
  .map((post) => {
    const override = spanishOverrides[post.slug];
    if (override) {
      return { ...post, title: override.title, excerpt: override.excerpt };
    }
    return post;
  });
