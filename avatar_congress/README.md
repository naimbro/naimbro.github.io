# Congreso de avatares

Pipeline para una dinámica de clase: cada estudiante entrena un **avatar
político anónimo**, luego el humano y su avatar responden la misma encuesta,
y comparamos qué tan bien el avatar representa a su persona.

Curso: *Temas Emergentes — IA y Democracia*, Minor en IA, Escuela de Gobierno
UAI, 2026. Clase 3, Módulo 2.

---

## Privacidad (léelo primero)

- Las llaves (ej. `CONDOR-47`) son **seudónimas**, no anónimas. Trata todo dato
  como sensible.
- **No** se recolecta nombre, RUT ni correo.
- **Nunca** se commitean datos individuales: `data_private/`, `data_runtime/` y
  `exports_private/` están en `.gitignore`, igual que `.env`,
  `drive_credentials.json` y `config/config.local.yaml`.
- El dashboard puede correr en **modo público** (`--public`), que oculta las
  respuestas individuales y muestra solo agregados. En clase se usa el modo
  local (por defecto), que sí permite explorar por llave.
- Las llaves sí se muestran en el dashboard: cada estudiante debe reconocer su
  propio avatar.

---

## Requisitos

- Python 3.10+
- `drive_credentials.json` en la raíz del repo (service account con Forms,
  Drive y Sheets API habilitadas en su proyecto GCP).
- `.env` en la raíz con:
  ```
  OPENAI_API_KEY=...
  ANTHROPIC_API_KEY=...
  ```
- La **Google Forms API** debe estar habilitada en el proyecto del service
  account. (Ya quedó habilitada en `drive-297912`. Si algún día falla con
  `SERVICE_DISABLED`, habilítala con:
  `gcloud services enable forms.googleapis.com --project=<PROYECTO>`.)

---

## Instalación

```bash
cd /mnt/c/Users/naim.bro.k/naimbro.github.io      # raíz del repo
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r avatar_congress/requirements.txt

cp avatar_congress/config/config.example.yaml avatar_congress/config/config.local.yaml
```

`config.local.yaml` se autocompleta con los IDs de los formularios cuando
corres los scripts 02 y 05. No necesitas editarlo a mano (salvo para cambiar de
modelo o modo).

---

## Selección de modelo LLM

23 estudiantes × 16 preguntas. En **modo batch** son 23 requests (~1.3k tokens
in / ~0.7k out cada uno): costo total de **centavos**, muy por debajo de los
USD 10 de presupuesto.

| Proveedor | Modelo | Costo estimado total | Velocidad | Pros | Contras | Decisión |
|---|---|---:|---|---|---|---|
| OpenAI | `gpt-4o-mini` | ~US$0.02 | Rápido | Barato, buen español, JSON mode nativo | Menos "razonador" que modelos grandes | **Elegido (default)** |
| Anthropic | `claude-haiku-4-5` | ~US$0.10 | Rápido | Excelente español, sólido siguiendo instrucciones | Un poco más caro | Alternativa |
| OpenAI | `gpt-4o` / `gpt-5` | ~US$0.30–1 | Medio | Mejor matiz | Innecesario para esta tarea | No |

Cambiar de modelo: edita `llm.provider` y `llm.model` en `config.local.yaml`.

**Batch vs per-question** (en `run.mode` o con `--mode`):
- `batch` (default): 1 request por estudiante (todas las preguntas juntas).
  Más barato y rápido. El dashboard igual anima las respuestas una a una.
- `per-question`: 1 request por estudiante-pregunta (368 requests). Más lento;
  úsalo solo si quieres aislar cada respuesta.

---

# Cómo correr esto en clase

> Todos los comandos se corren desde la raíz del repo
> (`/mnt/c/Users/naim.bro.k/naimbro.github.io`).

## Antes de la clase

```bash
# 0. Verificar que todo está en orden (incluye una llamada mínima al LLM)
python avatar_congress/scripts/00_check_environment.py --probe-llm

# 1. Generar las llaves anónimas (30 para una clase de 23)
python avatar_congress/scripts/01_generate_keys.py
#    -> imprime la lista; también en exports_private/keys_for_class.txt

# 2. Crear el formulario de ENTRENAMIENTO (imprime el link para estudiantes)
python avatar_congress/scripts/02_create_training_form.py
```

1. Reparte una llave a cada estudiante (de `keys_for_class.txt`).
2. Comparte el **link del formulario de entrenamiento** (lo imprime el paso 2).
3. Espera a que respondan.

> Puedes crear también la encuesta humana desde ya (paso 5) y dejar ambos links
> listos.

## Cuando los estudiantes terminen el entrenamiento

