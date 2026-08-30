"""
Instrucciones de la Prueba de análisis 1 de MGT300 2026 (8 de septiembre).

Documento público de sólo lectura: se comparte por enlace desde el syllabus y
desde Webcursos, y no se copia — a diferencia de la pauta de Be Right Back, acá
el estudiante no escribe nada, sólo lee.

El contenido sale de tres fuentes y conviene saber cuál manda en cada punto:

  · el formato (Parte A de 5 con 3 a elección, Parte B de caso aplicado con 3
    obligatorias) reproduce `prueba_1_2025`, que es la lógica que Naim pidió
    mantener;
  · las reglas de sala —mochilas y celulares adelante, cédula a la vista, la
    declaración del Código de Honor firmada antes de empezar, no volver a
    entrar si se sale— son del «Protocolo de buenas prácticas para la toma y
    rendición de evaluaciones presenciales» de la UAI (1 de junio de 2026), que
    es obligatorio y no admite variantes por curso;
  · la inasistencia, la recorrección y los plazos salen del syllabus 2026.

Nota técnica: el documento se crea subiendo HTML a Drive con conversión, y no
con la API de Documentos, que está deshabilitada en el proyecto GCP de la cuenta
de servicio. Mismo camino que create_doc_mgt300_clase4_brb.py.

Uso:
    python create_doc_mgt300_prueba1_instrucciones.py           # crear
    python create_doc_mgt300_prueba1_instrucciones.py --update  # reescribir
    python create_doc_mgt300_prueba1_instrucciones.py --show    # ver URLs
"""

import argparse
import io
import json

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseUpload

CREDENTIALS_FILE = "drive_credentials.json"
SCOPES = ["https://www.googleapis.com/auth/drive"]

PROFESOR_EMAIL = "naim.bro@gmail.com"
STATE_FILE = "doc_mgt300_prueba1_instrucciones.json"

TITLE = "MGT300 2026 · Prueba de análisis 1 — instrucciones"

CUERPO = "font-family:Arial,sans-serif"

