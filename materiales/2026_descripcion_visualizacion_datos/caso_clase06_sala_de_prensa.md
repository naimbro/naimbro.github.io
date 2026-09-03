# Caso «Sala de prensa» — Clase 6 · Descripción y Visualización de Datos (UAI, 2026)

Estudio de caso simulado con juego de roles para la clase del **lunes 7 de septiembre de
2026, 10:00–12:40**. Contenido de la sesión: `group_by()` y `summarise()`.

Diseñado según la pauta acordada con Nicole Campo (programa Metodologías de Aprendizaje
Transformadoras) — ver `nota_metodologias_transformadoras.md`.

- **Base:** `datos/cep_consolidada_1994_2026.csv` (96.122 respuestas, 1994–2026).
- **Cuaderno:** `clase06_agrupar_y_resumir.ipynb`.
- **Rol del profesor:** editor de prensa. No explica: pide, apura y desconfía.

---

## 1. El montaje

> La sala es la redacción de un medio. Los grupos son equipos de datos. Yo soy el editor
> y el cierre es a las 12:30.
>
> «Tenemos la serie completa de la encuesta CEP: treinta y dos años, noventa y seis mil
> personas, desde 1994. Mañana sale una edición especial sobre qué le preocupa a Chile.
> Cada equipo tiene un encargo. Quiero **un titular y la tabla que lo sostiene**. Si el
> titular no tiene un número y una comparación, no entra.»

Regla que se anuncia al principio y se cobra en las presentaciones: **el editor no acepta
adjetivos.** «Subió» no es un dato. «Subió de 19,0% en 1994 a 31,4% en 2026» sí.

## 2. Los dos bloques

| Hora | Minutos | Qué pasa |
|---|---|---|
| 10:00 | 10 | Retroalimentación del Sprint 1, en bloque y general (lo individual va por escrito de cada ayudante) |
| 10:10 | 15 | **Mapa de lo visto** (clases 2–5) y por qué hoy no alcanza con contar |
| 10:25 | 10 | Calentamiento: `summarise()` sobre 7 filas que se pueden verificar a mano |
| 10:35 | 35 | **Código en vivo:** `group_by()` + `summarise()` sobre la CEP (cuaderno, partes 2 a 5) |
| 11:10 | 10 | Recreo |
| 11:20 | 45 | **Trabajo en grupo:** cada equipo desarrolla su encargo. El editor circula |
| 12:05 | 30 | **Bloque 2 — exposiciones:** 3 minutos por grupo, el editor interroga |
| 12:35 | 5 | Cierre: la regla del día |

**Decisiones que esto implica sobre el syllabus:**
- La retroalimentación del Sprint 1 se acorta a 10 minutos generales; lo individual lo
  entregan los ayudantes por escrito.
- **El juego ML2 no se juega esta semana.** Las exposiciones ocupan ese lugar y cumplen la
  misma función de cierre. La bitácora del ayudante (entrada Sprint 1) sigue igual.

## 3. El mapa de lo visto (apertura, 15 min)

Se proyecta y se dice en voz alta dónde estamos parados:

| Clase | Lo que quedó en sus manos | Qué pregunta responde |
|---|---|---|
| 2 | Colab, `read.csv()` | ¿cómo entro a los datos? |
| 3 | `count()` | ¿cuántos hay de cada tipo? |
| 4 | `%>%`, `filter()`, `select()`, `mutate()` | ¿cómo me quedo con lo que me importa? |
| 5 | `class()`, `as.numeric()`, `ifelse()`, `&` y <code>&#124;</code> | ¿cómo arreglo y clasifico una columna? |
| **6** | **`group_by()` + `summarise()`** | **¿cómo comparo un grupo con otro?** |

El gancho es un error que ellos mismos cometieron la clase 4. Ahí contaron las menciones a
la delincuencia como principal problema del país:

| Año | Menciones | Encuestados ese año |
|---|---|---|
| 1994 | 284 | 1.495 |
| 2025 | **1.342** | 4.217 |
| 2026 | 461 | 1.466 |

Contando, la delincuencia «se triplicó en 2025 y volvió a desplomarse en 2026». Dividiendo,
fue 19,0%, 31,8% y 31,4%. **`count()` no sirve para comparar grupos de distinto tamaño.**
Eso es lo que viene a arreglar `summarise()`.

## 4. Los seis encargos

**Se trabaja con los nueve grupos del Sprint 1.** El encargo de cada uno está elegido para
que la trampa que le toca sea **la misma que amenaza su propio proyecto**: el grupo que
compara años se topa con el año que falta, el que compara regiones con las regiones que no
existían, el que trabaja nivel socioeconómico con el segmento de nueve casos.

