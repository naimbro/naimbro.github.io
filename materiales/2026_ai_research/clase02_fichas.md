# Clase 2 — Fichas de lectura (uso del profesor)

**Curso:** Usos de la IA en Investigación Académica — Doctorado en Procesos e Instituciones Políticas, UAI
**Fecha:** jueves 24-09-2026, 10:00–12:40

> **Nota sobre estas fichas.** El paper de ERA (Nature) lo leí completo: resumen, lista de
> tareas, discusión y conclusiones. El paper del co-scientist lo leí en abstract, versión HTML
> de arXiv y el blog de Google — **no** las 157 páginas con el suplemento. El paper de Gemini
> lo leí en abstract e índice de secciones de la versión HTML, **no** el texto completo de cada
> caso. Donde cito cifras, vienen de esas fuentes. Donde no leí, lo digo.

---

## El hilo que une las cuatro lecturas

Las cuatro describen máquinas que producen algo que antes producía un investigador: hipótesis,
código, demostraciones. Y las cuatro, sin decirlo del todo, tropiezan con **el mismo problema**:

> ¿Quién decide que el producto es bueno?

- El co-scientist se evalúa **a sí mismo** con un torneo Elo.
- ERA se evalúa contra **una métrica numérica fijada de antemano**.
- El paper de Gemini se evalúa con **expertos humanos que revisan a mano**.

Ese es el eje de la clase. No "¿puede la IA hacer ciencia?", sino **"¿de dónde sale el juez, y
qué pasa cuando en tu disciplina no hay uno?"**. En ciencia política casi nunca hay un
leaderboard. Ahí es donde esto se pone interesante para ellos.

---

## Ficha A — *Towards an AI Co-Scientist* (Gottweis et al.; arXiv 2502.18864, publicado en Nature 2026)

### Qué afirma

Que un sistema multiagente construido sobre Gemini 2.0 puede generar hipótesis científicas
**novedosas y testeables experimentalmente**, no solo resumir literatura.

### Cómo funciona (esto conviene que lo tengas claro, es el corazón de la clase)

Seis agentes especializados, inspirados explícitamente en el método científico:

| Agente | Qué hace |
|---|---|
| **Generation** | Explora literatura, simula debates científicos, propone hipótesis |
| **Reflection** | Hace de revisor por pares: revisión inicial, revisión completa con literatura, verificación profunda de supuestos |
| **Ranking** | Torneo **Elo** con comparaciones de a pares |
| **Proximity** | Calcula similitud entre hipótesis, las agrupa, elimina duplicados |
| **Evolution** | Refina: aterriza en literatura, combina las mejores, simplifica, fuerza pensamiento lateral |
| **Meta-review** | Sintetiza los patrones de todas las revisiones y sugiere expertos con quienes colaborar |

El **torneo Elo** es el mecanismo clave: las hipótesis top compiten en debates multi-turno donde
distintos agentes argumentan por ideas rivales; las de ranking bajo se comparan en un solo turno.
Es, literalmente, ajedrez entre hipótesis.

Y tiene **test-time compute scaling**: mientras más cómputo le das en el momento de inferencia,
mejores hipótesis. La calidad sube con el gasto. Eso es nuevo y es económicamente relevante.

### Evidencia

- **GPQA diamond:** la correlación entre rating Elo y accuracy es fuerte. Top-1 accuracy de
  **78,4%** eligiendo el resultado con mayor Elo. Esto es lo que usan para argumentar que el Elo
  "funciona" como métrica.
- **Evaluación experta:** 11 de 15 objetivos de investigación curados, evaluados por doctores en
  ciencias biológicas (postdocs y profesores). Preferencia promedio 2,36; novedad 3,64/5;
  impacto 3,09/5.
- **Reposicionamiento de fármacos (LMA):** 78 hipótesis evaluadas por 6 hematólogos-oncólogos
  certificados. Validación in vitro: inhiben viabilidad tumoral a concentraciones clínicamente
  relevantes.
- **Fibrosis hepática:** blancos epigenéticos con actividad antifibrótica en organoides humanos.
- **Resistencia antimicrobiana:** el sistema **redescubrió** de forma independiente un mecanismo
  de expansión de rango de hospedero en islas cromosómicas inducibles por fagos — un resultado
  que el equipo ya había validado experimentalmente **pero no había publicado**.

### Qué deja fuera

Ellos mismos listan seis limitaciones. Las que importan para la clase:

1. **La métrica se evalúa a sí misma.** Reconocen "necesidad de mejores métricas y evaluaciones
   más amplias" más allá del Elo y de juicios expertos subjetivos.
2. **No hay acceso a resultados negativos.** El sistema aprende de literatura publicada, que es
   sistemáticamente sesgada hacia lo que funcionó. Esto es enorme y lo mencionan al pasar.
3. **Validación de alcance limitado:** revisión experta de un solo centro, sin ensayos clínicos
   aleatorizados, alcance experimental acotado. Ellos mismos dicen que es preliminar.
