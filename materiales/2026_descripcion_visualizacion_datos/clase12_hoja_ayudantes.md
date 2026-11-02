# Clase 12 · La licitación — hoja para los ayudantes

Descripción y Visualización de Datos (UAI 2026) · lunes 2 de noviembre · 10:00–12:40

- **Láminas:** <https://docs.google.com/presentation/d/18P2pILlJyUiUBx1gY4Ho3bowXnEzS0_vSoaEgcN2U8I/edit>
- **Cuaderno:** <https://colab.research.google.com/github/naimbro/naimbro.github.io/blob/main/materiales/2026_descripcion_visualizacion_datos/clase12_ggsave_y_facet_grid.ipynb>
- **Cartas de la fundación:** <https://naimbro.github.io/materiales/2026_descripcion_visualizacion_datos/clase12_cartas_fundacion.html>
- **Hoja de ruta (la clase paso a paso, con todos los enlaces):** <https://naimbro.github.io/materiales/2026_descripcion_visualizacion_datos/clase12_hoja_de_ruta.html>
- **Tutorial de Google Sites:** <https://docs.google.com/presentation/d/1NEBnRZasgLn_Vvj-CG0GQ1B87K8LQn5a2D2GX1O7DqQ/edit?usp=sharing>
- **Form del corte (11:10):** <https://docs.google.com/forms/d/e/1FAIpQLSerOQ1YK37w6kfe2O8Vh51_w3wWS3-xp_t9aWgyTLCog8Gp-Q/viewform>
- **Form de notas (11:30–12:10):** <https://docs.google.com/forms/d/e/1FAIpQLScWUcyA2LcTQnk7TDAR3VTsLb97xBCLFWF2uD6rff83hQys9Q/viewform>

## Horario

| Hora | Qué pasa | Qué hacen ustedes |
|---|---|---|
| 10:00–10:25 | Mapa y código en vivo | Ayudar a quien no encuentre el PNG en el panel de archivos |
| 10:25–10:45 | Los cinco candidatos | Aprobar el hallazgo n.º 1 de sus tres grupos |
| 10:45–11:10 | Google Sites: portada y una sección con `facet_grid()` (obligatorio) | Ayudar a elegir las dos variables del `facet_grid()`; destrabar Sites y `ggsave()` (con Gmail personal: las cuentas @alumnos.uai.cl no sirven; el tutorial está en el QR); recordar el corte |
| 11:10 | Corte: enlace y titular en el form | Confirmar que sus tres grupos enviaron |
| 11:10–11:30 | Recreo | — |
| 11:30–12:10 | La licitación: nueve sitios, una nota cada uno | Uno de ustedes cronometra: unos 4 minutos por sitio (90 segundos de navegación, una pregunta de la fundación, 30 segundos para la nota) |
| 12:10 | Envían el form de notas | Recordar que lo envíen |
| 12:15–12:40 | Podio y cierre | Si sobra tiempo, seguir con sus grupos en el sitio |

## El `facet_grid()` de cada grupo

Es obligatorio en la sección del sitio y **tiene que cruzar dos variables**:
`facet_grid(filas ~ columnas)`. Uno de una sola variable (`facet_grid(. ~ variable)`) no
cuenta, porque es lo mismo que el `facet_wrap()` de la clase 10. La columna del cruce es una
pista, no una receta: verifiquen primero que la base tenga esas variables. Si le falta la
segunda, se puede crear con `mutate()`, por ejemplo `mutate(gano = cambio > 0)`.

| Grupo | Ayudante | Cruce sugerido |
|---|---|---|
| G01 | Martín | `indicador ~ pais`: Gini y Palma por país, años en el eje |
| G02 | Matías | `pais ~ categoria`: Chile e Irlanda por categoría del proyecto o tipo de fondo; si no la traen, la variable que tengan (comuna, año) |
| G03 | Matías | `origen ~ radio`: música chilena o extranjera, por radio |
| G04 | Karina | `sexo ~ region`: OWID trae país, año y sexo |
| G05 | Karina | `gano ~ anio`: ministerios en el eje, dos años en columnas y en filas si ganaron o perdieron, con `mutate(gano = cambio > 0)` |
| G06 | Martín | `dependencia ~ nivel`, si la base las trae; si no, `nivel ~` otra variable de la comuna |
| G07 | Matías | `sexo ~ subregion`, si la base trae sexo. Ojo: está en formato ancho (un año por columna) y `pivot_longer()` no se ha visto, así que conviene elegir una columna de año |
| G08 | Martín | `tipo_institucion ~ region` (ojo: la base anual está truncada en 1.048.575 filas) |
| G09 | Karina | `complejidad ~ zona`: Región Metropolitana contra el resto |

## Cómo aprobar el hallazgo n.º 1

1. Tiene un número y una comparación.
2. Sale de la base del grupo, no de una noticia.
3. A alguien fuera del grupo le importaría, empezando por la fundación de su carta.

Si no cumple, que suban el n.º 2 de su lista.

**G04 (suicidio), Karina antes de las 11:10:** titular sin sensacionalismo (nada de «epidemia» ni verbos dramáticos), ningún detalle de métodos y la línea *4141 en la portada.

## El segundo bloque

Naim proyecta cada sitio en orden, de G01 a G09, y lo navega 90 segundos sin que el grupo
explique; después, como la fundación, le hace una pregunta al grupo. Al final, el curso le pone nota de 1 a 5 en el form de notas, que tienen
abierto desde el principio y envían una sola vez, a las 12:10. El form pregunta primero el
grupo y muestra sólo los otros ocho, así que nadie puede poner nota a su propio sitio.

Los tres mejores promedios ganan una décima al Sprint 4; si hay empate en el tercer lugar,
suben todos los empatados.

| Grupo | Su ayudante | Fundación |
|---|---|---|
| G01 | Martín | Mesa Larga |
| G02 | Matías | Cancha Abierta |
| G03 | Matías | Dial Propio |
| G04 | Karina | Hablemos Claro |
| G05 | Karina | Peso a Peso |
| G06 | Martín | Pupitre |
| G07 | Matías | Letra Viva |
| G08 | Martín | Código Joven |
| G09 | Karina | Red Sur |

## Retroalimentación del Sprint 3

Pasa al lunes 9: en la página «Cómo lo hicimos» del sitio, qué observaciones incorporan,
cuáles no y por qué.
