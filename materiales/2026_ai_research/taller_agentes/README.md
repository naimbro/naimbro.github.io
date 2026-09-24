# Taller de agentes — carpeta de práctica

Esta carpeta es tu campo de pruebas. Todo lo que hay acá es material de investigación real, no un
ejemplo de juguete: son datos publicados sobre las élites políticas chilenas del siglo XIX.

**No tengas cuidado con estos archivos.** Rómpelos, bórralos, déjaselos reescribir al agente. Hay
una copia limpia.

## La pregunta de investigación

> ¿Quiénes concentraron cargos políticos en Chile entre 1828 y 1894, y qué familias aparecen una y
> otra vez?

## Qué hay acá

```
taller_agentes/
├── datos/
│   ├── periodos_politicos.csv        1.449 personas × 88 columnas de cargos
│   └── diccionario_incompleto.md     un codebook a medio escribir
├── scripts/
│   └── contar_cargos.py              un script que corre, pero da un número equivocado
└── notas/
    └── nota_reunion.md               apuntes de reunión con tareas pendientes
```

## Los cuatro movimientos

Estos son los que practicamos hoy. En orden, porque cada uno se apoya en el anterior.

### 1. Preguntar por la carpeta

Antes de pedirle que haga algo, pídele que te diga qué hay. Prueba con esto, literal:

```
Mira los archivos de esta carpeta y explícame en cinco líneas qué contiene cada uno.
El archivo de datos tiene nombres de columna opacos: dime qué crees que significan
y en qué te basas.
```

Fíjate en lo que acaba de pasar: **leyó los archivos**. No está adivinando desde su entrenamiento,
está mirando tu disco.

### 2. Pedirle que haga algo

```
Corre scripts/contar_cargos.py y muéstrame lo que imprime.
```

Después:

```
El resultado está mal. Según este script nadie tuvo cero cargos, pero en los datos
sí hay personas sin ningún cargo registrado. Encuentra por qué y arréglalo.
Explícame el error antes de tocar el archivo.
```

**Exígele que explique antes de editar.** Es la costumbre más importante del día: si no entiendes
el diagnóstico, no aceptas la corrección.

### 3. Hacerlo verificar su propio trabajo

Esto es lo que distingue a un agente de un chatbot. No le creas: pídele la prueba.

```
¿Cómo sabes que quedó bien? Escribe una comprobación independiente que no use
el mismo código que acabas de arreglar, córrela, y muéstrame el resultado.
```

### 4. Deshacer

Revisa qué archivos cambió antes de aceptar nada. En la aplicación se ven los cambios propuestos
antes de aplicarlos; en la terminal, `/undo`. Y si la carpeta está en git:

```
git diff
git checkout -- .
```

Saber volver atrás es lo que te permite atreverte. Practícalo ahora, cuando no importa.

## Si te sobra tiempo

- Pídele que convierta `datos/periodos_politicos.csv` a formato largo (una fila por persona-cargo)
  y que te explique por qué ese formato sirve más para analizar.
- Pídele que complete `datos/diccionario_incompleto.md` a partir de lo que encuentre en los datos,
  **marcando explícitamente qué es inferencia suya y qué está confirmado**.
- Abre `notas/nota_reunion.md` y pídele que ejecute las tareas pendientes que hay ahí. Lee la nota
  tú primero.

## Una advertencia que vale para todo el curso

El agente va a sonar seguro de sí mismo siempre, incluso cuando está equivocado. Los datos son
tuyos y el paper lo firmas tú. La pregunta que te tienes que hacer en cada paso no es «¿suena
bien?», sino **«¿cómo verifico esto sin preguntarle a él?»**.

---

Datos: Bro, Naim. Redes políticas chilenas, 1828–1894.
Disponibles en <https://naimbro.github.io>.
