# REM Tracker — BCRA 2026

Dashboard de expectativas del mercado y seguimiento de pronósticos frente a datos observados. Sitio: https://rem-tracker.vercel.app/

## Fuente y metodología

- **REM oficial BCRA**: `data/rem-history.js` contiene vintages y medianas verificadas. No interpolar datos oficiales.
- **IPC observado**: `REM_HISTORY.actualIpc`, con valores publicados por INDEC. Septiembre 2026 = **1,9%**, publicado el 13/10/2026 (https://www.indec.gob.ar/Nivel3/Tema/3/5). Los datos nuevos se incorporan tras verificar la publicación oficial.
- **Tipo de cambio observado**: promedio simple de los registros diarios SIOPEL obtenidos de https://seguimiento-fx.vercel.app/ . **No equivale exactamente** a la serie de referencia Comunicación A 3500 del BCRA que pronostica el REM; no confundir con cierre diario ni con spot actual.
- **TAMAR observada**: pendiente de integrar una serie mensual oficial BCRA; no cargar valores manuales ni mostrar observaciones no verificadas.
- **Accuracy**: dato real del mes contra mediana de la encuesta REM inmediatamente anterior, sin redondear en los cálculos. Error IPC/TAMAR en puntos porcentuales; error TC en porcentaje.
- **Panorama**: IPC acumulado compuesto desde tasas mensuales; proyección comienza después del último mes observado. TC real sólo para meses cerrados.
- **Datos del REM**: preservar mediana, promedio, P10 y P90 como estadísticas diferentes; no mezclar vintages ni interpolar senderos.
- **Precisión**: conservar valores completos de los Excel BCRA; redondear sólo para mostrar.

## Arquitectura

- `index.html`: interfaz, Canvas y compatibilidad con datos REM.
- `data/rem-history.js`: historial REM y observaciones IPC INDEC.
- `data/accuracy-history.js`: senderos y Accuracy, y reemplazo de la antigua interfaz manual.
- `data/report-history.js`: historial de reportes y enlaces oficiales BCRA.
- `reports/`: recursos de informes propios; **la edición septiembre PC/Mobile está pendiente de publicar como archivos PDF completos**. Los botones permanecen deshabilitados hasta que estén disponibles. Los PDF/Excel oficiales BCRA sí tienen enlaces.
- `.github/workflows/validate-js.yml`: control sintáctico de JS externo e inline.

## Revisión mensual

1. Obtener el nuevo PDF y Excel de REM del sitio oficial BCRA.
2. Contrastar las medianas y percentiles con la hoja `Cuadros de resultados` del Excel.
3. Agregar vintage completo a `data/rem-history.js`, preservando valores exactos y fuente.
4. Incorporar los nuevos datos reales publicados por INDEC y BCRA.
5. Verificar senderos, distribuciones, gráficos, Accuracy y consistencia de etiquetas.
6. Publicar reportes propios PC/Mobile en PDF y vincular PDF/Excel BCRA correspondientes al vintage.
7. Validar JavaScript, funcionamiento desktop/mobile y la disponibilidad real de descargas.

Última revisión de datos IPC: **22/10/2026**. Último vintage REM publicado: **septiembre 2026** (06/10/2026).
