/* REM September 2026 — annual 2027 medians and published 2027 monthly path.
   No extrapolation beyond official REM forecast horizons. */
(function(){
  const rem=window.REM_HISTORY?.vintages?.['2026-09'];
  if(!rem)return;
  const annual=rem.annual||{};
  const nav=document.querySelector('.main-tabs');
  const main=document.querySelector('main');
  if(!nav||!main)return;

  const style=document.createElement('style');
  style.textContent=`
    .exp-lead{font-size:12px;color:var(--muted);margin-bottom:18px;max-width:930px}
    .exp-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:22px}
    .exp-kpi{background:var(--surface);border:1px solid var(--border);padding:16px;border-radius:7px}
    .exp-kpi-label{font-size:11px;color:var(--muted)}
    .exp-kpi-value{font-size:23px;font-weight:650;letter-spacing:-.03em;margin:7px 0 3px}
    .exp-kpi-unit{font-size:10px;color:var(--faint)}
    .exp-table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
    .exp-table th{font-size:10px;font-weight:600;text-align:right;color:var(--faint);padding:10px 12px;border-bottom:1px solid var(--border2)}
    .exp-table td{font-size:12px;text-align:right;padding:11px 12px;border-bottom:1px solid var(--border);color:var(--muted)}
    .exp-table th:first-child,.exp-table td:first-child{text-align:left}
    .exp-table td:first-child{color:var(--text)}
    .exp-table td.exp-emph{color:var(--text);font-weight:600}
    .exp-table tbody tr:hover{background:rgba(255,255,255,.025)}
    .exp-note{font-size:11px;color:var(--faint);margin-top:11px;line-height:1.65}
    .exp-sources{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 6px}
    .exp-source{display:inline-block;text-decoration:none;border:1px solid var(--border2);border-radius:5px;padding:8px 11px;color:var(--blue);font-size:11px}
    .exp-source:hover{background:var(--surface2)}
    @media(max-width:760px){.exp-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.exp-kpi-value{font-size:20px}.exp-table th,.exp-table td{padding:9px 7px;font-size:10.5px}.exp-table th:first-child,.exp-table td:first-child{min-width:138px}}
    @media(max-width:380px){.exp-kpis{grid-template-columns:1fr 1fr;gap:8px}.exp-kpi{padding:11px}.exp-kpi-value{font-size:18px}}
  `;
  document.head.appendChild(style);
  const tab=document.createElement('button');
  tab.className='main-tab';tab.textContent='EXPECTATIVAS 2027';
  tab.onclick=function(){switchMain('2027',this)};
  nav.appendChild(tab);

  const num=(v,d=1)=>Number.isFinite(v)?Number(v).toLocaleString('es-AR',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
  const percent=(v,d=1)=>Number.isFinite(v)?num(v,d)+'%':'—';
  const money=(v,d=0)=>Number.isFinite(v)?'$'+num(v,d):'—';
  const yearRows=[
    ['Inflación general · dic. interanual',percent(annual.ipc_2026_yoy,2),percent(annual.ipc_2027_yoy,2),percent(annual.ipc_2028_yoy,2)],
    ['Inflación núcleo · dic. interanual',percent(annual.core_ipc_2026_yoy,2),percent(annual.core_ipc_2027_yoy,2),percent(annual.core_ipc_2028_yoy,2)],
    ['Tipo de cambio · promedio diciembre ($/USD)',money(annual.tc_dec26,2),money(annual.tc_dec27,2),'—'],
    ['TAMAR · promedio diciembre (% TNA)',percent(annual.tamar_dec26,2),percent(annual.tamar_dec27,2),'—'],
    ['PIB real · variación promedio anual',percent(annual.gdp_2026,2),percent(annual.gdp_2027,2),percent(annual.gdp_2028,2)],
    ['Exportaciones FOB · USD millones',num(annual.exports_2026,0),num(annual.exports_2027,0),'—'],
    ['Importaciones CIF · USD millones',num(annual.imports_2026,0),num(annual.imports_2027,0),'—'],
    ['Resultado primario SPNF · miles de millones ARS',num(annual.primary_2026,0),num(annual.primary_2027,0),'—'],
    ['Desocupación · cuarto trimestre',percent(annual.unemployment_2026_q4,2),percent(annual.unemployment_2027_q4,2),'—']
  ];
  const months=[['2027-01','Enero 2027'],['2027-02','Febrero 2027'],['2027-03','Marzo 2027']];
  const rows=months.map(([period,label])=>[label,percent(rem.ipcPath?.[period],2),money(rem.tcPath?.[period],2),percent(rem.tamarPath?.[period],2)]);
  const sourcePage=rem.source;
  const pdf='https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/informes/relevamiento-expectativas-mercado-2026-09.pdf';
  const xlsx='https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/informes/relevamiento-expectativas-mercado-tablas-2026-09.xlsx';

  const panel=document.createElement('section');
  panel.className='main-panel';panel.id='main-2027';
  panel.innerHTML=`
    <div class="section-head"><div><div class="kicker">Horizonte anual · REM septiembre 2026</div><div class="section-title">Expectativas 2027</div></div><div class="section-sub">Medianas · 44 participantes en el relevamiento</div></div>
    <p class="exp-lead">Pronósticos del consenso de analistas encuestados por el BCRA, publicados el 6 de octubre de 2026. Los valores de 2027 no son datos observados ni proyecciones propias del Banco Central.</p>
    <div class="exp-kpis">
      <div class="exp-kpi"><div class="exp-kpi-label">IPC · dic-27 interanual</div><div class="exp-kpi-value">${percent(annual.ipc_2027_yoy,2)}</div><div class="exp-kpi-unit">Mediana REM sep-26</div></div>
      <div class="exp-kpi"><div class="exp-kpi-label">TC · promedio dic-27</div><div class="exp-kpi-value">${money(annual.tc_dec27,2)}</div><div class="exp-kpi-unit">Pesos por dólar</div></div>
      <div class="exp-kpi"><div class="exp-kpi-label">TAMAR · dic-27</div><div class="exp-kpi-value">${percent(annual.tamar_dec27,2)}</div><div class="exp-kpi-unit">TNA promedio mensual</div></div>
      <div class="exp-kpi"><div class="exp-kpi-label">PIB real · 2027</div><div class="exp-kpi-value">${percent(annual.gdp_2027,2)}</div><div class="exp-kpi-unit">Variación promedio anual</div></div>
    </div>
    <div class="section">
      <div class="section-head"><div><div class="kicker">Comparación interanual</div><div class="section-title">Expectativas anuales 2026–2028</div></div><div class="section-sub">Mediana del mismo vintage REM</div></div>
      <div class="tbl-wrap"><table class="exp-table"><thead><tr><th>Variable</th><th>2026</th><th>2027</th><th>2028</th></tr></thead>
      <tbody>${yearRows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="exp-emph">${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>
      <div class="exp-note">— = horizonte no publicado para esa variable. Inflación: variación diciembre contra diciembre anterior. Tipo de cambio y TAMAR: promedio de diciembre, no cierre de año. PIB: variación del promedio anual. El resultado primario se expresa en miles de millones de pesos.</div>
    </div>
    <div class="section">
      <div class="section-head"><div><div class="kicker">Sendero mensual publicado</div><div class="section-title">Primer trimestre de 2027</div></div><div class="section-sub">Sin interpolación ni extrapolación</div></div>
      <div class="tbl-wrap"><table class="exp-table"><thead><tr><th>Período</th><th>IPC mensual</th><th>TC promedio ($/USD)</th><th>TAMAR TNA</th></tr></thead>
      <tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>
      <div class="exp-note">El REM de septiembre sólo publica proyecciones mensuales hasta marzo de 2027 para estas tres variables. La expectativa para diciembre de 2027 es una referencia anual independiente: no se construye una trayectoria artificial entre marzo y diciembre.</div>
    </div>
    <div class="section">
      <div class="section-head"><div><div class="kicker">Trazabilidad</div><div class="section-title">Fuentes oficiales</div></div></div>
      <div class="exp-sources">
        <a class="exp-source" href="${sourcePage}" target="_blank" rel="noopener noreferrer">Página oficial REM septiembre ↗</a>
        <a class="exp-source" href="${pdf}" target="_blank" rel="noopener noreferrer">Informe BCRA · PDF ↗</a>
        <a class="exp-source" href="${xlsx}" target="_blank" rel="noopener noreferrer">Tablas BCRA · Excel ↗</a>
      </div>
      <div class="exp-note">Fuente: BCRA, REM septiembre de 2026, hoja «Cuadros de resultados», columna «Mediana». Los valores se muestran redondeados; la fuente de datos conserva la precisión original.</div>
    </div>
  `;
  main.appendChild(panel);
})();
