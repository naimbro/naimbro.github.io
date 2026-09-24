# Prompt para la sesión de Claude Code abierta en `C:\Users\naim.bro.k\claude_projects\games\tribuna`

Copiar y pegar tal cual.

---

Arma una **sesión nueva de Tribuna** para la **clase 8 de MGT300 2026** (Sociedad, Cultura y
Política, Ingeniería Comercial UAI), martes 29 de septiembre, 11:30-14:10. A diferencia de la
clase 7, **esta vez sí hay que tocar el motor**: los alumnos no se agrupan por brújula, sino que
se inscriben a mano bajo un **personaje**, con cupo y por orden de llegada. El ensayo con
ayudantes es el lunes 28; la clase no puede correr con código probado el mismo día (la sala 42RT
corrió entera con plantillas por eso).

## Lo primero: leer antes de escribir

1. `README.md` completo, en especial «Jugar online», «La clase en rotación», «La brújula corta»,
   «Cambiar de semana» y las dos invariantes de la audiencia.
2. `contenido/semana307.js` (el molde más cercano) y `contenido/sesiones.js`.
3. Para el motor: `jugar.js` (`mostrarBancadas`, `elegirGrupo`), `rotacion.js` (`emparejar`,
   `proximaPreguntaEscrita`), `clase.js` (dónde se arma la propuesta de debate), `online.js`
   (estado de la sala, quién llega tarde), `ritmo.js` (cómo la moderadora nombra a los grupos),
   `firestore.rules` (bloque `jugadores/{uid}`) y `admin.html`/`admin.js`.
4. `git status`: hay cambios sin commit de otras sesiones (`semana307.js`, `semana5.js`, dos
   specs, `pruebas/jueces.test.js`). **No los toques ni los incluyas en tus commits.**
5. `node --test pruebas/` antes de escribir nada; anota el resultado. Tiene que quedar igual o
   mejor.

## La clase, para que calibres

**Sala real: 25 a 30 alumnos.** Son 45 inscritos, pero en la clase 7 jugaron 24 (sala 42RT:
cinco grupos de 7/6/5/4/3), y el juego ML2 de la clase 5 tuvo 27. En la 42RT la sala se abrió a
las 13:23 y hasta las 14:10 se completaron **dos** debates: en sala real un debate completo toma
unos 15 minutos, no los 9 que dan los tramos sumados.

Secuencia:

- **Bloque 1.** Exposición de Naim sobre Acemoglu, *Automation and Repression* (30 min).
  Encuadre de la dinámica (5 min). **Inscripción en Tribuna (5 min)**: cada alumno elige su
  personaje en el teléfono. Lectura en silencio del dossier impreso de su personaje (20 min) y
  hoja de duelo en grupo (10 min).
- **Recreo.** La sala queda abierta en portada; nadie se desinscribe.
- **Bloque 2.** Presentaciones grupales orales (25 min, fuera del juego). Luego **tres duelos
  en Tribuna, ~40 min**, y cierre.

## Los personajes y los duelos

Seis personajes, tres duelos fijos. Cada grupo debate **una vez**, contra un rival que conoce
desde el bloque 1. El primero de cada par defiende A FAVOR.

| Duelo | A FAVOR | EN CONTRA | Moción |
|---|---|---|---|
| 1 | Jensen Huang (Nvidia) | Dario Amodei (Anthropic) | «Lo de Hugging Face fue un accidente de ingeniería, no una advertencia.» |
| 2 | Josh Hawley (senador) | Sam Altman (OpenAI) | «Hacen falta leyes nuevas para que las empresas de IA respondan por sus daños.» |
| 3 | Bernie Sanders (senador) | Elon Musk (SpaceX, Tesla) | «Las ganancias de la IA tienen que llegar a la gente por impuestos, no por la promesa de sus dueños.» |

**Fuente de todo el contenido: los dossiers impresos**, en
`C:\Users\naim.bro.k\naimbro.github.io\teaching\2026_mgt300_clase8_dossiers.html`. Léelos
enteros. Regla de siempre: **sólo se juzga lo leído y lo proyectado.** Lo leído es cada dossier
(el grupo lee el suyo, que trae también lo que dirá su rival). Lo proyectado es la exposición de
Acemoglu; por ahora ancla sólo estas ideas: «impuestos u horcas»; cuanto más se automatiza, más
barata resulta la represión frente al impuesto; el mercado automatiza más de lo que les conviene
a los propios capitalistas; un Estado que sólo puede regular termina defendiendo el salario (el
instrumento disponible determina lo que hace); el golpe ocurre cuando el impuesto supera el
precio de reprimir, y una democracia con capacidad fiscal cruza antes ese umbral; la misma IA
que automatiza abarata la vigilancia. Las láminas son las 1–15 de
`C:\Users\naim.bro.k\naimbro.github.io\teaching\2026_mgt300_clase8_presentacion.html`. Ninguna cifra ni cita que no esté en el dossier.

## Lo que hay que construir

### 1. Motor: grupos con nombre, cupo y orden de llegada

- **Grupos con nombre.** La semana define sus grupos como personajes (id, nombre, cargo y,
  si quieres, color). Donde hoy dice «Grupo N» —portada del teléfono, proyector, barra de
  participación, ranking, admin, las menciones con @, la moderadora— debe decir el personaje.
  Las semanas que no definen personajes siguen exactamente como hoy.
- **Cupo por personaje, fijado por el profesor** en la portada al abrir la inscripción: Naim
  cuenta a los presentes y escribe el número (con 24 presentes, cupo 4). La portada del
  profesor muestra cuántos hay en cada personaje. El cupo se puede subir durante la inscripción
  si llega más gente.