SECCIONES = [
    ("Qué entra", [
        "<p>Toda la <b>Unidad 1</b>, de la clase 1 a la clase 5. La prueba evalúa "
        "tres cosas: que hayas entendido los textos, que puedas relacionarlos entre "
        "sí, y que puedas aplicarlos a un fenómeno actual. No es una prueba de "
        "memoria: nadie tiene que recordar cifras exactas ni números de página.</p>",
        "<p>Las lecturas, por clase:</p>",
        "<ul>"
        "<li><b>Clase 1</b> — Ines Lee, <i>Piensa primero, IA después</i>.</li>"
        "<li><b>Clase 2</b> — Byung-Chul Han, <i>La sociedad del cansancio</i>; "
        "Barbara Ehrenreich, <i>Smile or Die</i> (cap. 4).</li>"
        "<li><b>Clase 3</b> — Han, <i>En el enjambre</i>: «Sin respeto», «En el "
        "enjambre», «El Listo Hans» y «Huida a la imagen».</li>"
        "<li><b>Clase 4</b> — Han, <i>La agonía del Eros</i>, capítulo «Melancolía»; "
        "el reportaje de <i>The Economist</i> sobre las apps de compañía en China.</li>"
        "<li><b>Clase 5</b> — Han, <i>Infocracia</i>, cap. 2; Eli Pariser, <i>El "
        "filtro burbuja</i>, introducción; el experimento <i>America in One "
        "Room</i>.</li>"
        "</ul>",
        "<p>Las guías de lectura concentrada de las clases 2 a 5 cubren estos textos "
        "y son el mejor material de repaso que tienen.</p>",
    ]),
    ("Formato y duración", [
        "<p><b>Lápiz y papel.</b> La prueba dura un bloque más el recreo: comienza a "
        "las 11:30 y termina a las 13:00.</p>",
        "<ul>"
        "<li><b>Parte A — respuestas breves.</b> Se presentan cinco preguntas y "
        "respondes <b>tres, a tu elección</b>. Las cinco valen lo mismo, así que "
        "elige las tres que puedas fundamentar mejor. Media plana por respuesta es "
        "suficiente.</li>"
        "<li><b>Parte B — caso aplicado.</b> Un texto breve sobre un fenómeno "
        "actual, con <b>tres preguntas, todas obligatorias</b>. Se responden usando "
        "los textos del curso.</li>"
        "</ul>",
        "<p>El puntaje de cada parte va indicado en la prueba.</p>",
    ]),
    ("Qué distingue una buena respuesta", [
        "<ul>"
        "<li><b>Nombra el texto.</b> De qué autor y de qué obra sale el argumento "
        "que estás usando.</li>"
        "<li><b>Explica el mecanismo, no la etiqueta.</b> Decir «esto es el enjambre "
        "digital» no es responder. Responder es decir por qué se sigue.</li>"
        "<li><b>Ancla en el caso.</b> En la Parte B, usa un detalle concreto del "
        "texto que se te entrega, no una generalidad que serviría para cualquier "
        "caso.</li>"
        "<li><b>Objetar vale.</b> Discutir lo que sostiene un autor puntúa igual que "
        "suscribirlo, siempre que muestres primero que entendiste qué sostiene.</li>"
        "<li><b>Media plana precisa vale más que una plana de relleno.</b> No se "
        "puntúa la extensión.</li>"
        "</ul>",
    ]),
    ("Materiales permitidos", [
        "<p>Lápiz pasta o grafito, y goma. <b>Nada más:</b> sin apuntes, sin libros, "
        "sin fotocopias, sin calculadora, sin diccionario. El cuadernillo trae "
        "espacio suficiente para responder.</p>",
    ]),
    ("Al entrar a la sala", [
        "<ul>"
        "<li><b>Mochilas, bolsos y abrigos van adelante</b>, en el frente de la "
        "sala.</li>"
        "<li><b>Celular apagado y dentro de la mochila</b>, junto con el reloj "
        "inteligente y los audífonos de cualquier tipo.</li>"
        "<li><b>Cédula de identidad</b>, licencia de conducir o credencial UAI sobre "
        "la mesa, a la vista.</li>"
        "<li>El profesor puede reubicar a cualquiera dentro de la sala.</li>"
        "</ul>",
        "<p>Portar un dispositivo electrónico no autorizado durante la evaluación "
        "es, por sí solo, una infracción al protocolo de evaluaciones de la "
        "Universidad, con independencia de que se use o no.</p>",
    ]),
    ("Durante la prueba", [
        "<ul>"
        "<li>La portada trae la <b>declaración del Código de Honor</b>. Hay que "
        "leerla y firmarla antes de empezar a responder.</li>"
        "<li><b>No se sale de la sala</b> mientras se rinde la prueba, salvo por una "
        "razón justificada y con autorización del profesor.</li>"
        "<li>Una vez iniciada la prueba, <b>quien se retira la entrega</b> y no "
        "puede volver a entrar a la sala hasta que la evaluación haya terminado.</li>"
        "<li>La entrega es individual y en mano.</li>"
        "</ul>",
    ]),
    ("Después de la prueba", [
        "<ul>"
        "<li><b>Resultados</b> dentro de los diez días hábiles siguientes.</li>"
        "<li><b>Recorrección:</b> se solicita por escrito dentro de los cinco días "
        "hábiles siguientes a la entrega de la nota. La revisión puede subir, "
        "mantener o bajar la calificación.</li>"
        "<li><b>Inasistencia justificada</b> —se tramita exclusivamente por "
        "Secretaría Académica de Pregrado—: la nota de la prueba se reemplaza por la "
        "del examen. <b>Inasistencia no justificada:</b> nota 1,0.</li>"
        "</ul>",
    ]),
    ("Sobre el uso de IA", [
        "<p>La prueba es a mano y sin dispositivos, de modo que durante la "
        "evaluación no hay ningún uso de IA autorizado.</p>",
        "<p>Para prepararla, el consejo es el mismo de todo el semestre: estudien "
        "los textos, no un resumen generado. Un modelo sirve para que te explique un "
        "concepto que no entendiste o para que te pregunte de vuelta; no sirve para "
        "reemplazar la lectura, y la prueba está diseñada para notar la "
        "diferencia.</p>",
    ]),
]


