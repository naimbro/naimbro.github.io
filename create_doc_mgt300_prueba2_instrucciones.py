"""
Instrucciones de la Prueba de análisis 2 de MGT300 2026 (13 de octubre).

Mismo documento que el de la Prueba 1 (create_doc_mgt300_prueba1_instrucciones.py),
con dos diferencias:

  · el formato cambia: la Unidad 2 son tres clases, así que la prueba es una sola
    parte de cuatro preguntas, de las que se responden tres; no hay caso aplicado;
  · el documento nace privado, compartido sólo con Naim, porque lo revisa antes de
    enlazarlo desde el syllabus. `--publicar` abre el enlace a cualquiera con el
    link, como lectura, cuando ya está aprobado.

Qué entra sigue la regla con que se armó la prueba: sólo lo que se leyó y además
se proyectó en las presentaciones de las clases 7, 8 y 9.

Nota técnica: el documento se crea subiendo HTML a Drive con conversión, y no con
la API de Documentos, que está deshabilitada en el proyecto GCP de la cuenta de
servicio. Mismo camino que el de la Prueba 1.

Uso:
    python create_doc_mgt300_prueba2_instrucciones.py             # crear (privado)
    python create_doc_mgt300_prueba2_instrucciones.py --update    # reescribir
    python create_doc_mgt300_prueba2_instrucciones.py --publicar  # abrir el enlace
    python create_doc_mgt300_prueba2_instrucciones.py --show      # ver URLs
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
STATE_FILE = "doc_mgt300_prueba2_instrucciones.json"

TITLE = "MGT300 2026 · Prueba de análisis 2 — instrucciones"

CUERPO = "font-family:Arial,sans-serif"

SECCIONES = [
    ("Qué entra", [
        "<p>Toda la <b>Unidad 2</b>, de la clase 7 a la clase 9. La prueba evalúa que "
        "hayas entendido los argumentos y los datos de la unidad, y que puedas usarlos "
        "para razonar. No es una prueba de memoria: nadie tiene que recordar cifras "
        "exactas ni números de artículo.</p>",
        "<p>El material, por clase:</p>",
        "<ul>"
        "<li><b>Clase 7</b> — la presentación <i>¿Quién se queda con la IA? Empleo, "
        "reparto y reacción</i>: qué se ha proyectado sobre la IA y el empleo, y qué "
        "muestran hasta ahora los datos.</li>"
        "<li><b>Clase 8</b> — Daron Acemoglu, A. Arda Gitmez y Mehdi Shadmehr, "
        "«Automation and Repression» (NBER, 2026), y la presentación <i>Automatización "
        "y represión</i>, con el caso de los radiólogos.</li>"
        "<li><b>Clase 9</b> — el proyecto de ley de IA que está en el Senado: el texto "
        "que aprobó la Cámara (el extracto impreso en la guía de la actividad) y la "
        "propuesta del gobierno, con la presentación <i>¿Qué ley de IA va a tener "
        "Chile?</i></li>"
        "</ul>",
        "<p>No hay preguntas sobre los dossiers de personajes de la clase 8, porque cada "
        "uno leyó uno distinto, ni sobre el reportaje de <i>La Tercera</i> de la clase 7. "
        "Si te sirven para argumentar, úsalos: suman.</p>",
        "<p><b>Para repasar:</b> la prueba sólo pregunta por lo que estuvo en las "
        "presentaciones de las tres clases, así que ése es el mejor material que "
        "tienen, junto con el paper de Acemoglu y la guía de la actividad de la clase "
        "9. El juego ML2 de la clase 9 repasó las tres clases.</p>",
    ]),
    ("Formato y duración", [
        "<p><b>Lápiz y papel.</b> La prueba dura un bloque más el recreo: comienza a "
        "las 11:30 y termina a las 13:00.</p>",
        "<ul>"
        "<li>Se presentan <b>cuatro preguntas</b> y respondes <b>tres, a tu "
        "elección</b>. Las cuatro valen lo mismo, así que elige las tres que puedas "
        "fundamentar mejor.</li>"
        "<li>Cada pregunta va en su propia página. <b>Media plana por respuesta</b> es "
        "la extensión esperada.</li>"
        "</ul>",
    ]),
    ("Qué distingue una buena respuesta", [
        "<ul>"
        "<li><b>Di de dónde sale tu argumento.</b> Qué autor, qué texto, qué dato o "
        "qué caso.</li>"
        "<li><b>Explica el mecanismo, no la etiqueta.</b> Decir «el Estado reprime» no "
        "es responder. Responder es decir por qué se sigue.</li>"
        "<li><b>Objetar vale.</b> Discutir lo que sostiene un autor o lo que dice un "
        "dato puntúa igual que suscribirlo, siempre que muestres primero que "
        "entendiste qué sostiene.</li>"
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
        "el material, no un resumen generado. Un modelo sirve para que te explique un "
        "concepto que no entendiste o para que te pregunte de vuelta; no sirve para "
        "reemplazar la lectura, y la prueba está diseñada para notar la "
        "diferencia.</p>",
    ]),
]


def armar_html():
    partes = [
        '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>',
        '<h1 style="{c}">Prueba de análisis 2 — instrucciones</h1>'.format(c=CUERPO),
        '<p style="{c};font-size:10pt;color:#6b6b6b">'
        'MGT300 · Sociedad, Cultura y Política · Ingeniería Comercial UAI · Sección 6'
        '<br>Martes 13 de octubre de 2026 · 11:30 a 13:00 · sala habitual'
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
    """Crea el documento compartido sólo con Naim: queda privado hasta --publicar."""
    drive = get_drive()
    archivo = drive.files().create(
        body={"name": TITLE, "mimeType": "application/vnd.google-apps.document"},
        media_body=_media(),
        fields="id",
    ).execute()
    doc_id = archivo["id"]
    try:
        drive.permissions().create(
            fileId=doc_id,
            body={"type": "user", "role": "writer", "emailAddress": PROFESOR_EMAIL},
            sendNotificationEmail=False,
        ).execute()
    except HttpError as err:
        print("  aviso: no se pudo compartir con {} ({}).".format(PROFESOR_EMAIL, err.resp.status))
    return urls(doc_id)


def publicar():
    """Abre el enlace a cualquiera, como lectura. Sólo después de que Naim lo apruebe."""
    drive = get_drive()
    doc_id = show()["doc_id"]
    drive.permissions().create(
        fileId=doc_id, body={"type": "anyone", "role": "reader"}, sendNotificationEmail=False
    ).execute()
    return urls(doc_id)


def update():
    """Reescribe el documento existente conservando su ID, para no romper el enlace."""
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
    ap.add_argument("--publicar", action="store_true")
    args = ap.parse_args()

    if args.show:
        out = show()
    elif args.update:
        out = update()
    elif args.publicar:
        out = publicar()
    else:
        out = create()

    for k, v in out.items():
        print("{:10s} {}".format(k, v))


if __name__ == "__main__":
    main()