| Grupo | Tema del Sprint 1 | Encargo | Ayudante |
|---|---|---|---|
| **G01** | Índice Gini | **2** — La página tres | Martín |
| **G02** | El Estado, las políticas y sus sesgos | **4** — El gráfico de la aprobación | Matías |
| **G03** | Música chilena en veinte años | **1** — La portada | Matías |
| **G04** | Salud mental, depresión y suicidio | **6** — La corrección | Karina |
| **G05** | Presupuesto de gobierno 2020 vs. 2021 | **1** — La portada | Karina |
| **G06** | Nivel socioeconómico y deserción escolar | **2** — La página tres | Martín |
| **G07** | Educación diferencial | **5** — El encargo imposible | Matías |
| **G08** | Matrícula en educación superior por región | **3** — El mapa | Martín |
| **G09** | Centralización en la salud | **3** — El mapa | Karina |

Tres razones para leer esta tabla con cuidado antes del lunes:

- **G05 se va a llevar el golpe del día.** Su proyecto compara el presupuesto de 2020 con el
  de 2021, y el encargo 1 los va a hacer descubrir, en otra base, que **2020 no existe en la
  CEP**. No es una coincidencia que convenga suavizar: es la conversación más útil que van a
  tener sobre su propio Sprint 2.
- **Los encargos 5 y 6 no se repiten.** Son los dos en que el equipo tiene que contradecir al
  editor en público, y esa escena pierde toda la fuerza la segunda vez. G07 trabaja educación
  diferencial, donde el dato muchas veces no existe: aprender a decir «esto no se puede
  responder, y aquí está la prueba» es exactamente su problema. Y G04 trabaja salud mental,
  un tema donde las diferencias por sexo se afirman todo el tiempo sin mirar los números;
  desmentir el titular del editor es su ejercicio.
- **Los encargos 1, 2 y 3 los toman dos grupos cada uno.** Se exponen seguidos, para comparar
  los dos titulares que salieron de la misma tabla.

Cada encargo trae una **trampa** que el editor sabe y el equipo tiene que descubrir.

---

### Encargo 1 — La portada
> «¿Es verdad que Chile nunca estuvo tan asustado? Quiero la serie completa.»

`group_by(anio)` · % que menciona delincuencia como primer problema.

**Respuesta:** 19,0% en 1994; máximo de la serie en **2025 con 31,8%**; 2026 en 31,4%.
La delincuencia fue el problema número uno en 22 de los 32 años.

**Trampa: 2020 no existe.** La serie salta de 2019 a 2021 y no hay ninguna advertencia. El
equipo que dibuje una línea continua está inventando la pandemia. También hay años en que
la delincuencia *no* fue primera: 1999–2002 fue el empleo (crisis asiática) y 2018, 2019 y
2021 fueron las pensiones.

---

### Encargo 2 — La página tres
> «¿Los ricos y los pobres tienen miedo de lo mismo? Una sola tabla.»

`group_by(gse)` · problema principal por nivel socioeconómico.

**Respuesta (serie completa):** ABC1 delincuencia 28,2%; C2 26,0%; C3 24,1%; D 20,1%; y el
**segmento E rompe el patrón: su primer problema es la pobreza (18,8%)**, con delincuencia
recién tercera (13,2%).

**Trampa: los grupos son abismalmente distintos.** D tiene 39.900 casos y E tiene 3.674. Si
el equipo restringe a 2026 para «estar al día», el segmento E queda con **9 personas** y la
tabla deja de significar nada. El editor va a preguntar por el `n()`.

---

### Encargo 3 — El mapa
> «Quiero el ranking de regiones. ¿Dónde está la gente más asustada?»

`group_by(region)` · % delincuencia, últimos años (2022–2026).

**Respuesta:** Arica y Parinacota 33,5%, Maule 31,1%, Tarapacá 30,7%, Metropolitana 30,4%.
Al fondo: Araucanía 22,9% y Los Ríos 23,5%.

**Trampa doble.** Arica encabeza el ranking con **158 casos**; la Metropolitana tiene 5.964.
Y las regiones no existieron siempre: **Ñuble aparece recién en 2018**, Los Ríos y Arica y
Parinacota en 2010. Un promedio «histórico» por región compara cosas incomparables.

---

### Encargo 4 — El gráfico de la aprobación
> «El mejor y el peor momento de un presidente en treinta años. Dos números.»

`group_by(anio)` · % que aprueba.

**Respuesta:** máximo **71,9% en 2009**; mínimo **15,2% en 2019**. La caída de 2019 y el
salto de las pensiones al primer lugar ese mismo año son la misma historia.

