# REM Tracker — datos históricos

## Archivos

- `rem-history.js`: base histórica de vintages REM oficiales BCRA desde dic-25 hasta ago-26.
- `accuracy-history.js`: lógica de evaluación one-step-ahead y visualización REM vs real.

## Criterio de Accuracy

Para cada mes observado se usa el REM inmediatamente anterior:

| Mes observado | Vintage utilizado |
|---|---|
| Ene-26 | REM dic-25 |
| Feb-26 | REM ene-26 |
| Mar-26 | REM feb-26 |
| Abr-26 | REM mar-26 |
| May-26 | REM abr-26 |
| Jun-26 | REM may-26 |
| Jul-26 | REM jun-26 |
| Ago-26 | REM jul-26 |
| Sep-26 | REM ago-26, una vez cerrado el mes |

### Variables

- **IPC:** mediana REM mensual vs IPC mensual oficial INDEC. Error = real − forecast, en p.p. Tolerancia: ±0,10 p.p.
- **Tipo de cambio:** mediana REM del tipo de cambio nominal promedio mensual vs promedio mensual observado SIOPEL. Error porcentual = `(real / forecast − 1) × 100`. Tolerancia: ±1,0%.
- **TAMAR:** mediana REM del promedio mensual TNA vs dato mensual comparable BCRA. Error = real − forecast, en p.p. Tolerancia: ±0,10 p.p.

## Política de datos

1. Solo se guardan valores verificados en publicaciones oficiales del BCRA.
2. Los senderos históricos no se interpolan.
3. Si un valor no fue verificado en el cuadro oficial, se deja sin cargar.
4. `next` contiene el forecast one-step-ahead usado por Accuracy.
5. `ipcPath`, `tamarPath` y `tcPath` contienen senderos mensuales adicionales cuando fueron verificados.
6. `dec26` conserva los principales anclajes de diciembre de 2026 por vintage.

## Fuentes

Cada vintage dentro de `rem-history.js` incluye la URL de la publicación oficial BCRA utilizada. Los datos reales de IPC provienen de INDEC. Los promedios de tipo de cambio se calculan a partir de la serie diaria SIOPEL mantenida en `lucascepu/SEGUIMIENTO-FX`.
