/**
 * Crea la encuesta del curso "Descripción y Visualización de Datos" (UAI, 2026)
 * y su planilla de respuestas, ambas listas para usarse en la Clase 2.
 *
 * CÓMO USARLO (una sola vez, toma ~1 minuto):
 *   1. Entra a https://script.google.com con la cuenta que será dueña del formulario.
 *   2. "Nuevo proyecto".
 *   3. Borra el contenido del editor y pega este archivo completo.
 *   4. Elige la función "crearEncuestaDelCurso" y presiona "Ejecutar".
 *   5. Google pedirá autorización (es tu propio script): Revisar permisos → Avanzada →
 *      "Ir a <nombre del proyecto> (no seguro)" → Permitir.
 *   6. En el "Registro de ejecución" aparecerán tres links:
 *        - el link del formulario (el que se comparte con el curso),
 *        - el link de la planilla de respuestas,
 *        - el LINK CSV que hay que pegar en el cuaderno de Colab (notebook 2).
 *
 * El script también deja el formulario y la planilla dentro de la carpeta de Drive
 * indicada en ID_CARPETA_DESTINO, y publica la planilla como "cualquiera con el link
 * puede ver", que es lo que permite que R la lea desde Colab.
 */

// Carpeta de Drive donde quedarán el formulario y la planilla.
// (Si prefieres dejarlos en la raíz de tu Drive, deja el string vacío: '')
var ID_CARPETA_DESTINO = '1fz-8NB0bM8lt6UJMGl5XyZnIV7Ux9CBY';

var TITULO_FORM = 'Encuesta del curso — Descripción y Visualización de Datos 2026';
var TITULO_PLANILLA = 'Respuestas — Encuesta del curso DVD 2026';