**Trampa: los que no contestan.** La columna tiene cinco valores, no dos: además de
Aprueba y Desaprueba hay «No aprueba ni desaprueba» (15.668 casos), «No sabe» y «No
responde». Según qué se ponga en el denominador, el mismo año da porcentajes distintos. El
editor va a preguntar: «¿ese 71,9% es sobre quiénes?».

---

### Encargo 5 — El encargo imposible
> «Quiero saber si la derecha y la izquierda le tienen miedo a cosas distintas. Hoy, con
> los datos más nuevos.»

`group_by(posicion_politica)`.

**Este encargo no se puede cumplir, y ese es el punto.** La columna `posicion_politica`
está **completamente vacía desde 2021**. El equipo tiene que volver donde el editor y
decirle que no, con la evidencia en la mano: la tabla de cuántos casos válidos hay por año.

El entregable correcto es **rechazar el encargo con datos**. Si se estiran hasta 2015–2019,
donde la columna sí existe, la respuesta es buena: derecha 32,5% menciona delincuencia,
izquierda 16,7% — la brecha más grande de todo el ejercicio.

> Como editor, hay que presionar en serio antes de aceptar el «no se puede». Ese forcejeo
> es la parte formativa del encargo.

---

### Encargo 6 — La corrección
> «Publiquemos que a las mujeres les da más miedo la delincuencia. ¿Me lo respaldas?»

`group_by(sexo)` · % delincuencia en 2026.

**Respuesta: el titular del editor es falso.** Hombres 32,8%, mujeres 30,6%. La diferencia
va al revés y es chica.

**Trampa: la muestra no es mitad y mitad.** Hay 56.595 mujeres y 39.527 hombres en la base.
Contando menciones absolutas, las mujeres «ganan» siempre. Este equipo tiene que decirle al
editor, en público, que su titular no se sostiene.

---

## 5. Pauta del editor (bloque 2)

**Orden de exposición.** Nueve grupos, tres minutos cada uno: 27 minutos, con tres de
holgura. El orden no es arbitrario —los pares van seguidos y la sesión cierra con los dos
grupos que le llevan la contra al editor—:

| # | Grupo | Encargo | Qué pasa |
|---|---|---|---|
| 1 | G03 | 1 — La portada | La serie completa |
| 2 | G05 | 1 — La portada | Mismo dato, otro titular; y aparece el 2020 que falta |
| 3 | G01 | 2 — La página tres | El nivel socioeconómico |
| 4 | G06 | 2 — La página tres | Mismo dato, otro titular |
| 5 | G08 | 3 — El mapa | El ranking de regiones |
| 6 | G09 | 3 — El mapa | Mismo dato, otro titular |
| 7 | G02 | 4 — La aprobación | El denominador |
| 8 | G07 | 5 — El imposible | Le dicen al editor que no se puede |
| 9 | G04 | 6 — La corrección | Desmienten el titular del editor |

El editor pregunta, en este orden, hasta que se acabe el tiempo:

1. **«Dame el titular en una frase.»** Si trae adjetivos y no números, se devuelve.
2. **«¿Cuántos casos hay detrás de ese número?»** Si no aparece `n()` en la tabla, no se
   publica. Esta es la pregunta que se repite con todos los grupos.
3. **«¿Ese porcentaje es sobre qué total?»** Denominador: ¿se contaron los `NA`, los «no
   sabe», los vacíos?
4. **«¿Qué le falta a tu serie?»** (para los encargos 1 y 4: el año 2020).
5. **«Si mañana alguien dice que este dato está mal, ¿con qué le respondes?»**

Cierre del profesor, ya fuera del personaje —**la regla del día**:

> Antes de comparar dos grupos, pregúntale a cada uno cuántos son. Un promedio sin `n()` es
> una opinión con decimales.

## 6. Qué hay que tener listo antes del lunes

- [x] Cuaderno `clase06_agrupar_y_resumir.ipynb` enlazado en el syllabus.
- [x] Encargos repartidos entre los nueve grupos del Sprint 1 (tabla de la sección 4).
- [ ] Los seis encargos impresos o en una lámina, uno por grupo.
- [ ] Avisar a los tres ayudantes que esta semana circulan durante el bloque de trabajo y
      que la bitácora del Sprint 1 se completa igual. A cada uno le tocan sus mismos tres
      grupos: Martín G01, G06 y G08; Matías G02, G03 y G07; Karina G04, G05 y G09.

> La lista de integrantes vive en la planilla de grupos del Sprint 1, en Drive. **No se
> copia acá**: este repositorio es público y son estudiantes de primer año. Los grupos se
> identifican sólo por su código.
