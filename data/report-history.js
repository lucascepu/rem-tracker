/* Monthly downloadable REM reports.
   Add one object per REM vintage and keep the PDF chunks under reports/YYYY-MM/. */
(function(){
  const REPORTS=[
    {
      period:'2026-09',
      label:'Septiembre 2026',
      vintage:'REM sep-26',
      published:'6 oct 2026',
      sourcePage:'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-septiembre-de-2026/',
      officialPdf:'https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/informes/relevamiento-expectativas-mercado-2026-09.pdf',
      officialExcel:'https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/informes/relevamiento-expectativas-mercado-tablas-2026-09.xlsx',
      customReady:true,
      desktop:{
        filename:'REM_Tracker_Septiembre_2026_PC.pdf',
        path:'reports/2026-09/REM_Tracker_Septiembre_2026_PC.pdf'
      },
      mobile:{
        filename:'REM_Tracker_Septiembre_2026_MOBILE.pdf',
        path:'reports/2026-09/REM_Tracker_Septiembre_2026_MOBILE.pdf'
      }
    }
    ,{
      period:'2026-08',
      label:'Agosto 2026',
      vintage:'REM ago-26',
      published:'4 sep 2026',
      sourcePage:'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-agosto-de-2026/',
      officialPdf:'https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/informes/relevamiento-expectativas-mercado-2026-08.pdf',
      officialExcel:'https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/informes/relevamiento-expectativas-mercado-tablas-2026-08.xlsx',
      customReady:false
    }
  ];
  window.REM_REPORTS=REPORTS;

  const style=document.createElement('style');
  style.textContent=`
    .report-list{border-top:1px solid var(--border);margin-top:8px}
    .report-row{display:grid;grid-template-columns:minmax(190px,1fr) auto;gap:20px;align-items:center;padding:16px 0;border-bottom:1px solid var(--border)}
    .report-period{font-size:13px;font-weight:600;color:var(--text)}
    .report-meta{font-size:10.5px;color:var(--faint);margin-top:3px}
    .report-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    .report-btn{appearance:none;border:1px solid rgba(107,159,209,.34);background:rgba(107,159,209,.09);color:var(--text);border-radius:5px;font:600 11px var(--font);padding:7px 10px;cursor:pointer}
    .report-btn:hover{background:rgba(107,159,209,.14)}
    .report-btn[disabled]{opacity:.45;cursor:not-allowed}.report-actions a.report-btn{text-decoration:none;display:inline-flex;align-items:center}
    .report-btn.secondary{border-color:var(--border);background:none;color:var(--muted)}
    .report-status{font-size:10px;color:var(--faint);margin-top:7px;min-height:15px}
    @media(max-width:600px){.report-row{grid-template-columns:1fr;gap:10px}.report-actions{justify-content:flex-start}.report-btn{flex:1 1 145px}}
  `;
  document.head.appendChild(style);

  const nav=document.querySelector('.main-tabs');
  const main=document.querySelector('main');
  if(!nav||!main)return;

  const btn=document.createElement('button');
  btn.className='main-tab';
  btn.textContent='REPORTES';
  btn.onclick=function(){switchMain('reports',this)};
  nav.appendChild(btn);

  const panel=document.createElement('section');
  panel.className='main-panel';
  panel.id='main-reports';
  panel.innerHTML=`
    <div class="section-head">
      <div><div class="kicker">Publicaciones mensuales</div><div class="section-title">Reportes REM</div></div>
      <div class="section-sub">Informes del equipo y fuentes oficiales</div>
    </div>
    <div class="note" style="margin-bottom:8px">Documentación <strong>oficial del BCRA</strong> disponible por relevamiento: informe PDF, planilla Excel y publicación original. Los informes elaborados por REM Tracker (PC y Mobile) son documentos independientes y se habilitan únicamente cuando sus archivos están completos; septiembre ya está publicado. <a href="https://www.bcra.gob.ar/todos-relevamiento-de-expectativas-de-mercado-rem/" target="_blank" rel="noopener noreferrer" style="color:var(--blue)">Archivo histórico completo del BCRA ↗</a></div>
    <div class="report-list" id="report-list"></div>
    <div class="report-status" id="report-status"></div>
    <div class="section-head" style="margin-top:28px">
      <div><div class="kicker">Datos observados · INDEC</div><div class="section-title">Informes oficiales del IPC</div></div>
      <div class="section-sub">Publicaciones originales y valores observados</div>
    </div>
    <div class="note" style="margin-bottom:8px">Informes del IPC nacional publicados por INDEC. Se archiva el enlace oficial y sus principales indicadores en el historial de datos; no son estimaciones del REM.</div>
    <div class="report-list" id="indec-report-list"></div>
  `;
  main.appendChild(panel);

  const list=panel.querySelector('#report-list');
  REPORTS.slice().sort((a,b)=>b.period.localeCompare(a.period)).forEach(r=>{
    const row=document.createElement('div');
    row.className='report-row';
    row.innerHTML=`
      <div>
        <div class="report-period">${r.label}</div>
        <div class="report-meta">${r.vintage} · publicado ${r.published} · fuente primaria BCRA</div>
      </div>
      <div class="report-actions">
        ${r.desktop&&r.customReady?`<a class="report-btn" href="${r.desktop.path}" download="${r.desktop.filename}">Descargar PDF · PC ↓</a>`:`<button class="report-btn" disabled>PDF PC · pendiente</button>`}
        ${r.mobile&&r.customReady?`<a class="report-btn secondary" href="${r.mobile.path}" download="${r.mobile.filename}">Descargar PDF · Mobile ↓</a>`:`<button class="report-btn secondary" disabled>PDF Mobile · pendiente</button>`}
        <a class="report-btn secondary" href="${r.officialPdf}" target="_blank" rel="noopener noreferrer">OFICIAL · PDF ↗</a>
        <a class="report-btn secondary" href="${r.officialExcel}" target="_blank" rel="noopener noreferrer">OFICIAL · Excel ↗</a>
        <a class="report-btn secondary" href="${r.sourcePage}" target="_blank" rel="noopener noreferrer">Publicación BCRA ↗</a>
      </div>
    `;
    list.appendChild(row);
  });

  const indecList=panel.querySelector('#indec-report-list');
  const actualIpc=window.REM_HISTORY?.actualIpc||{};
  const indecSources=window.REM_HISTORY?.actualIpcSources||{};
  const formatPct=value=>Number(value).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
  Object.entries(indecSources).filter(([,source])=>source?.url&&source?.status==='official')
    .sort(([a],[b])=>b.localeCompare(a))
    .forEach(([period,source])=>{
      const row=document.createElement('div');
      row.className='report-row';
      const [year,month]=period.split('-').map(Number);
      const label=new Date(Date.UTC(year,month-1,1)).toLocaleDateString('es-AR',{month:'long',year:'numeric',timeZone:'UTC'});
      const reported=Number(actualIpc[period]);
      row.innerHTML=`
        <div>
          <div class="report-period">IPC · ${label.charAt(0).toUpperCase()+label.slice(1)}</div>
          <div class="report-meta">INDEC · publicado ${source.published.split('-').reverse().join('/')} · mensual ${formatPct(reported)} · acumulado ${formatPct(source.yearToDate)} · interanual ${formatPct(source.yearOverYear)}</div>
        </div>
        <div class="report-actions">
          <a class="report-btn secondary" href="${source.url}" target="_blank" rel="noopener noreferrer">INDEC · PDF oficial ↗</a>
          <a class="report-btn secondary" href="${source.sourcePage}" target="_blank" rel="noopener noreferrer">Portal INDEC ↗</a>
        </div>`;
      indecList.appendChild(row);
    });

})();
