---
title: "Como as Horas Planetárias São Calculadas? Visão Técnica do Algoritmo de Precisão"
excerpt: "Entenda como funciona uma calculadora de horas planetárias realmente confiável: eventos solares via SunCalc.js, divisão dinâmica 12+12, ordem caldeia e conversão correta de fuso horário."
date: "2025-05-19T17:39:49+08:00"
author: "Planetary Hours Team"
keywords:
  - como calcular horas planetárias
  - algoritmo horas planetárias
  - cálculo preciso horas planetárias
  - como funciona calculadora horas planetárias
faqs:
  - q: "Qual é a lógica básica do cálculo de horas planetárias?"
    a: "Divide-se nascer→pôr do sol em 12 partes e pôr do sol→próximo nascer em outras 12, depois cada faixa recebe um planeta conforme regente do dia e ordem caldeia."
  - q: "Por que o fuso horário local é crítico?"
    a: "Porque os eventos astronômicos costumam vir em UTC e precisam ser convertidos com precisão para horário local real (IANA + DST)."
---

# Como as Horas Planetárias São Calculadas? Visão Técnica do Algoritmo de Precisão

Resposta curta: horas planetárias são calculadas com base em amanhecer/entardecer reais da sua localização, dividindo dia e noite em 12+12 partes e atribuindo planetas pela regência diária e pela ordem caldeia.

Resposta completa: para isso funcionar no mundo real, o cálculo precisa de precisão astronômica, geolocalização correta e tratamento rigoroso de fuso horário. É exatamente isso que detalhamos aqui.

Se você quiser a base conceitual primeiro, comece por [Horas Planetárias Explicadas](/pt/blog/what-are-planetary-hours).

## Por que precisão é inegociável

No sistema de horas planetárias, poucos minutos de erro no nascer/pôr do sol podem deslocar toda a sequência do dia.

Na prática: você acredita que tomou decisão em Júpiter, mas estava em Marte por erro de timezone. O contexto energético muda completamente.

Por isso, tratamos precisão como requisito estrutural.

## O algoritmo em 5 etapas

## Etapa 1) Definir corretamente “onde” e “quando”

- localização por texto, sugestão automática ou coordenadas;
- conversão para latitude/longitude precisas;
- data selecionada como referência temporal.

Sem esse início bem definido, o restante do cálculo perde confiabilidade.

## Etapa 2) Obter amanhecer e entardecer com base astronômica

Usamos **SunCalc.js** para calcular:

- amanhecer do dia,
- entardecer do dia,
- amanhecer do dia seguinte (fundamental para horas noturnas).

Esse ponto é central porque hora planetária não é bloco fixo de 60 minutos.

## Etapa 3) Divisão dinâmica do dia/noite em 12+12

Fórmulas principais:

- Duração diurna = `entardecer - amanhecer`
- Duração noturna = `amanhecer_seguinte - entardecer`
- Hora diurna planetária = `duração_diurna / 12`
- Hora noturna planetária = `duração_noturna / 12`

Resultado: duração da hora planetária diurna e noturna geralmente é diferente.

## Etapa 4) Atribuição dos regentes

Regra de ouro:

1. A primeira hora após amanhecer recebe o planeta regente do dia.
2. As horas seguintes seguem a ordem caldeia:

**Saturno → Júpiter → Marte → Sol → Vênus → Mercúrio → Lua**

Esse ciclo continua até completar as 24 janelas.

## Etapa 5) Conversão para horário local real

Aqui muitas ferramentas erram.

Eventos solares costumam vir em UTC. Para mostrar horário útil ao usuário, convertemos com fuso IANA (ex.: `America/Sao_Paulo`) e regras de horário de verão quando aplicável.

Sem essa etapa robusta, o cálculo fica tecnicamente frágil no uso cotidiano.

## Por que calculadoras podem divergir

Diferenças normalmente vêm destes pontos:

1. uso de GMT fixo em vez de IANA;
2. estimativas simplificadas de amanhecer/entardecer;
3. tratamento inadequado de DST;
4. aplicação incorreta de regente diário ou ordem caldeia.

Nosso foco é mitigar exatamente esses riscos.

## Transparência técnica

O projeto é open-source e a lógica principal de cálculo fica explícita em serviços dedicados. Isso permite auditoria, confiança e evolução contínua.

Também acompanhamos melhorias em bibliotecas astronômicas e de fuso para manter precisão alta.

## Fechamento

Uma calculadora de horas planetárias confiável parece simples por fora, mas depende de uma cadeia técnica bem orquestrada por dentro. Quando esse fundamento é sólido, o sistema vira ferramenta prática de alto valor.

Para aplicar agora:

- [Calculadora de Horas Planetárias](/pt)
- [Como Usar Horas Planetárias](/pt/blog/using-planetary-hours)
- [Introdução da Calculadora](/pt/blog/introduction)