4. Limitaciones heredadas de los LLM de frontera: alucinaciones, fecha de corte.

### Tres preguntas para la discusión

1. El caso de resistencia antimicrobiana se presenta como la prueba más fuerte: la máquina llegó
   sola a un resultado no publicado. **¿Es prueba de descubrimiento, o de que el problema estaba
   bien planteado por quienes ya sabían la respuesta?** ¿Cómo se diseñaría un test limpio?
2. El Elo mide **qué hipótesis gana un debate entre agentes**. ¿Qué propiedad de una buena
   hipótesis captura eso, y cuál no captura en absoluto?
3. Si el sistema nunca vio resultados negativos, ¿hacia qué tipo de hipótesis está sesgado?
   ¿Qué significa eso para una disciplina con un problema de replicación como la nuestra?

---

## Ficha B — *Accelerating scientific breakthroughs with an AI co-scientist* (blog de Google Research)

### Qué es

La versión comunicacional del paper anterior. **Por eso vale la pena leerlo como pieza aparte**:
es el mismo resultado contado para otra audiencia.

### El ejercicio

No lo leas buscando información nueva — casi no la hay. Léelo comparándolo con la sección de
limitaciones del paper. La distancia entre ambos textos es el objeto de estudio.

El blog dice que el sistema "redescubrió de forma independiente" el mecanismo de resistencia
antimicrobiana. El paper dice que los evaluadores fueron de un solo centro, que no hubo ensayos
aleatorizados, y que las métricas son insuficientes. Ambas cosas son ciertas. Solo una llegó a
la prensa.

### Qué deja fuera

Las seis limitaciones aparecen comprimidas en una línea sobre "validación a mayor escala".

### Tres preguntas para la discusión

1. Si alguien solo leyó el blog, **¿qué cree que se demostró que en realidad no se demostró?**
2. Los autores no mintieron: las limitaciones están publicadas. ¿Dónde está entonces la
   responsabilidad — en quien escribe el comunicado, en quien lo lee, o en el formato?
3. Ustedes van a escribir un abstract de su proyecto final. **¿Qué van a hacer distinto después
   de haber comparado estos dos textos?**

---

## Ficha C — *An AI system to help scientists write expert-level empirical software* (Aygün et al., Nature 2026)

### Qué afirma

Presentan **ERA** (Empirical Research Assistance): un LLM acoplado a **búsqueda en árbol** (tree
search, el mismo linaje de AlphaGo) que reescribe código iterativamente para maximizar una
métrica de calidad. El argumento central: si conviertes la creación de software en una **"tarea
puntuable"** (*scorable task*), la máquina la resuelve mejor que los expertos humanos.

### Evidencia — y es fuerte

- **Bioinformática (integración de lotes en scRNA-seq):** ERA descubrió **40 métodos nuevos** que
  superaron al mejor método humano de un leaderboard público.
- **Epidemiología:** **14 modelos** que superaron al ensemble del CDC *y a todos los modelos
  individuales* en predicción de hospitalizaciones por COVID-19.
- También: segmentación geoespacial de imágenes satelitales, predicción de actividad de >70.000
  neuronas en cerebro de pez cebra (ZAPBench), solución numérica de integrales difíciles, y una
  construcción novedosa basada en reglas para predicción de series de tiempo.
- El sistema lo desarrollaron **compitiendo en Kaggle**. Vale la pena que noten eso: el hábitat
  natural de ERA es la competencia con métrica fija.

### Qué deja fuera — y lo dicen ellos, con todas sus letras

Esta es la cita que vale la clase entera. Los autores escriben que quieren enfatizar

> "la distinción crítica entre optimizar modelos predictivos empíricos y realizar descubrimiento
> científico genuino, este último de los cuales requiere razonar sobre teorías subyacentes,
> mecanismos causales y marcos matemáticos."

Es decir: **el paper de Nature que demuestra que la máquina le gana a los expertos dice, en su
discusión, que eso no es descubrimiento científico.**

Y el requisito de entrada es duro: la tarea tiene que ser puntuable. Necesitas una métrica
numérica, automática, fijada de antemano, sobre la cual haya consenso. Pregúntales cuántas
preguntas de su tesis cumplen eso.

Mencionan además un riesgo de seguridad: al automatizar flujos de ingeniería complejos, el
sistema **baja la barrera técnica** para desplegar modelos sofisticados en dominios sensibles o
peligrosos.

### Tres preguntas para la discusión

1. **¿Cuál de las preguntas de tu tesis es una "tarea puntuable"?** Si ninguna lo es, ¿eso
   significa que ERA es inútil para ti, o que hay una sub-tarea puntuable escondida adentro?
2. Si ERA encuentra 40 métodos que ganan en el leaderboard, ¿aprendimos 40 cosas sobre biología,
   o 40 cosas sobre el leaderboard? ¿Cómo distinguirías una de otra?
3. En ciencia política, ¿qué pasa si convertimos una pregunta en tarea puntuable? ¿Qué ganamos y
   qué desaparece de la pregunta en esa traducción?

