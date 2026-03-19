# Notas de modularizacion - Presentaciones RAG Semana 3

## Estructura final

| Deck | Slides | Foco | Notebook alineado |
|------|--------|------|-------------------|
| Modulo 1 | 8 | Corpus y documentos consultables | ml2_rag_01 |
| Modulo 2 | 11 | Chunking, embeddings y retrieval | ml2_rag_02 |
| Modulo 3 | 10 | Del retrieval a RAG clasico | ml2_rag_03 |
| Deck maestro | 18 | Vision completa (original) | - |

## Idea central de cada deck

- **Deck 1**: Antes de usar IA, entender de donde sale el conocimiento. Documentos, metadata, organizacion.
- **Deck 2**: Como encontrar bien la informacion. Chunking, representacion numerica, busqueda semantica.
- **Deck 3**: Solo despues de recuperar, responder. RAG = retrieval + contexto + generacion.

## Que viene de cada fuente

### Del deck original de RAG (18 slides)

| Slide original | Destino |
|----------------|---------|
| Por que RAG (3 columnas) | Deck 1 |
| RAG en una frase (3 pasos) | Deck 1 |
| Que es un embedding | Deck 2 |
| Espacio semantico | Deck 2 |
| Similitud coseno | Deck 2 |
| Coseno en accion | Deck 2 |
| Chunking bueno vs malo | Deck 2 |
| Que pasa al momento de la pregunta | Deck 3 |
| Del retrieval a la respuesta (prompt) | Deck 3 |
| Donde falla un RAG | Deck 3 |
| Como evaluar un RAG | Deck 3 |
| RAG en sus proyectos | Deck 3 |
| Stack de herramientas | Deck 3 (simplificado) |

### Del deck de Word2Vec

| Concepto reutilizado | Destino | Slide |
|---------------------|---------|-------|
| Texto dificil de procesar, representar numeros | Deck 2 | "De palabras a vectores" |
| Vectores capturan sentido, similares = cercanos | Deck 2 | "La intuicion detras de los embeddings" |

Se excluyo deliberadamente: CBOW, Skip-Gram, backpropagation, entropia cruzada, entrenamiento detallado de Word2Vec.

### Slides nuevas (no estaban en ninguna fuente)

- Pipeline con nodo destacado (1 por deck): vision del pipeline completo con el modulo actual resaltado.
- Nuestro corpus: grid con los 12 documentos del ejercicio.
- Estructura de un documento: metadata + contenido con ejemplo real.
- Indexacion vs consulta (simplificado): dos fases, "hoy" vs "proximo".
- Recaps al inicio de decks 2 y 3: consolidacion breve del modulo anterior.

## Que quedo fuera

| Slide original | Razon |
|----------------|-------|
| Arquitectura completa (hero slide) | Demasiado denso para principiantes; el pipeline simplificado lo reemplaza |
| Dos mundos: indexacion vs consulta (detallado) | Se simplifico en Deck 1 |
| Metadata chips (8 campos) | Se integro en "Estructura de un documento" |
| Por donde empezar (3 niveles) | Se condenso en "Herramientas y proximos pasos" |

## Principios de diseno

1. Cada deck parte con el pipeline completo, resaltando el nodo actual.
2. Una sola gran idea por deck.
3. Recapitulacion breve al inicio de cada modulo.
4. Menor densidad por slide que el deck original.
5. Estilo visual consistente (misma paleta, misma tipografia, mismo logo).
6. Optimizado para comprension, no para impresionar.