```bash
# 3. Ingerir respuestas de entrenamiento (valida llaves, deduplica)
python avatar_congress/scripts/03_ingest_training_responses.py

# 4. Construir los avatares (system prompts individualizados)
python avatar_congress/scripts/04_build_avatar_prompts.py

# 5. Crear el formulario de la ENCUESTA HUMANA (imprime el link)
python avatar_congress/scripts/05_create_human_survey_form.py
```

Comparte el **link de la encuesta humana** con los estudiantes.

## Durante la encuesta (corre el dashboard + los avatares)

En una terminal, levanta el dashboard:

```bash
python avatar_congress/scripts/serve_dashboard.py
#    -> http://localhost:8000   (Tab "En vivo")
```

En **otra** terminal, lanza a los avatares a responder:

```bash
python avatar_congress/scripts/06_run_avatar_survey.py --mode batch
```

Proyecta `http://localhost:8000`. Verás las respuestas llegar en vivo
(con sonido si activas el botón "Activar sonido"). Mientras tanto, los humanos
responden la encuesta.

> Prueba en seco (sin gastar mucho): `... 06_run_avatar_survey.py --limit 3`.

## Cuando todos respondan la encuesta humana

```bash
# 7. Ingerir respuestas humanas
python avatar_congress/scripts/07_ingest_human_survey.py

# 8. Analizar humano vs avatar
python avatar_congress/scripts/08_analyze_results.py

# 9. Auditar privacidad de los datos públicos (opcional pero recomendado)
python avatar_congress/scripts/09_export_public_dashboard_data.py
```

Refresca el dashboard → Tab **Análisis agregado** (match promedio, error Likert,
R², preguntas mejor/peor representadas, scatter humano-vs-avatar) y Tab
**Explorar por llave** (cada estudiante ingresa su llave y ve su comparación).

## Al final (opcional)

```bash
# 10. Inyectar los links de formularios/dashboard en el syllabus
python avatar_congress/scripts/10_update_syllabus_links.py
```

---

## Pregunta para discutir en clase

> ¿Qué nivel de error aceptaríamos antes de dejar que un avatar delibere,
> recomiende o vote por nosotros?

Esta es una actividad **experimental**, no una defensa ingenua de reemplazar
representantes por IA.

---

## Estructura

```
avatar_congress/
  config/
    config.example.yaml        # plantilla (config.local.yaml es privado)
    survey_questions.yaml       # 16 preguntas (10 Likert + 6 A/B) + Q17 libre
    training_form_schema.yaml   # ficha de entrenamiento del avatar
  scripts/
    common.py                   # helpers compartidos
    forms_builder.py            # crear Google Forms vía API
    serve_dashboard.py          # servidor local del dashboard (Flask)
    00_check_environment.py
    01_generate_keys.py
    02_create_training_form.py
    03_ingest_training_responses.py
    04_build_avatar_prompts.py
    05_create_human_survey_form.py
    06_run_avatar_survey.py      # --mode batch | per-question
    07_ingest_human_survey.py
    08_analyze_results.py
    09_export_public_dashboard_data.py
    10_update_syllabus_links.py
  dashboard/                    # index.html + styles.css + app.js
  data_private/                 # GITIGNORE: llaves, respuestas crudas, prompts
  data_runtime/                 # GITIGNORE: eventos en vivo, progreso, agregados
  exports_private/              # GITIGNORE: análisis privado, lista de llaves
```

---

## Métricas (resumen)

**Por estudiante:** exact match (forced-choice), MAE/RMSE Likert, acuerdo
direccional, sesgo de moderación, índices technocrático y pro-regulación,
confianza vs. acierto, y un *score de representatividad* compuesto
(`0.6·direccional + 0.4·(1 − MAE/4)`).

**Agregado:** distribución de respuestas, R² de promedios por pregunta
(humano vs. avatar), support rate por propuesta (A/B), pregunta mejor y peor
representada, top-5 avatares más representativos y con mayor distancia.

> **Sobre F1:** en las preguntas forced-choice usamos *accuracy*, no F1. Con
> categorías binarias acopladas, F1 termina siendo equivalente a accuracy (ver
> Gudiño, Grandi e Hidalgo 2024), así que no aporta información extra.

---

## Troubleshooting

- **`SERVICE_DISABLED` (Forms API):** habilítala con
  `gcloud services enable forms.googleapis.com --project=drive-297912` y espera
  ~1 min.
- **`Falta OPENAI_API_KEY`:** revisa `.env` en la raíz; corre el paso 0.
- **Un avatar devuelve JSON inválido:** el runner reintenta una vez y, si falla,
  registra el error y sigue con el resto (no detiene el proceso).
- **El dashboard no muestra nada:** confirma que `serve_dashboard.py` corre y que
  estás en `http://localhost:8000`; el stream aparece cuando corre el paso 6.
- **Llave mal escrita por un estudiante:** la ingesta normaliza
  (mayúsculas/espacios) y reporta llaves con formato inválido o no asignadas.
```
