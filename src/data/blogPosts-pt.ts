import { blogPosts } from "./blogPosts";
import type { BlogPost } from "@/types/blog";
import { TRANSLATED_SLUGS } from "@/i18n/translatedSlugs";

const portugueseOverrides: Record<string, { title: string; excerpt: string }> = {
  "venus-hour-guide": {
    title: "Hora de Vênus na Astrologia: Significado, Melhores Atividades e Horários de Hoje",
    excerpt: "Descubra o significado da hora de Vênus na astrologia, as melhores atividades durante as horas planetárias de Vênus e por que a sexta-feira amplifica a energia venusiana. Saiba como encontrar sua próxima hora de Vênus hoje.",
  },
  "jupiter-hour-guide": {
    title: "Hora de Júpiter na Astrologia: Crescimento, Abundância e Oportunidade",
    excerpt: "Saiba tudo sobre o significado da hora de Júpiter na astrologia — o momento mais auspicioso do Grande Benéfico para crescimento, riqueza, questões legais e expansão. Descubra por que a quinta-feira amplifica o poder de Júpiter.",
  },
  "saturn-hour-guide": {
    title: "Hora de Saturno na Astrologia: Disciplina, Estrutura e Planejamento Estratégico",
    excerpt: "Compreenda o significado e as atividades da hora de Saturno na astrologia. Saiba por que as horas planetárias de Saturno favorecem disciplina, planejamento de longo prazo e trabalho sério — especialmente no sábado.",
  },
  "mercury-hour-guide": {
    title: "Hora de Mercúrio na Astrologia: Comunicação, Aprendizado e Clareza Mental",
    excerpt: "Explore o significado da hora de Mercúrio na astrologia. Descubra as melhores atividades para as horas planetárias de Mercúrio — desde escrita e estudo até negociações e planejamento de viagens.",
  },
  "mars-hour-guide": {
    title: "Hora de Marte na Astrologia: Energia, Coragem e Poder de Ação",
    excerpt: "Saiba tudo sobre o significado da hora de Marte na astrologia — o momento do planeta guerreiro para ação, coragem, competição e energia física. Descubra por que a terça-feira amplifica o poder de Marte.",
  },
  "sun-hour-guide": {
    title: "Hora do Sol na Astrologia: Liderança, Vitalidade e Sucesso",
    excerpt: "Descubra o significado da hora do Sol na astrologia — a hora planetária mais radiante para liderança, sucesso, vitalidade e busca de favores junto a autoridades. Saiba por que o domingo é o auge do Sol.",
  },
  "moon-hour-guide": {
    title: "Hora da Lua na Astrologia: Intuição, Emoções e Ritmos Lunares",
    excerpt: "Explore o significado da hora da Lua na astrologia — a hora planetária lunar para intuição, emoções, assuntos domésticos e engajamento público. Saiba por que a segunda-feira magnifica a energia lunar.",
  },
  "planetary-hours-and-their-meanings": {
    title: "Horas Planetárias e Seus Significados: Guia de Referência Completo",
    excerpt: "Um guia completo sobre as sete horas planetárias e seus significados. Aprenda o que cada hora planetária representa, a energia de seu planeta regente e as melhores atividades para cada hora.",
  },
  "planetary-hours-for-love": {
    title: "Horas Planetárias para o Amor e Relacionamentos: Guia Completo de Timing",
    excerpt: "Descubra as melhores horas planetárias para o amor, romance e relacionamentos. Saiba por que a hora de Vênus é ideal para encontros, a hora da Lua para laços emocionais, e como programar suas atividades românticas.",
  },
  "planetary-hours-for-magic": {
    title: "Horas e Dias Planetários para Magia: Guia do Praticante",
    excerpt: "Aprenda a alinhar seus trabalhos mágicos com horas e dias planetários para maior eficácia. Um guia completo sobre correspondências planetárias, timing de feitiços e planejamento de rituais.",
  },
  "planetary-hours-for-manifestation": {
    title: "Horas Planetárias para Manifestação: Alinhe Suas Intenções com o Timing Cósmico",
    excerpt: "Aprenda a usar horas planetárias para manifestação e definição de intenções. Descubra quais horas planetárias amplificam abundância, amor, sucesso profissional e crescimento espiritual.",
  },
  "planetary-hours-for-money": {
    title: "Melhores Horas Planetárias para Dinheiro, Negócios e Sucesso Financeiro",
    excerpt: "Descubra as melhores horas planetárias para decisões financeiras, negócios comerciais e construção de riqueza. Saiba por que a hora de Júpiter é o momento principal para assuntos financeiros na astrologia.",
  },
  "best-planetary-hour-for-marriage": {
    title: "Melhor Hora Planetária para Casamento e Cerimônia de Casamento",
    excerpt: "Encontre as melhores horas planetárias para cerimônias de casamento, pedidos e planejamento de casamentos. Saiba qual timing cósmico cria as condições mais auspiciosas para o amor duradouro.",
  },
};

export const blogPostsPt: BlogPost[] = blogPosts
  .filter((post) => TRANSLATED_SLUGS.pt.has(post.slug))
  .map((post) => {
    const override = portugueseOverrides[post.slug];
    if (override) {
      return { ...post, title: override.title, excerpt: override.excerpt };
    }
    return post;
  });