---

## Ficha D — *Accelerating Scientific Research with Gemini: Case Studies and Common Techniques* (arXiv 2602.03837)

### Qué afirma

Que los modelos de frontera funcionan como **colaboradores de investigación**, no como
herramientas de automatización: resuelven problemas abiertos, refutan conjeturas y generan
demostraciones novedosas. La diferencia con los dos anteriores es que aquí **no hay sistema
autónomo** — hay investigadores humanos trabajando con el modelo, y el paper documenta *cómo*.

### Evidencia: los casos

Organizados por el tipo de colaboración, no por disciplina. Es una taxonomía útil:

- **Revisión técnica profunda y contraejemplos:** algoritmos online (submodular welfare);
  criptografía (detección de un bug en SNARGs).
- **Polinización cruzada de ideas:** algoritmos de aproximación (Max-Cut); geometría
  computacional (árboles de Steiner); teoría de grafos (matchings perfectos en grafos bipartitos
  regulares).
- **IDE integrado con IA ("vibe-coding"):** búsqueda vs. decisión en S₂ᴾ.
- **Verificación autónoma y bucles neuro-simbólicos:** física (espectros de cuerdas cósmicas).
- **Resolución de conjeturas:** teoría de la información (conjetura de Courtade-Kumar);
  NP-dureza; machine learning; **diseño de mecanismos (extensiones del principio de revelación)**;
  agregación de información en redes.

> Los dos últimos son los que más cerca quedan de ellos. Diseño de mecanismos y agregación de
> información en redes son teoría política formal. Si alguien del curso trabaja en eso, ahí hay
> una conversación.

### Las ocho técnicas comunes

Esto es lo más directamente utilizable del paper. Vale la pena proyectarlo:

1. Prompting iterativo y refinamiento por diálogo, corrección de errores y andamiaje
2. Transferencia de conocimiento cruzado: encontrar analogías, recuperar teoremas oscuros
3. Simulación y generación de contraejemplos por verificación computacional
4. Formalización y chequeos de rigor: convertir bosquejos en demostraciones formales
5. Construcción interactiva de demostraciones con validación externa
6. Uso agéntico de herramientas: bucles neuro-simbólicos con retroalimentación automática
7. Dinámica de colaboración humano-IA: la expertise humana filtra las salidas
8. Optimización del contexto: definiciones claras, integración de literatura

### Qué deja fuera

- **Sesgo de supervivencia brutal.** Son los casos que funcionaron, escritos por quienes los
  hicieron funcionar. No hay denominador: no sabemos cuántos intentos fracasaron.
- Admiten que los modelos **alucinan** y producen "alto volumen de enunciados matemáticos
  diversos" que requiere filtrado humano. En el caso de SNARGs, el modelo acertó el problema
  central pero generó ruido señalando otros asuntos menos relevantes.
- Un modo de falla curioso: el modelo a veces **evita maquinaria matemática no trivial** porque
  trata ciertas demostraciones como no elementales. La solución que encontraron fue
  "des-identificar el contexto" — quitarle los papers fuente para que no se contagie del enfoque.

### La frase que resume el paper

> "las colaboraciones más exitosas... comparten un denominador común: **orquestación humana
> fuerte**."

Y el manejo de la autoría es notable: cada sección lleva firma humana ("Written by Euiwoong
Lee"), y el paper declara que **los autores de cada sección son responsables solo de la
corrección de su sección**. En el caso de criptografía, el hallazgo lo verificaron dos expertos
independientes nombrados. La IA no aparece como autora en ninguna parte.

### Tres preguntas para la discusión

1. El paper dice que el denominador común es la orquestación humana fuerte. **¿Qué sabía el
   humano que el modelo no?** Traten de nombrar la habilidad con precisión — no "criterio", algo
   más concreto.
2. Si publicaran solo los casos donde la colaboración funcionó, ¿qué paper deberíamos exigir que
   se escriba también? ¿Quién lo escribiría?
3. Cada sección lleva firma y responsabilidad individual. **¿Es ese el modelo de autoría correcto
   para papers asistidos por IA?** ¿Qué firmarías tú y qué no?

---

## Munición de reserva para la discusión

Si la conversación se apaga, estas tres funcionan casi siempre:

- **La contradicción:** "El paper de Nature demuestra que la máquina le gana a los expertos
  humanos, y en su discusión dice que eso no es descubrimiento científico. ¿Cuál de las dos cosas
  les creemos?"

- **El aprieto personal:** "Si un agente genera la hipótesis, escribe el código, corre el
  análisis y redacta el borrador — ¿qué parte del paper es tuya? ¿Y qué parte defiendes si un
  árbitro la ataca?"

- **El puente a la clase 3:** "Todos estos sistemas separan generación de crítica. La semana que
  viene vemos Clo-Author, que hace exactamente eso con agentes worker-critic. ¿Es esa separación
  una propiedad de la ciencia, o un truco de ingeniería que resulta que se le parece?"
