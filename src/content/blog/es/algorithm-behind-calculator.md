---
title: "¿Cómo se Calculan las Horas Planetarias? Análisis Técnico del Algoritmo de Precisión"
excerpt: "Descubre cómo funciona realmente una calculadora de horas planetarias precisa: eventos solares con SunCalc.js, división dinámica 12+12, orden caldeo y corrección exacta de zona horaria."
date: "2025-05-19T17:39:49+08:00"
author: "Planetary Hours Team"
keywords:
  - cómo se calculan las horas planetarias
  - algoritmo horas planetarias
  - cálculo horas planetarias preciso
  - cómo funciona calculadora horas planetarias
faqs:
  - q: "¿Cuál es el cálculo base de las horas planetarias?"
    a: "Se divide el tramo amanecer→atardecer en 12 partes y el tramo atardecer→siguiente amanecer en otras 12, luego se asignan planetas por regente del día + orden caldeo."
  - q: "¿Por qué la zona horaria es tan importante?"
    a: "Porque los cálculos astronómicos suelen salir en UTC y deben convertirse correctamente a la hora local real (IANA + DST) para que sean útiles."
---

# ¿Cómo se Calculan las Horas Planetarias? Análisis Técnico del Algoritmo de Precisión

Respuesta corta: las horas planetarias se calculan con amanecer y atardecer **reales** de tu ubicación, dividiendo día y noche en 12+12 segmentos, y asignando regencias según el regente del día y el Orden Caldeo.

Respuesta larga (la que realmente importa): para que eso sea confiable en vida real, necesitas precisión astronómica, geolocalización correcta y manejo robusto de zona horaria. Aquí te explico exactamente cómo lo hacemos.

Si primero quieres la base conceptual, empieza por [Horas Planetarias Explicadas](/es/blog/what-are-planetary-hours).

## Por qué la precisión no es opcional

En horas planetarias, un error pequeño en amanecer/atardecer puede desplazar toda la cadena del día.

Ejemplo clásico: crees que lanzaste algo en hora de Júpiter, pero por mala conversión horaria estabas en Marte. El tipo de energía cambia totalmente, y con eso cambia la experiencia de ejecución.

Por eso tratamos la precisión como requisito, no como extra.

## El algoritmo en 5 pasos

## Paso 1) Definir correctamente “dónde” y “cuándo”

- Ubicación por texto, sugerencias o coordenadas del navegador.
- Conversión a latitud/longitud exactas.
- Fecha seleccionada como base de cálculo.

Sin ese punto de partida bien definido, todo lo demás se contamina.

## Paso 2) Calcular amanecer y atardecer con base astronómica

Usamos **SunCalc.js** para obtener eventos solares precisos del lugar y fecha:

- amanecer del día,
- atardecer del día,
- amanecer del día siguiente (clave para la noche).

Este punto es el núcleo: las horas planetarias no son bloques fijos de 60 min, sino fracciones dinámicas del día y de la noche.

## Paso 3) Dividir dinámicamente día y noche en 12+12

Fórmulas base:

- Duración diurna = `atardecer - amanecer`
- Duración nocturna = `amanecer_siguiente - atardecer`
- Hora planetaria diurna = `duración_diurna / 12`
- Hora planetaria nocturna = `duración_nocturna / 12`

Conclusión práctica: una hora planetaria diurna y una nocturna normalmente no duran lo mismo.

## Paso 4) Asignar regentes (regente del día + Orden Caldeo)

Regla:

1. La primera hora tras amanecer la rige el planeta del día.
2. Las siguientes se asignan siguiendo el Orden Caldeo:

**Saturno → Júpiter → Marte → Sol → Venus → Mercurio → Luna**

Y se repite hasta completar las 24 horas.

## Paso 5) Convertir todo a hora local real (IANA + DST)

Aquí fallan muchas herramientas simplificadas.

Los cálculos astronómicos suelen venir en UTC. Para mostrar horas útiles al usuario, hacemos conversión local correcta usando zona IANA (ej. `America/New_York`) y reglas de horario de verano.

Sin esto, el cálculo puede “parecer bien” pero estar mal en reloj real.

## Por qué algunas calculadoras no coinciden

Las diferencias suelen venir de cuatro errores comunes:

1. usar offset fijo (GMT+X) en vez de IANA real;
2. estimar amanecer/atardecer de forma grosera;
3. manejar mal DST y transiciones;
4. aplicar mal el regente del día o el orden planetario.

Nos enfocamos precisamente en eliminar esos cuatro puntos.

## Transparencia técnica

Este proyecto es open-source y mantenemos lógica explícita en servicios del cálculo. La idea es simple: confianza basada en método verificable.

También mantenemos mejora continua cuando hay actualizaciones en librerías astronómicas, geolocalización o manejo temporal.

## Cierre

Detrás de una interfaz simple hay una cadena técnica bastante seria. Y vale la pena: solo con cálculo sólido las horas planetarias sirven de verdad como herramienta de timing moderno.

Para usarlo directamente:

- [Calculadora de Horas Planetarias](/es)
- [Cómo Usar las Horas Planetarias](/es/blog/using-planetary-hours)
- [Introducción a la Calculadora](/es/blog/introduction)
