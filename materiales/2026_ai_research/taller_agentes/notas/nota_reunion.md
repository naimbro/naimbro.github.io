# Reunión de avance — martes

Apuntes a mano alzada, perdón el desorden.

Revisamos el conteo de cargos. Algo no cuadra con el mínimo: el script dice que no hay nadie con
cero cargos, pero cuando abrimos el CSV a ojo encontramos filas que se ven completamente vacías.
Alguien tiene que mirar eso con calma.

La pregunta grande sigue siendo la concentración: **¿son las mismas familias las que aparecen
década tras década, o hay recambio?** Tenemos el apellido en el nombre de cada persona, así que se
puede agrupar por primer apellido sin datos adicionales. No lo hemos hecho.

Discutimos si el formato ancho nos está estorbando. Con 88 columnas de cargo, cualquier cosa que
queramos hacer por periodo se vuelve incómoda. Probablemente convenga pasarlo a formato largo
—una fila por persona-cargo-año— pero nadie quiere hacerlo a mano.

M. preguntó si los suplentes deberían contar igual que los propietarios. No lo resolvimos. Por
ahora el script los cuenta igual, lo cual es una decisión que estamos tomando sin decirlo.

## Pendientes

1. Arreglar el conteo. El mínimo de cargos no puede ser 1.
2. Agrupar por apellido y ver las diez familias con más cargos acumulados en todo el periodo.
3. Pasar los datos a formato largo.
4. Dejar escrito, en alguna parte visible, que los suplentes se están contando igual que los
   propietarios — o cambiar esa decisión.
5. Completar el diccionario de variables, sobre todo las columnas con prefijo combinado.

## Para la próxima

Traer un gráfico, aunque sea feo: cargos totales por periodo. Queremos ver si el Congreso crece o
si solo cambian los nombres.
