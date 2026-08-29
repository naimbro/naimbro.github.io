# Prompt para la sesión de Claude Code abierta en `ml2-master-game`

Copiar y pegar tal cual.

---

Arma la sesión del juego ML2 para la **clase 5 de MGT300 2026** (martes 1 de
septiembre). Carpeta: `content/sessions/mgt300_2026/clase_05_repaso_unidad_1`.

**Usá los skills del repo, no improvises.** `autor-de-contenido` primero, después
`autor-de-rubricas`, y al final `pulidor-visual`. Invocalos con la herramienta
`Skill` antes de abrir ningún archivo de contenido.

## Qué es esta sesión, y en qué se diferencia de las anteriores

No es la actividad de cierre habitual. **Esta vez el juego es la segunda mitad
entera de la clase**, y su función es repaso de toda la Unidad 1 de cara a la
Prueba de análisis 1 del 8 de septiembre.

La mecánica en sala: **después de cada pregunta paramos y repasamos esa
materia** en voz alta, antes de pasar a la siguiente. El juego es la excusa para
recorrer la unidad, no una competencia comprimida.

## Restricciones de diseño (estas ya están decididas)

- **Todas las rondas abiertas.** Ninguna de alternativas.
- **Respuestas cortas.** Dos o tres frases. El largo pedido va escrito en los
  tres lugares que manda el skill: enunciado, `globalInstructions` de la rúbrica
  y `judgeFocus`.
- **Treinta minutos de juego**, de que aparece el código en pantalla a que se
  proyecta el podio. Las pausas de repaso del profesor van *encima* de eso.
- **Registro: refrescar la memoria de los textos ya leídos.** Esto es lo más
  importante y es donde es fácil equivocarse. NO es el momento de abstracciones
  complejas, ni de aplicar a casos de estudio, ni de cruzar dos autores. Eso es
  lo que va a pedir la prueba, y esto es lo que la prepara. Preguntas cortas y
  directas sobre qué dice cada texto y por qué. La prueba de olfato: si una
  pregunta se parece a una pregunta de prueba, está mal calibrada para hoy.
- **Cobertura: clases 1, 2, 3 y 5. La clase 4 queda fuera** (IA, intimidad y
  relaciones afectivas). La clase 5 incluye lo que se ve en el primer bloque de
  ese mismo día, así que sí entra.

## De dónde sale el material

El syllabus, primero: `/mnt/c/Users/naim.bro.k/naimbro.github.io/teaching/2026_mgt300.html`.

Para las clases 1, 2 y 3 **el material ya está anclado en este repo**, en
`content/sessions/mgt300_2026/clase_01_piensa_primero`, `clase_02_autoexplotacion`
y `clase_03_enjambre`. Leé sus `knowledge_base.md` y sus `scenarios.json` antes
de despachar ningún lector: buena parte del trabajo de anclaje ya está hecho, y
además te dice qué se preguntó ya —no conviene repetir la misma pregunta, aunque
sí la misma materia.

Para la clase 5, el material es nuevo y hay dos fuentes:

- **Guía de lectura:** `/mnt/c/Users/naim.bro.k/naimbro.github.io/teaching/2026_mgt300_clase5_guia_lectura.html`.
  Trae la exposición de Han (*Infocracia*, cap. 2) y de Pariser (introducción de
  *El filtro burbuja*), los dos pasajes textuales, y el recuadro de datos de
  *America in One Room*. Es la fuente más fiel de lo que el curso leyó.
- **Deck 2026:** Google Slides `13H9LtXz4_1T8iMEEwJXWBzeiAXqqyEpqLYFu_F07uq4`,
  «Verdad, polarización y esfera pública algorítmica». Leelo con
  `read_file_content` del conector de Drive y **verificá `modifiedTime`**: se
  creó el 29 de agosto y puede cambiar antes de la clase.

## El presupuesto

La tabla de `autor-de-contenido` está calculada para un juego de 15-20 minutos,
que es el cierre de una clase normal. Acá el presupuesto es 30, así que rehacé
la cuenta con la misma fórmula (`suma_de_relojes + 2 min × nº de rondas ≤ 30`) y
mostrámela antes de escribir nada. Con rondas abiertas de 90 s eso da unas ocho
rondas; tomá ese número como hipótesis de trabajo, no como decisión.

Ocho rondas para cuatro clases significa dos por clase, y ahí hay una decisión
que quiero tomar yo: si prefiero cobertura pareja o cargar más las clases 2 y 3,
que son las que más entran en la prueba. Preguntámelo.

## Lo que quiero decidir yo

Traeme, antes de escribir archivos:

1. La tabla de anclas: qué hay, de qué slide o página, y qué pregunta permite.
2. El presupuesto rehecho, con el número de rondas propuesto.
3. **Tres versiones de cada ronda**, distintas de verdad.
4. Si las rondas van `ranked: true` o no. Es un repaso, pero el podio con ceros
   se ve mal — decímelo con tu recomendación.
5. La tabla de imágenes de `pulidor-visual` (ver abajo).

## Las imágenes

Corré la pasada de `pulidor-visual` y **buscá imágenes en internet**, con su
proceso de dos pasadas: primero clasificás cada ronda y me traés la tabla con un
número recomendado, y recién con mi visto bueno salís a buscar.

Acordate de que su tercera categoría —«la imagen sería decoración»— es la que
hay que defender: en un juego de puras preguntas abiertas sobre conceptos, una
foto ambientadora le sopla la respuesta al curso. Lo que sí califica acá son
retratos de personas que las rondas nombran (Han, Pariser, Ehrenreich, Fishkin,
el debate Lincoln-Douglas). Wikimedia Commons y archivos abiertos, **abriendo la
ficha de cada archivo y leyendo la licencia una por una**, con las trampas que
el skill lista. Este repo es público.

## Verificación

```
node scripts/validate-content.cjs mgt300_2026
node scripts/verify-session-prompt.cjs mgt300_2026 clase_05_repaso_unidad_1
npm run build
```

Y después me lo paso yo en el teléfono, que es el chequeo que cuenta. El deploy
sale solo con el push a `main`.
