# Acuerdo con Nicole Campo — Metodologías de Aprendizaje Transformadoras

**Fecha del registro:** 3 de septiembre de 2026
**Interlocutora:** Nicole Campo, coordinadora del programa *Metodologías de Aprendizaje
Transformadoras* (UAI).
**Estatus del curso:** *Descripción y Visualización de Datos* (doble título Sociología –
Ingeniería Comercial, 2026) es un **piloto** de ese programa. Lo que se acuerde con la
coordinación aplica al diseño del curso, no solo a una sesión suelta.

---

## Lo que Nicole sugirió para la clase del lunes 7 de septiembre

Clase 6 de 15 · *Introducción a dplyr (3): agrupar, resumir y comparar* · 10:00–12:40.

1. **Empezar con código de R, no con teoría.** La sesión abre escribiendo, no explicando.
2. **Contextualizar con un mapa de lo visto hasta ahora.** Antes de entrar al código nuevo,
   mostrar dónde están parados: qué se acumuló entre la clase 2 y la clase 5 y qué pieza
   viene a agregar `group_by()` + `summarise()`.
3. **Los ejercicios como estudio de caso simulado, con juego de roles.** No una lista de
   ejercicios: un caso con una situación, un encargo y datos reales que ellos puedan
   trabajar. El caso tiene que ser entretenido.
4. **Naim hace de contraparte.** El profesor no dicta el ejercicio: interpreta al cliente,
   la autoridad o el medio que pide el dato, y responde en ese papel.
5. **Trabajo en grupo.**
6. **Segundo bloque: ellos exponen los resultados.** El cierre de la sesión es la
   presentación de los grupos, no una síntesis del profesor.

## Cómo cae eso en la estructura de la sesión

| Bloque | Contenido |
|---|---|
| Apertura | Mapa de lo visto (clases 2–5) y qué agrega agrupar y resumir |
| Bloque 1 | Código en vivo: `group_by()`, `summarise()`; el caso se presenta y los grupos trabajan |
| Bloque 2 | Exposición de resultados por grupo, con Naim de contraparte |

## Decisiones tomadas (3 de septiembre)

- **El caso es «Sala de prensa»**, sobre `datos/cep_consolidada_1994_2026.csv`. La sala es
  una redacción, los grupos son equipos de datos y Naim es el editor. Está escrito completo
  —los seis encargos, los tiempos y la pauta de preguntas del editor— en
  `caso_clase06_sala_de_prensa.md`. El cuaderno que lo sostiene es
  `clase06_agrupar_y_resumir.ipynb`.
- Se descartaron las otras dos bases para este caso: `encuesta_curso.csv` tiene sólo 33
  filas y los grupos quedan demasiado chicos para agrupar (queda reservada para el taller
  de calidad del 21 de septiembre, donde su suciedad es el contenido);
  `experimentos_ia_desempeno.csv` tiene 7 filas y no da para agrupar, pero **se usa como
  calentamiento** en el cuaderno, justamente porque `summarise()` se puede verificar a mano.
- **La retroalimentación del Sprint 1 se acorta** a diez minutos generales al inicio; los
  comentarios individuales los entregan los ayudantes por escrito. La bitácora del ayudante
  no cambia.
- **El juego ML2 no se juega esta semana.** Las exposiciones del segundo bloque ocupan ese
  lugar y cumplen la misma función de cierre. El syllabus ya está actualizado.

## Pendiente antes del lunes

- Confirmar cuántos grupos hay y repartir los seis encargos (si hay más de seis grupos, dos
  toman el mismo).
- Avisar a los tres ayudantes que esta semana circulan durante el bloque de trabajo.
