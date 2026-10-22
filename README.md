# REM Tracker — BCRA 2026

Dashboard de expectativas del mercado y seguimiento de pronósticos frente a datos observados. Sitio: https://rem-tracker.vercel.app/

## Fuente y metodología

- **REM oficial BCRA**: `data/rem-history.js` contiene vintages y medianas verificadas. No interpolar datos oficiales.
- **IPC observado**: `REM_HISTORY.actualIpc`, con valores publicados por INDEC. Septiembre 2026 = **1,9%**, publicado el 13/10/2026 (https://www.indec.gob.ar/Nivel3/Tema/3/5). Los datos nuevos se incorporan tras verificar la publicación oficial.
- **Tipo de cambio observado**: promedio simple de los registros diarios SIOPEL obtenidos de https://seguimiento-fx.vercel.app/ . Se mantiene como **proxy operativo** de la serie A3500 del BCRA: ambos reflejan el mercado mayorista, pero no son matemáticamente idénticos. No se presenta el proxy como la serie oficial A3500 ni se lo confunde con el cierre diario o el spot intrames.
- **TAMAR observada**: pendiente de integrar una serie mensual oficial BCRA; no cargar valores manuales ni mostrar observaciones no verificadas.
- **Accuracy**: dato real del mes contra mediana de la encuesta REM inmediatamente anterior, sin redondear en los cálculos. Error IPC/TAMAR en puntos porcentuales; error TC en porcentaje.
- **Panorama**: IPC acumulado compuesto desde tasas mensuales; proyección comienza después del último mes observado. TC real sólo para meses cerrados.
- **Datos del REM**: preservar mediana, promedio, P10 y P90 como estadísticas diferentes; no mezclar vintages ni interpolar senderos.
- **Precisión**: conservar valores completos de los Excel BCRA; redondear sólo para mostrar.

## Arquitectura

- `index.html`: interfaz, Canvas y compatibilidad con datos REM.
- `data/rem-history.js`: historial REM y observaciones IPC INDEC.
- `data/accuracy-history.js`: senderos y Accuracy, y reemplazo de la antigua interfaz manual.
- `data/report-history.js`: historial de reportes y enlaces directos a PDF/Excel y publicaciones oficiales BCRA.
- `data/expectations-2027.js`: pestaña 2027 con medianas anuales 2026–2028 y senderos mensuales publicados para enero–marzo 2027; lee las cifras desde `REM_HISTORY.vintages['2026-09']`.
- `reports/`: recursos de informes propios; **la edición septiembre PC/Mobile está pendiente de publicar como archivos PDF completos**. Los botones permanecen deshabilitados hasta que estén disponibles. Los PDF/Excel oficiales BCRA sí tienen enlaces.
- `.github/workflows/validate-js.yml`: control sintáctico de JS externo e inline.

## Expectativas 2027

Los datos del REM septiembre 2026 se toman de la hoja **Cuadros de resultados**, columna **Mediana**. Las referencias de diciembre 2027 (TC, TAMAR e IPC interanual) no implican que exista un sendero mensual publicado para todo el año. Sólo se muestran enero–marzo 2027 como meses con estimaciones oficiales. No extrapolar ni interpolar abril–noviembre.

En `REPORTES`, cada edición ofrece el PDF oficial BCRA, el Excel oficial y el enlace a su publicación. Los PDFs propios de PC/Mobile siguen deshabilitados mientras no se encuentren íntegramente publicados y validados.

## Revisión mensual

1. Obtener el nuevo PDF y Excel de REM del sitio oficial BCRA.
2. Contrastar las medianas y percentiles con la hoja `Cuadros de resultados` del Excel.
3. Agregar vintage completo a `data/rem-history.js`, preservando valores exactos y fuente.
4. Incorporar los nuevos datos reales publicados por INDEC y BCRA.
5. Verificar senderos, distribuciones, gráficos, Accuracy y consistencia de etiquetas.
6. Publicar reportes propios PC/Mobile en PDF y vincular PDF/Excel BCRA correspondientes al vintage.
7. Validar JavaScript, funcionamiento desktop/mobile y la disponibilidad real de descargas.

Última revisión de datos IPC: **22/10/2026**. Último vintage REM publicado: **septiembre 2026** (06/10/2026).


## Bandas BCRA — API JSON pública compartida (única fuente)

**URL canónica para Seguimiento FX y otros consumidores:**
https://rem-tracker.vercel.app/data/bandas-bcra.json

Respaldo público del mismo archivo versionado en `main`:
https://raw.githubusercontent.com/lucascepu/rem-tracker/main/data/bandas-bcra.json

Estos dos enlaces son representaciones del **mismo archivo** de REM Tracker. No representan dos proveedores distintos. Consumir normalmente la URL de Vercel; la de GitHub es alternativa sólo si falla el hosting.

**Origen autoritativo:** `data/bands-history.js` (BCRA) + `data/rem-history.js` (INDEC y vintages REM) + `data/bands-model.js` (cálculo). `data/bandas-bcra.json` es la salida generada, **no se debe editar manualmente**.

**Estructura del JSON (`schema_version: 1.0.0`):**
- `official_daily`: todos los registros publicados por el BCRA con `date`, `piso`, `techo`, `status: "OFICIAL"`.
- `projected_daily`: proyecciones desde el día posterior al último día oficial hasta agosto de 2027, sólo lunes a viernes. Sus estados distinguen `PROYECTADO REM` de `PROYECTADO IMPLÍCITO`. **No son cotizaciones del BCRA**.
- `monthly_ceiling`: fin de mes calendario (`date`), banda superior e inferior, inflación aplicada y mes del IPC T−2, estado y tipo de fuente. Oct-26 31/10 es `ESTIMADO TÉCNICO`, mientras que 30/10 existe en `official_daily`.
- `original_scenario_monthly`: escenario de sensibilidad histórico; no usar como base predeterminada.
- `rem_vintages`: senderos IPC/TC y metadatos de los relevamientos guardados.
- `ipc_observed`: tasas INDEC mensuales verificadas.
- `sources`, `assumptions`, `implied_inflation`, `counts`: trazabilidad, metodología y fecha del último archivo BCRA almacenado.

**Para generar o auditar:**
```bash
node tests/bands.check.js
node scripts/build-bands-feed.js
```

El workflow `.github/workflows/build-bands-feed.yml` se ejecuta al cambiar fuentes/modelo en `main`, verifica los cálculos, regenera el JSON y hace commit sólo cuando cambia el contenido. También admite ejecución manual desde GitHub Actions. Vercel publica la versión resultante por integración con GitHub.

**Contrato con Seguimiento FX:**
1. Leer `bandas-bcra.json` por HTTPS, validar `schema_version`, `status`, `date` y `source_of_truth`.
2. Usar `official_daily` únicamente para pisos/techos publicados; **no reclasificar** `projected_daily` como oficial.
3. Mostrar la diferencia frente a SIOPEL que obtiene Seguimiento FX de su propia serie, sin modificar el feed.
4. No descargar de nuevo el Excel BCRA, ni calcular IPC T−2, ni mantener una segunda tabla de bandas en Seguimiento FX.
5. Si falla la red, utilizar una última copia válida con indicación visible de fecha/estado; **no recalcular bandas localmente**. Si no hay copia, indicar dato no disponible.
6. Recordar que el REM TC mide un **promedio mensual** y los límites BCRA son valores **diarios** o **de fin de mes**.

**Nota:** `date_of_snapshot` procede de la fecha de descarga del Excel BCRA; una actualización de REM o IPC puede recalcular las proyecciones sin alterar ese campo. `historical_official_end` indica el último registro BCRA almacenado, incluso cuando corresponde a fecha futura publicada.

