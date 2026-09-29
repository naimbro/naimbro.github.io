# Prompt de actualización para la sesión de Claude Code abierta en `C:\Users\naim.bro.k\claude_projects\games\tribuna`

Copiar y pegar tal cual. Es urgente: la clase es hoy, martes 29-09, a las 11:30.

---

El deck de la clase 8 cambió esta mañana, y `contenido/semana308.js` ancla ideas que **ya no se
proyectan**. La regla de siempre es juzgar sólo lo leído y lo proyectado, así que hay que
actualizar el bloque «4. Lo proyectado» de `CONCEPTOS`, los pesos de los `JUECES` que lo usan,
`FUENTES` y el comentario de cabecera. Los dossiers no cambiaron: no toques los conceptos de las
secciones 1 a 3.

Lee primero el deck publicado:
`C:\Users\naim.bro.k\naimbro.github.io\teaching\2026_mgt300_clase8_presentacion.html`. Las
láminas de Acemoglu ahora son la **2 a la 11**. La radiología (12 a 18) no se ancla.

## Qué salió del deck

- **`impuestos_horcas`**: Hanauer, Gawdat y la carta de Davos ya no están. **Bórralo**, y saca
  «hanauer» de `FUENTES`.
- **`instrumento_estado`** (Proposición 3, «el instrumento decide»): la lámina se sacó. **Bórralo.**
- **`umbral_golpe`**: se sacó la lámina del golpe con la capacidad fiscal. Queda sólo una frase en
  la lámina 5 (ver abajo). **Redúcelo**: fuera «capacidad fiscal», «capacidad tributaria»,
  «fiscalmente débil», «hoja de cálculo», «no está señalizado» y «proposición 12».

## El bloque nuevo, lámina por lámina

| id | Lámina | Qué se proyecta (esto va a la `fuente`) | Claves sugeridas |
|---|---|---|---|
| `amodei_renta` (nuevo) | 2 | Amodei, «Policy on the AI Exponential» (junio 2026): una renta básica financiada con impuestos a «las empresas relevantes» o subiendo el impuesto a las ganancias de capital, para que la inquietud pública no termine en «rabia difusa y violencia» | renta basica, ingreso basico, impuesto a las empresas de ia, ganancias de capital, rabia difusa, violencia, policy on the ai exponential |
| `amodei_libertad` (nuevo) | 3 | Mismo ensayo, sección 4: la IA amenaza el equilibrio entre el poder del Estado y sus límites, pero si se reacciona rápido puede dar «garantías de libertad más robustas y duraderas que nunca». El deck remata: «Hoy: un modelo económico que predice lo contrario» | garantias de libertad, equilibrio, reaccionar rapido, estar a la altura, poder del estado |
| `represion_barata` | 5 | Comprar la paz con redistribución cuesta una fracción del ingreso que **crece** con la automatización; con represión, una fracción **fija**; con suficiente capital, la fija gana. **Corrige la `fuente`**: ya no dice «cuesta más o menos lo mismo» | mas barata la represion, reprimir, comprar la paz, paz social, fraccion fija, fraccion que crece, redistribuir |
| `umbral_golpe` (reducido) | 5 | Si la sociedad parte siendo democracia, llega un punto en que al capital le sale más barato derrocarla que pagar sus impuestos. «No porque aparezca un demagogo. Por aritmética» | el golpe, golpe de estado, derrocar la democracia, derrocarla, por aritmetica, demagogo |
| `sobreautomatizacion` | 7 | Dilema de acción colectiva: automatizar conviene a cada empresa hagan lo que hagan las demás; si todas automatizan, revuelta probable y pierden todas. La salida es alguien que obligue a todas a la vez: el Estado del capital, que protege a los capitalistas de sí mismos. **Fuera Isabel I, William Lee y Vespasiano**: ya no se proyectan | accion colectiva, dilema, externalidad, hagan lo que hagan, obligue a todas, a la vez, perdemos todos, proteger a los capitalistas, de si mismos |
| `cruce_umbral` (nuevo) | 8 | Figura 3 del paper, recalculada: el costo de redistribuir sube con el capital y el de reprimir casi no; las curvas se cruzan una sola vez; a la izquierda el Estado redistribuye, a la derecha reprime | se cruzan una sola vez, cruce, el umbral, umbral, figura 3, redistribuye, reprime |
| `torta_alcanza` (nuevo) | 9 | La objeción de Amodei («hipercrecimiento con hiperdesigualdad»): la torta crece casi cuatro veces, y el precio de la paz sube de 42% a 48% de ella; en el límite, la mitad. «Alcanzar, alcanza. Pero ahora reprimir sale más barato» | hipercrecimiento, hiperdesigualdad, la torta, alcanza para todos, precio de la paz, la mitad, 42, 48 |
| `vigilancia_barata` | 10–11 | En el modelo reprimir cuesta una fracción fija, y la IA la baja: si baja de 60% a 50% del producto, el umbral llega con menos de la mitad del capital; los autores: «si es así, nuestra conclusión principal se vería reforzada». Amodei: la IA poderosa en manos equivocadas puede ser «la herramienta definitiva de la autocracia»: drones que obedecen órdenes ilegales (nadie tiene que aceptar disparar) y vigilancia a escala de cada ciudadano. China (Beraja et al., QJE 2023): más protestas llevan a comprar reconocimiento facial, y esa compra reduce las protestas siguientes. **Fuera «observación 8»** | vigilancia, abarata, herramienta definitiva, autocracia, drones, ordenes ilegales, aceptar disparar, reconocimiento facial, china, ai-tocracy, umbral llega antes |

