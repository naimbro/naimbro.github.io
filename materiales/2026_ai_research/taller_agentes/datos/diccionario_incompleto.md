# Diccionario de variables — INCOMPLETO

`periodos_politicos.csv`. Matriz de 1.449 personas × 88 columnas de cargo.

Cada celda es `1` si la persona ocupó ese cargo en ese periodo, y está vacía si no. Sí: vacía, no
cero. Eso ya ha causado problemas.

La primera columna, sin nombre en el encabezado, trae el nombre de la persona en formato
`Apellido1.Apellido2.Nombres`.

## Lo que está confirmado

| Prefijo | Significado |
|---|---|
| `S` | Senador propietario |
| `D` | Diputado propietario |
| `Ss` | Senador suplente |
| `Ds` | Diputado suplente |

El número de dos dígitos al final es el año de inicio del periodo legislativo: `D43` es diputado
propietario del periodo que arranca en 1843. Todos los años son del siglo XIX.

## Lo que falta — esto es trabajo pendiente

- [ ] `C28` y `C33`. Casi seguro son las convenciones constituyentes de 1828 y 1833, pero hay que
      confirmarlo contra el conteo de personas.
- [ ] `DC28`, `DCs28`, `SC91`, `DC91`. El prefijo combinado no está documentado en ninguna parte.
- [ ] Por qué `Ss` aparece recién desde 1852 y no antes. ¿No existía la figura, o no se registró?
- [ ] La lista completa de los años cubiertos y si falta alguno en la secuencia de tres años.
- [ ] Cuántas personas hay efectivamente sin ningún cargo marcado, y qué significa que estén en la
      base.

> **Nota para quien retome esto:** si le pides a un agente que complete este diccionario, exígele
> que marque cada entrada como *confirmada contra los datos* o *inferida*. Un diccionario con
> inferencias disfrazadas de hechos es peor que uno incompleto.