function crearEncuestaDelCurso() {

  // ---------------------------------------------------------------- formulario
  var form = FormApp.create(TITULO_FORM);
  form.setDescription(
    'Esta encuesta la responde el propio curso y sus respuestas son los datos que ' +
    'analizaremos en clases. Es anónima: no se pide nombre ni correo. ' +
    'Responde con honestidad y con números aproximados cuando no sepas el valor exacto.'
  );
  form.setCollectEmail(false);
  form.setProgressBar(true);
  form.setConfirmationMessage('¡Listo! Tus respuestas ya son parte de la base de datos del curso.');

  // Si el script se ejecuta con una cuenta Workspace (por ejemplo @uai.cl), Google
  // restringe el formulario al dominio por defecto. Esto lo abre a cualquiera con el
  // link. En cuentas personales (@gmail.com) el método no existe y lanza excepción,
  // por eso va dentro de un try.
  try {
    form.setRequireLogin(false);
  } catch (e) {
    // cuenta personal: el formulario ya es accesible con el link, no hay nada que hacer
  }

  // --- Preguntas numéricas (van como texto corto, igual que en una encuesta real:
  //     eso obliga a limpiar los datos después, que es justamente lo que enseñamos).
  form.addTextItem()
      .setTitle('¿Cuál es tu edad? Ingresa sólo el número.')
      .setRequired(true);

  form.addTextItem()
      .setTitle('¿Cuál es tu estatura en centímetros? Ingresa sólo el número.')
      .setRequired(true);

  form.addTextItem()
      .setTitle('¿Cuántos hermanos y hermanas tienes? Ingresa sólo el número (0 si eres hijo/a único/a).')
      .setRequired(true);

  form.addTextItem()
      .setTitle('¿En qué comuna vives actualmente?')
      .setRequired(true);

  form.addTextItem()
      .setTitle('¿Cuántos minutos demoras habitualmente en llegar a la universidad? Ingresa sólo el número.')
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Cómo llegas principalmente a la universidad?')
      .setChoiceValues(['Metro', 'Micro o bus', 'Auto', 'Bicicleta o scooter', 'Caminando', 'Otro'])
      .setRequired(true);

  form.addTextItem()
      .setTitle('¿Cuántas horas dormiste anoche? Ingresa sólo el número.')
      .setRequired(true);

  form.addTextItem()
      .setTitle('¿Cuántas horas al día usas redes sociales, aproximadamente? Ingresa sólo el número.')
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Cuál es el sistema operativo de tu teléfono celular?')
      .setChoiceValues(['iOS (Apple)', 'Android', 'Otro'])
      .setRequired(true);

  form.addTextItem()
      .setTitle('¿Cuántas tazas de café tomas al día? Ingresa sólo el número (0 si no tomas café).')
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Cuánta experiencia previa tienes programando?')
      .setChoiceValues([
        'Ninguna, esta es mi primera vez',
        'Sé usar Excel o Google Sheets',
        'He programado un poco alguna vez',
        'Tengo bastante experiencia'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Sobre qué dominio te gustaría que tratara tu proyecto del semestre?')
      .setChoiceValues([
        'Vivienda', 'Educación', 'Salud', 'Seguridad', 'Empleo', 'Transporte',
        'Cultura', 'Deporte', 'Medioambiente', 'Inteligencia artificial'
      ])
      .showOtherOption(true)
      .setRequired(true);

  // --- Escala tipo Likert (genera columnas del tipo "pregunta [subpregunta]")
  var escala = ['Muy en desacuerdo', 'En desacuerdo', 'Ni de acuerdo ni en desacuerdo',
                'De acuerdo', 'Muy de acuerdo'];

  form.addGridItem()
      .setTitle('¿Qué tan de acuerdo estás con las siguientes afirmaciones?')
      .setRows([
        'Un gráfico puede mentir sin mostrar un solo dato falso',
        'Me interesa aprender a programar',
        'Los datos públicos en Chile son fáciles de encontrar',
        'Me siento cómodo/a hablando en público sobre mis resultados'
      ])
      .setColumns(escala)
      .setRequired(true);

  // ---------------------------------------------------------------- planilla de respuestas
  var ss = SpreadsheetApp.create(TITULO_PLANILLA);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // Al vincular el formulario, Google agrega una hoja nueva con las respuestas.
  // Hay que volver a abrir la planilla para "ver" esa hoja recién creada.
  ss = SpreadsheetApp.openById(ss.getId());
  var hojaRespuestas = null;
  var hojas = ss.getSheets();
  for (var i = 0; i < hojas.length; i++) {
    if (hojas[i].getFormUrl()) { hojaRespuestas = hojas[i]; }
  }

  // Borramos la hoja vacía que viene por defecto, para que la hoja de respuestas
  // quede primera y el link CSV funcione incluso sin especificar el gid.
  if (hojaRespuestas !== null) {
    for (var j = 0; j < hojas.length; j++) {
      if (hojas[j].getSheetId() !== hojaRespuestas.getSheetId() &&
          hojas[j].getLastRow() === 0) {
        ss.deleteSheet(hojas[j]);
      }
    }
  }

  // ---------------------------------------------------------------- permisos y carpeta
  var archivoForm = DriveApp.getFileById(form.getId());
  var archivoSS = DriveApp.getFileById(ss.getId());

  // La planilla debe ser legible por cualquiera con el link: sin esto, R no puede
  // leerla desde Colab (los alumnos verían un error de "página no encontrada").
  archivoSS.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  if (ID_CARPETA_DESTINO) {
    var carpeta = DriveApp.getFolderById(ID_CARPETA_DESTINO);
    archivoForm.moveTo(carpeta);
    archivoSS.moveTo(carpeta);
  }

  // ---------------------------------------------------------------- resultados
  var gid = (hojaRespuestas !== null) ? hojaRespuestas.getSheetId() : 0;
  var urlCsv = 'https://docs.google.com/spreadsheets/d/' + ss.getId() +
               '/export?format=csv&gid=' + gid;

  Logger.log('=========================================================');
  Logger.log('1) LINK PARA RESPONDER (compartir con el curso):');
  Logger.log('   ' + form.getPublishedUrl());
  Logger.log('');
  Logger.log('2) PLANILLA DE RESPUESTAS (para mirarla tú):');
  Logger.log('   ' + ss.getUrl());
  Logger.log('');
  Logger.log('3) LINK CSV — este es el que se pega en el cuaderno de Colab:');
  Logger.log('   ' + urlCsv);
  Logger.log('=========================================================');

  return urlCsv;
}