def armar_html():
    partes = [
        '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>',
        '<h1 style="{c}">Prueba de análisis 1 — instrucciones</h1>'.format(c=CUERPO),
        '<p style="{c};font-size:10pt;color:#6b6b6b">'
        'MGT300 · Sociedad, Cultura y Política · Ingeniería Comercial UAI · Sección 6'
        '<br>Martes 8 de septiembre de 2026 · 11:30 a 13:00 · sala habitual'
        '<br>Profesor Naim Bro · Ayudantes Sofía Fuentes y Martín Castillo'
        '</p>'.format(c=CUERPO),
    ]

    for i, (titulo, bloques) in enumerate(SECCIONES, start=1):
        partes.append('<h2 style="{c}">{n}. {t}</h2>'.format(c=CUERPO, n=i, t=titulo))
        partes.extend(bloques)

    partes.append(
        '<p style="{c};font-size:9pt;color:#6b6b6b">Las reglas de sala de las '
        'secciones 5 y 6 son del «Protocolo de buenas prácticas para la toma y '
        'rendición de evaluaciones presenciales» de la UAI (1 de junio de 2026) y '
        'aplican a todas las evaluaciones presenciales de pregrado. Los plazos de la '
        'sección 7 están en el programa del curso.</p>'.format(c=CUERPO)
    )
    partes.append("</body></html>")
    return "".join(partes)


def get_drive():
    creds = service_account.Credentials.from_service_account_file(
        CREDENTIALS_FILE, scopes=SCOPES
    )
    return build("drive", "v3", credentials=creds)


def _media():
    return MediaIoBaseUpload(
        io.BytesIO(armar_html().encode("utf-8")),
        mimetype="text/html",
        resumable=False,
    )


def urls(doc_id):
    base = "https://docs.google.com/document/d/{}".format(doc_id)
    out = {
        "doc_id": doc_id,
        "view_url": base + "/edit?usp=sharing",
        "edit_url": base + "/edit",
    }
    with open(STATE_FILE, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2)
    return out


def create():
    drive = get_drive()
    archivo = drive.files().create(
        body={"name": TITLE, "mimeType": "application/vnd.google-apps.document"},
        media_body=_media(),
        fields="id",
    ).execute()
    doc_id = archivo["id"]

    for body in (
        {"type": "user", "role": "writer", "emailAddress": PROFESOR_EMAIL},
        {"type": "anyone", "role": "reader"},
    ):
        try:
            drive.permissions().create(
                fileId=doc_id, body=body, sendNotificationEmail=False
            ).execute()
        except HttpError as err:
            print("  aviso: no se pudo aplicar {} ({}).".format(body, err.resp.status))

    return urls(doc_id)


def update():
    """Reescribe el documento existente conservando su ID — el enlace ya está
    en el syllabus, así que crear uno nuevo dejaría a los estudiantes leyendo
    la versión vieja."""
    drive = get_drive()
    doc_id = show()["doc_id"]
    drive.files().update(fileId=doc_id, media_body=_media()).execute()
    return urls(doc_id)


def show():
    with open(STATE_FILE, encoding="utf-8") as fh:
        return json.load(fh)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--show", action="store_true")
    ap.add_argument("--update", action="store_true")
    args = ap.parse_args()

    if args.show:
        out = show()
    elif args.update:
        out = update()
    else:
        out = create()

    for k, v in out.items():
        print("{:10s} {}".format(k, v))


if __name__ == "__main__":
    main()
