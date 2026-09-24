# Clase 2 — Torneo en vivo (guion del demo)

**Bloque 4, 11:55–12:30 (35 min).** El curso ya tiene su rúbrica en la pizarra. Ahora la aplica a
hipótesis generadas por la máquina en el momento.

---

## Qué estamos reproduciendo

El co-scientist hace: **generar → debatir → rankear (Elo) → evolucionar**. Nosotros hacemos lo
mismo, pero con el curso ocupando el asiento del agente Ranking. Al final comparamos los dos
rankings. Donde difieren, ahí está la limitación que el propio paper declara.

**El demo no es una demostración de que la herramienta es buena.** Es un experimento cuyo
resultado no controlas. Dilo así al abrirlo: si las seis hipótesis salen mediocres, eso también es
un hallazgo, y es más interesante que si salen buenas.

---

## Preparación (5 minutos antes de clase)

- Proyector con una ventana de Claude o Gemini, **fuente grande** (Ctrl + `+` tres veces).
- Cronómetro a la vista.
- Pizarra dividida en dos columnas: **CURSO** | **MÁQUINA**.
- Ten abierta esta página y la hoja del comité.

---

## Paso 0 — Conseguir la pregunta (3 min)

> "Necesito una pregunta de investigación real. De alguien de esta sala, de su tesis. No un
> ejemplo de juguete — si es de juguete, el ejercicio no prueba nada. ¿Quién la pone?"

Si nadie se ofrece en 30 segundos, **no insistas**: usa la pregunta de respaldo. Insistir quema el
clima y pierdes tres minutos.

### Pregunta de respaldo

> *¿Por qué algunas familias de élite en Chile conservan poder económico a través de generaciones
> mientras otras lo pierden?*

Es tuya, la conoces a fondo, y puedes evaluar las hipótesis con autoridad real frente al curso —
que es justamente lo que el paper de Gemini llama orquestación humana fuerte. Si la usas, dilo:
"uso una mía, así ustedes ven cómo evalúa alguien que sí conoce el campo."

---

## Paso 1 — Generación (7 min)

Pega esto, con la pregunta insertada:

```
Actúa como el agente de generación de un sistema de co-científico.

Pregunta de investigación: [PREGUNTA]
Campo: ciencia política / sociología histórica, contexto chileno y latinoamericano.

Genera SEIS hipótesis rivales que podrían responderla. Requisitos:
- Deben competir entre sí, no complementarse. Si dos pueden ser verdad a la vez, reemplaza una.
- Cada una en máximo 3 líneas.
- Cada una debe nombrar un mecanismo causal concreto, no una correlación.
- Al menos dos deben ser incómodas o contraintuitivas para el consenso del campo.
- Para cada hipótesis, indica en una línea qué dato la refutaría.

No las ordenes ni las evalúes todavía. Solo genéralas, numeradas del 1 al 6.
```

Mientras genera, **léelas en voz alta a medida que aparecen**. No esperes en silencio: el silencio
frente a un texto que se escribe solo mata el ritmo.

Anota las seis en la pizarra en una línea cada una.

---

## Paso 2 — El curso rankea (10 min)

> "No le pidan a la máquina que se evalúe. Evalúen ustedes, con la rúbrica que hicimos hace
> veinte minutos."

Cada grupo puntúa las seis hipótesis con la rúbrica consolidada. Cinco minutos de grupo, cinco de
puesta en común. Escribe el ranking del curso en la columna **CURSO**.

**Fuerza que haya un ganador y un último lugar.** Si el curso quiere empatar todo, el ejercicio se
diluye. Diles que el Elo no permite empates y que ellos tampoco.

---

## Paso 3 — La máquina se rankea a sí misma (5 min)

```
Ahora actúa como el agente de ranking. Ordena las seis hipótesis de mejor a peor
según cuál merece más ser investigada.

Para cada par de las tres primeras, argumenta brevemente por qué una le gana a la otra,
como en un debate. Luego entrega el ranking final del 1 al 6 y justifica el primer lugar
en dos líneas.
```

Escribe ese ranking en la columna **MÁQUINA**. **No comentes todavía.** Deja que vean las dos
columnas en silencio unos segundos. La comparación visual hace el trabajo sola.

---

## Paso 4 — La discrepancia (7 min)

Aquí está la clase entera. Las preguntas, en este orden:

1. **¿Dónde difieren más los dos rankings?** Tomen esa hipótesis específica.
2. **¿Por qué la máquina la sobrevaloró o la subvaloró?** ¿Qué criterio de nuestra rúbrica no
   estaba aplicando?
3. **¿Quién tiene razón — y cómo lo sabríamos sin correr el estudio?**

Y el remate:

> "Esto que acabamos de hacer es la limitación número cinco del paper del co-scientist: 'necesidad
> de mejores métricas más allá del Elo y de juicios expertos subjetivos'. Nosotros somos el juicio
> experto subjetivo. Y no nos pusimos de acuerdo con la máquina. Ese desacuerdo no tiene todavía
> una solución técnica."

### Si sobra tiempo: el paso evolución

```
Toma la hipótesis que quedó última y la que quedó primera. Combínalas en una séptima
hipótesis que conserve el mecanismo causal de la primera y la incomodidad teórica de la última.
```

Casi siempre sale algo mejor que las seis originales. Es la demostración más limpia de por qué la
evolución iterativa importa — y de por qué el humano que eligió *qué* combinar hizo el trabajo
difícil.

---

## Modos de falla y qué hacer

| Si pasa esto | Haz esto |
|---|---|
| Las seis hipótesis salen genéricas y aburridas | **Perfecto, no lo escondas.** "Esto es lo que pasa cuando el prompt no tiene expertise adentro." Agrega dos referencias reales del campo al prompt y regenera. La mejora se ve al instante: ese es el punto 8 de las técnicas del paper de Gemini. |
| Se cae internet o la herramienta | Ten las seis hipótesis de respaldo ya impresas (genéralas esta noche y guárdalas). El ejercicio de ranking funciona igual sin generación en vivo. |
| Un alumno dice "esto ya lo sabía, no aportó nada" | Es la mejor intervención posible. "¿Y cómo distinguimos una hipótesis que tú ya sabías de una que es conocida en el campo? ¿La máquina puede hacer esa distinción?" |
| La máquina y el curso coinciden casi perfecto | También sirve: "coincidimos. ¿Eso significa que el Elo funciona, o que la máquina y nosotros compartimos el mismo sesgo de la literatura publicada?" Conecta directo con la limitación de resultados negativos. |
| Se pasa el tiempo | Corta el paso 3 y salta al 4 con el ranking de la máquina leído rápido. La discrepancia es lo único que no se puede sacrificar. |

---

## Lo que tienes que dejar dicho antes de que suene la campana

- La máquina genera candidatos baratos y en volumen. Eso es real y cambia el trabajo.
- Lo que no resuelve es **quién juzga**. En biomedicina hay un ensayo in vitro. En un leaderboard
  hay una métrica. En ciencia política, el juez sigue siendo el campo — es decir, ellos.
- Por eso el proyecto final no se evalúa por si usaron IA, sino por si **defendieron el criterio**.
