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
  "planetary-hours-faq": {
    title: "FAQ de Horas Planetárias: Respostas Claras para as Dúvidas Mais Importantes",
    excerpt: "Tire as principais dúvidas sobre horas planetárias com respostas práticas: fundamentos, aplicações no dia a dia, precisão e uso profissional.",
  },
  "mobile-planetary-hours-guide": {
    title: "Horas Planetárias no Celular: Timing Cósmico em Qualquer Lugar",
    excerpt: "Veja como usar a calculadora no mobile como PWA, com instalação simples, rotina diária e dicas para decisões melhores em movimento.",
  },
  "planetary-hours-business-success": {
    title: "Vantagem Competitiva Profissional: Como Horas Planetárias Elevam sua Eficiência",
    excerpt: "Use horas planetárias em reuniões, negociação, liderança e foco profundo para melhorar decisões e resultados de negócio.",
  },
  "planetary-hours-chart-pdf": {
    title: "Tabela de Horas Planetárias: Guia de Referência Imprimível Gratuito (PDF)",
    excerpt: "Baixe uma tabela de horas planetárias em PDF para consulta rápida com ordem caldeia, regentes dos dias e aplicações práticas por planeta.",
  },
  "planetary-hours-history-culture": {
    title: "Da Babilônia ao Presente: História e Jornada Cultural das Horas Planetárias",
    excerpt: "Uma viagem histórica pela evolução das horas planetárias e sua utilidade moderna para timing estratégico e consciência temporal.",
  },
  "introduction": {
    title: "Calculadora de Horas Planetárias: Precisão Moderna para um Timing Inteligente",
    excerpt: "Entenda por que esta calculadora se destaca em precisão astronômica, velocidade e aplicação prática para sua rotina.",
  },
  "2025-astronomical-events-planetary-hours": {
    title: "Espetáculo Astronômico 2025: Como Alinhamentos Potencializam suas Horas Planetárias",
    excerpt: "Uma leitura prática dos eventos de janeiro de 2025 para aprofundar sua percepção de timing e aplicação das horas planetárias.",
  },
  "algorithm-behind-calculator": {
    title: "Como as Horas Planetárias São Calculadas? Visão Técnica do Algoritmo de Precisão",
    excerpt: "Entenda tecnicamente como a calculadora opera com precisão: eventos solares, divisão dinâmica 12+12, ordem caldeia e timezone local correto.",
  },
  "best-planetary-hour-for-marriage": {
    title: "Melhor Hora Planetária para Casamento e Cerimônia de Casamento",
    excerpt: "Encontre as melhores horas planetárias para cerimônias de casamento, pedidos e planejamento de casamentos. Saiba qual timing cósmico cria as condições mais auspiciosas para o amor duradouro.",
  },
  "what-are-planetary-hours": {
    title: "Horas Planetárias Explicadas: Guia para Iniciantes sobre Origem, Princípios e Significados",
    excerpt: "O que são horas planetárias? Entenda a origem, a Ordem Caldeia e como esse sistema antigo de timing funciona na prática para sua rotina.",
  },
  "using-planetary-hours": {
    title: "Como Usar Horas Planetárias: Guia Prático para Otimizar Seu Dia",
    excerpt: "Aprenda a aplicar a energia de cada hora planetária ao trabalho, aos relacionamentos e ao bem-estar com estratégias objetivas de timing.",
  },
  "monday-moon-day": {
    title: "Segunda-feira: Dia da Lua — Significado, Energia e Melhores Atividades",
    excerpt: "A segunda-feira é regida pela Lua. Descubra como aproveitar essa energia emocional e intuitiva para começar a semana com mais presença e equilíbrio.",
  },
  "planetary-days-of-the-week": {
    title: "Dias Planetários da Semana: Guia Completo dos Regentes Diários",
    excerpt: "Descubra qual planeta rege cada dia da semana e como aplicar essa energia no timing de trabalho, relacionamentos e bem-estar.",
  },
  "sunday-sun-day": {
    title: "Domingo: Dia do Sol — Significado, Energia e Melhores Atividades",
    excerpt: "Domingo é regido pelo Sol. Aprenda a usar essa energia de liderança, vitalidade e visibilidade para abrir a semana com direção.",
  },
  "friday-venus-day": {
    title: "Sexta-feira: Dia de Vênus — Significado, Energia e Melhores Atividades",
    excerpt: "Sexta é dia de Vênus: amor, beleza e harmonia. Entenda por que é o melhor dia para vínculos, arte e experiências de prazer consciente.",
  },
  "tuesday-mars-day": {
    title: "Terça-feira: Dia de Marte — Significado, Energia e Melhores Atividades",
    excerpt: "A terça-feira é regida por Marte. Descubra como canalizar energia de ação, coragem e execução para avançar com foco e decisão.",
  },
  "wednesday-mercury-day": {
    title: "Quarta-feira: Dia de Mercúrio — Significado, Energia e Melhores Atividades",
    excerpt: "Quarta é dia de Mercúrio. Aprenda a aproveitar essa energia para comunicar melhor, negociar com clareza e elevar sua produtividade mental.",
  },
  "thursday-jupiter-day": {
    title: "Quinta-feira: Dia de Júpiter — Significado, Energia e Melhores Atividades",
    excerpt: "Quinta está sob Júpiter, planeta de expansão e abundância. Use o dia para decisões de crescimento, visão estratégica e oportunidades.",
  },
  "saturday-saturn-day": {
    title: "Sábado: Dia de Saturno — Significado, Energia e Melhores Atividades",
    excerpt: "Sábado é regido por Saturno: disciplina, estrutura e resultados de longo prazo. Use o dia para fortalecer sua base.",
  },
  "best-planetary-hour-for-interview": {
    title: "Melhor Hora Planetária para Entrevistas de Emprego e Avanços de Carreira",
    excerpt: "Descubra quais horas planetárias favorecem comunicação, presença e negociação em entrevistas e movimentos profissionais.",
  },
  "best-planetary-hour-for-surgery": {
    title: "Melhor Hora Planetária para Cirurgia e Procedimentos Médicos",
    excerpt: "Guia histórico-cultural sobre astrologia médica e timing cirúrgico, com abordagem responsável: decisão clínica sempre com equipe médica.",
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
