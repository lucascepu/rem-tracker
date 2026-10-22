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

## Bandas cambiarias (REM → Bandas cambiarias)

Archivos: `bands-history.js` (datos oficiales), `bands-model.js` (algoritmo), `bands-ui.js` (interfaz), `tests/bands.check.js` (conciliación y controles; corre en CI).

- **Fuente oficial:** Excel `serie-completa-bandas-cambiarias` del BCRA (220 filas, 02/01/2026–30/11/2026, incluye fechas futuras ya publicadas). Se guarda sin redondeos ni modificaciones.
- **Regla (verificada contra el Excel):** la banda del mes M usa el IPC INDEC de M−2 y se capitaliza por día calendario: `techo(d) = techo(d−1) × (1+IPC)^(1/días del mes)`, `piso(d) = piso(d−1) × (1−IPC)^(1/días del mes)`. Fines de semana y feriados incluidos; sin saltos en el cambio de mes. Conciliación: 180 transiciones con IPC observado, error máx. ≈ $0,01 (redondeo de la publicación). Ene/feb no se concilian (IPC nov/dic-25 no cargado).
- **Estados:** OFICIAL · ESTIMADO TÉCNICO (fecha sin fila oficial, regla vigente) · PROYECTADO REM (medianas mensuales del vintage) · PROYECTADO IMPLÍCITO (tasa derivada de la inflación interanual a 12 meses del REM; supuesto, no pronóstico publicado) · ESCENARIO ORIGINAL (1,7 %, 1,8 %, 1,274 %; solo referencia histórica).
- **Tasa implícita:** `((1 + yoy) / Π IPC conocidos)^(1/n) − 1` sobre los 12 meses terminados en `next12.horizon` (REM sep-26: 21,05 % a sep-27 → ≈1,5403 % mensual para IPC abr–sep-27, bandas jun–nov-27).
- **Actualizaciones:** nuevo IPC → agregar a `actualIpc` en `rem-history.js` (se recalculan solo los meses T−2 afectados); nuevo REM → nuevo vintage con `ipcPath` y `next12` (los anteriores se conservan; el selector aparece cuando hay más de uno); nuevo Excel BCRA → reemplazar `rows` y correr `node tests/bands.check.js`.
- **Comparación con el REM:** techo de fin de mes (último día calendario) vs TC promedio mensual REM; sin interpolar meses sin mediana publicada.
