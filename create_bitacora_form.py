"""
Create the weekly learning-journal ("bitácora individual de aprendizaje") Google
Form for "Descripción y Visualización de Datos" (UAI, 2026).

The journal is the individual component of the semester project: each student
submits one short entry per project week. Entries are limited to the nine weeks
where the project is actually moving — the two introductory classes, the three
feedback classes, the two weeks without class and the demo day are excluded.

The form is deliberately short (two structured questions plus one open field) so
that answering it nine times over the semester stays a three-minute habit rather
than a chore. The student's role in the sprint is meant to appear inside the open
answer, not as a separate structured question.

Uses the same service account as the slide and voting-form scripts. Run:

    python create_bitacora_form.py

Prints the responder URL (to share with the course) and the edit URL (which is
also the professor's view of the responses, at #responses).
"""

import sys

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

CREDENTIALS_FILE = "drive_credentials.json"
SCOPES = [
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/drive",
]
SHARE_WITH_EMAIL = "naim.bro@gmail.com"

FORM_TITLE = (
    "Bitácora individual de aprendizaje — Descripción y Visualización de Datos 2026"
)

DESCRIPTION = (
    "Registro individual del proyecto semestral. La responde cada estudiante por "
    "separado, no el grupo.\n\n"
    "Se completa nueve veces en el semestre, siempre los domingos hasta las 23:59, "
    "y cubre la semana que acaba de terminar. Tu ayudante la lee antes de la "
    "clínica del lunes, así que es también la vía más rápida para avisar que algo "
    "se está trabando.\n\n"
    "Toma unos tres minutos. Forma parte de la Bitácora individual de aprendizaje "
    "(15% de la nota del curso): 10% por estas entradas semanales, de las que se "
    "cuentan las ocho mejores de nueve, y 5% por la síntesis final del 23 de "
    "noviembre."
)

# Las nueve semanas con bitácora. Se excluyen las clases introductorias (3 y 10 de
# agosto), las tres clases de retroalimentación (7 de septiembre, 5 de octubre y
# 2 de noviembre), las dos semanas sin clase (14 de septiembre y 12 de octubre) y
# el demo day (23 de noviembre, donde se entrega la síntesis final).
SEMANAS = [
    "Semana 1 · 17 al 23 de agosto (inicio Sprint 1)",
    "Semana 2 · 24 al 30 de agosto",
    "Semana 3 · 31 de agosto al 6 de septiembre (entrega Sprint 1)",
    "Semana 4 · 21 al 27 de septiembre",
    "Semana 5 · 28 de septiembre al 4 de octubre (entrega Sprint 2)",
    "Semana 6 · 19 al 25 de octubre",
    "Semana 7 · 26 de octubre al 1 de noviembre (entrega Sprint 3)",
    "Semana 8 · 9 al 15 de noviembre",
    "Semana 9 · 16 al 22 de noviembre (víspera del demo day)",
]

# Rango holgado: los grupos se forman en la feria de temas del 17 de agosto y
# serán entre 10 y 13, de dos a cuatro integrantes.
GRUPOS = ["G{:02d}".format(n) for n in range(1, 16)]

HORAS = [
    "Menos de 2 horas",
    "Entre 2 y 4 horas",
    "Entre 4 y 6 horas",
    "Entre 6 y 8 horas",
    "Más de 8 horas",
]

USO_IA = [
    "No usé IA esta semana",
    "La usé para entender errores o conceptos",
    "La usé para generar código o texto, y verifiqué el resultado",
    "La usé para generar código o texto, y no alcancé a verificarlo todo",
]

BITACORA_PROMPT = "Tu bitácora de la semana"

BITACORA_AYUDA = (
    "Entre 5 y 10 líneas, en primera persona. Cubre al menos estas cuatro cosas:\n"
    "(1) qué hiciste tú esta semana y con qué rol dentro del grupo;\n"
    "(2) una decisión que tomó el equipo y por qué la tomaron;\n"
    "(3) tu principal problema, bloqueo o error;\n"
    "(4) algo técnico que aprendiste.\n\n"
    "Si usaste IA, explica para qué la usaste y cómo verificaste lo que te devolvió."
)


def get_services():
    creds = service_account.Credentials.from_service_account_file(
        CREDENTIALS_FILE, scopes=SCOPES
    )
    forms = build("forms", "v1", credentials=creds)
    drive = build("drive", "v3", credentials=creds)
    return forms, drive