Amodei es personaje del duelo 1. Los dos conceptos de su ensayo son **proyectados**: valen para
cualquier grupo, pero el de Amodei los tiene más a mano.

## Pesos de los jueces

- Donde un juez tenga `instrumento_estado` en `mueve`, reemplázalo por `sobreautomatizacion`
  («la salida es alguien que obligue a todas a la vez», que es el puente del duelo Hawley–Altman
  en la lámina 20) con el mismo peso.
- Donde tenga `umbral_golpe` con peso 1,5, pásalo a `cruce_umbral` con 1,5 y deja `umbral_golpe`
  en 1,0.
- `impuestos_horcas` (0,9) se reemplaza por `torta_alcanza` con el mismo peso.
- Al juez que valora el uso correcto de Acemoglu, agrégale `vigilancia_barata` y `torta_alcanza`.
  Y en su `valora`, que el modelo tiene supuestos: el costo fijo de reprimir es uno, y la IA lo
  está rompiendo.

## El puente que ven antes de los duelos (lámina 20)

| Duelo | En el modelo | La pregunta |
|---|---|---|
| Huang – Amodei | Cada empresa automatiza por su cuenta; el riesgo lo pagan todas (lámina 7) | Lo de Hugging Face, ¿es problema de una empresa o de todas? |
| Hawley – Altman | La salida es alguien que obligue a todas a la vez (lámina 7) | ¿Quién obliga: una ley nueva o la propia industria? |
| Sanders – Musk | Alcanzar, alcanza; pero pasado el umbral, reprimir sale más barato (láminas 8 y 9) | Impuestos o cheques prometidos: ¿quién paga la paz social? |

Si la moderadora o los `EVENTOS` citan alguna de las ideas que salieron, cámbialas por estas.

## Antes de publicar

1. `node --test pruebas/`, que tiene que quedar igual o mejor. Si alguna prueba busca los `id`
   borrados, avísame antes de tocarla.
2. Revisa que ningún `id` borrado quede referenciado en `JUECES`, `RUBRICA`, `EJEMPLOS_SESION`
   ni `EVENTOS`: un `grep` de cada uno.
3. Sube la versión del manifiesto en `index.html` para que los teléfonos no se queden con la
   caché vieja.
4. **Pregúntame antes del push a `main`.** No toques los archivos modificados de otras sesiones
   (`semana307.js`, `semana5.js`, los dos specs, `pruebas/jueces.test.js`, `.gitignore`).