- **Orden de llegada, sin carreras.** Cuando un personaje se llena, su botón se apaga en todos
  los teléfonos, y quien llegó tarde por milisegundos recibe «se llenó, elige otro» y vuelve a
  elegir. **Dos alumnos no pueden quedarse con el último lugar.** Las reglas de Firestore no
  cuentan documentos de una colección, así que hay que elegir mecanismo: un contador por
  personaje validado en las reglas con `getAfter` en una escritura en lote, o que la pantalla
  del profesor —que ya es la autoridad de la sala— confirme las inscripciones en orden de
  `serverTimestamp` y rechace las que sobran. **Propón uno, con sus costos, antes de
  escribir.**
- **Quien llega después de cerrada la inscripción** entra al personaje con menos integrantes,
  como hoy hace la brújula con los atrasados.
- **Duelos fijos.** Las `PREGUNTAS` de la semana llevan su par: el texto de la moción, quién va
  A FAVOR y quién EN CONTRA. La moderadora propone los duelos en ese orden en vez de llamar a
  `emparejar`; el profesor puede seguir cambiándolos. Si en un duelo un personaje quedó sin
  nadie conectado, la propuesta lo dice y no se publica.

### 2. Contenido: `contenido/semana308.js`

Serie 30x, como la 307: `curso` MGT300, tema «Clase 8 · ¿Quién frena, quién paga? Seis
personajes, tres duelos». Su línea en `sesiones.js` y la versión del manifiesto al día en
`index.html`. Brújula apagada: si `pruebas/brujula.test.js` exige `BRUJULA` en todas las
semanas, lo conversamos antes de parchear el test.

- `CONCEPTOS`: cada uno anclado a un extracto de un dossier o a una idea de Acemoglu, con su
  `fuente`. Los hallazgos que más sirven en sala son las contradicciones de cada personaje con
  su negocio: Nvidia comprometió hasta 10 mil millones en Anthropic; Anthropic le paga a SpaceX
  hasta 1.250 millones al mes; Altman propuso en 2023, frente a Hawley, una agencia que dé
  licencias; Sanders y Musk coinciden en el diagnóstico del empleo.
- `FUENTES`: apellidos de los seis y de los demás nombrados en los dossiers (Klein, Hinton,
  Selsam, Sacks, Durbin, Bessent, Fetterman, Acemoglu), más «the economist», «new york times»,
  «hugging face».
- `JUECES` propios, y en `JUECES_COMUN` —el piso común que `jueces.js` pone en el prompt de
  los cinco— **la fidelidad al personaje**: ¿lo diría esta persona? ¿se apoya en algo que efectivamente dijo, según el
  dossier? Premia citar o parafrasear bien un extracto; castiga inventar una cita o poner al
  personaje a defender algo contra lo que se ha pronunciado. Ceder un punto con una razón no se
  castiga: Altman y Musk cambiaron de posición este mes. Las frases de los jueces se proyectan y
  nunca nombran a un estudiante; pueden nombrar al personaje.
- La moderadora les habla a los grupos por el nombre del personaje, y en primera persona («Señor
  Huang, ¿qué le responde a Amodei?»).
- `EVENTOS`: cinco titulares de «última hora», todos sacados de los dossiers, en presente.
  Candidatos: Anthropic le paga a SpaceX 1.250 millones al mes; Nvidia comprometió 10 mil
  millones en Anthropic; la ficha técnica de GPT-6 Astra admite que no podrían detectar si el
  modelo esconde capacidades; el secretario del Tesoro culpa a la administración de OpenAI y no
  a los agentes; Sanders presenta el proyecto para prohibir la superinteligencia.
- `AUDIENCIA`, `RONDAS` y `RUBRICA`: recicla del molde, respetando las dos invariantes del
  README.
- `EJEMPLOS_SESION`: una apertura en personaje y bien anclada (rigor alto) y otra de arenga
  genérica que no suena a nadie en particular (rigor bajo), para que los marcadores se separen
  al pulsar «rellenar con ejemplo».

## Lo que quiero decidir yo, antes de que escribas código

Tráeme en un solo mensaje:

1. **El mecanismo de cupo** que propones, por qué, y qué pasa en el peor caso (dos toques
   simultáneos, un alumno que se desconecta, la pantalla del profesor que se recarga).
2. **La lista de lugares del código** donde hoy aparece «Grupo N» y cambiaría, y cómo te
   aseguras de no romper las semanas 5, 7, 307 y 402.
3. Si hay que cambiar `firestore.rules`, el diff propuesto.
4. **La tabla de anclas** de `CONCEPTOS` y el borrador de los criterios de los jueces.

Espera mi visto bueno.

## Después: pruebas, y nada se publica sin preguntarme

- `node --test pruebas/` en verde, con pruebas nuevas para el cupo, el orden de llegada y los
  duelos fijos.
- Una simulación headless (`servidor.py` + Playwright, como en la de la barra de
  participación): **24 alumnos simulados, cupo 4**. Todos terminan inscritos, ninguno queda con
  más de cuatro, dos alumnos tocan el último lugar al mismo tiempo y sólo uno entra, y los tres
  duelos corren en orden con sus mociones. Captura de pantalla del proyector y de un teléfono
  con un personaje lleno.
- Una prueba de regresión: la semana 307 sigue formando grupos con la brújula como antes.
- **Antes de hacer push a `main` o de desplegar reglas de Firestore o la Cloud Function, me
  preguntas.**

Cierra con una **lista de verificación para el ensayo del lunes 28** con los ayudantes desde sus
teléfonos: entrada con Google, código de sala, fijar el cupo, inscripción con un personaje que
se llena, qué ve el que llega tarde, que la sala sobreviva el recreo en portada, un duelo
completo con jurado LLM, y qué pasa si el motor cae al heurístico.