def choice_item(title, description, options, index, kind="RADIO"):
    return {
        "createItem": {
            "item": {
                "title": title,
                "description": description,
                "questionItem": {
                    "question": {
                        "required": True,
                        "choiceQuestion": {
                            "type": kind,
                            "options": [{"value": o} for o in options],
                        },
                    }
                },
            },
            "location": {"index": index},
        }
    }


def text_item(title, description, index, paragraph=False):
    return {
        "createItem": {
            "item": {
                "title": title,
                "description": description,
                "questionItem": {
                    "question": {
                        "required": True,
                        "textQuestion": {"paragraph": paragraph},
                    }
                },
            },
            "location": {"index": index},
        }
    }


def enable_verified_email(forms, form_id):
    """Ask Google to record the respondent's verified account.

    Identity has to be reliable: the journal is graded, and each entry must join
    cleanly with the assistant's follow-up sheet. If the API rejects the setting
    we fall back to asking for the institutional address as a plain question.
    """
    try:
        forms.forms().batchUpdate(
            formId=form_id,
            body={
                "requests": [
                    {
                        "updateSettings": {
                            "settings": {"emailCollectionType": "VERIFIED"},
                            "updateMask": "emailCollectionType",
                        }
                    }
                ]
            },
        ).execute()
        return True
    except HttpError as err:
        print("  aviso: no se pudo activar el correo verificado ({}).".format(err.resp.status))
        print("  se agrega una pregunta de correo institucional en su lugar.")
        return False


def build_requests(ask_email):
    requests = [
        {
            "updateFormInfo": {
                "info": {"description": DESCRIPTION},
                "updateMask": "description",
            }
        }
    ]

    idx = 0

    if ask_email:
        requests.append(
            text_item(
                "Tu correo institucional",
                "El mismo siempre, para poder seguir tu bitácora a lo largo del semestre.",
                idx,
            )
        )
        idx += 1

    requests.append(
        choice_item(
            "¿A qué semana corresponde esta entrada?",
            "Si la estás poniendo al día, elige la semana que corresponde y no la actual.",
            SEMANAS,
            idx,
            kind="DROP_DOWN",
        )
    )
    idx += 1

    requests.append(
        choice_item(
            "Tu grupo",
            "El identificador que le asignamos a tu grupo en la feria de temas.",
            GRUPOS,
            idx,
            kind="DROP_DOWN",
        )
    )
    idx += 1

    requests.append(
        choice_item(
            "¿Cuántas horas le dedicaste tú al proyecto esta semana?",
            "Aproximado, sin contar las horas de clase.",
            HORAS,
            idx,
        )
    )
    idx += 1

    requests.append(
        choice_item(
            "¿Cómo usaste la IA esta semana?",
            "Responde con honestidad: declarar el uso no baja la nota, no declararlo sí.",
            USO_IA,
            idx,
        )
    )
    idx += 1

    requests.append(text_item(BITACORA_PROMPT, BITACORA_AYUDA, idx, paragraph=True))
    idx += 1

    return requests


def main():
    forms, drive = get_services()

    form = forms.forms().create(body={"info": {"title": FORM_TITLE}}).execute()
    form_id = form["formId"]

    verified = enable_verified_email(forms, form_id)

    forms.forms().batchUpdate(
        formId=form_id, body={"requests": build_requests(ask_email=not verified)}
    ).execute()

    if SHARE_WITH_EMAIL:
        drive.permissions().create(
            fileId=form_id,
            body={"type": "user", "role": "writer", "emailAddress": SHARE_WITH_EMAIL},
            sendNotificationEmail=False,
        ).execute()

    info = forms.forms().get(formId=form_id).execute()
    responder_uri = info.get("responderUri")
    edit_url = "https://docs.google.com/forms/d/{}/edit".format(form_id)

    print("Form ID:        {}".format(form_id))
    print("RESPONDER_URL={}".format(responder_uri))
    print("RESPUESTAS_URL={}#responses".format(edit_url))
    print("Correo verificado: {}".format("sí" if verified else "no (pregunta manual)"))
    print("Compartido con:  {}".format(SHARE_WITH_EMAIL))


if __name__ == "__main__":
    sys.exit(main())
