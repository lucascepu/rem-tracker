/* Monthly downloadable REM reports.
   Add one object per REM vintage and keep the PDF chunks under reports/YYYY-MM/. */
(function(){
  const REPORTS=[
    {
      period:'2026-09',
      label:'Septiembre 2026',
      vintage:'REM sep-26',
      published:'6 oct 2026',
      desktop:{
        filename:'REM_Tracker_Septiembre_2026_PC.pdf',
        parts:[
          'reports/2026-09/pc-01.b64','reports/2026-09/pc-02.b64',
          'reports/2026-09/pc-03.b64','reports/2026-09/pc-04.b64'
        ]
      },
      mobile:{
        filename:'REM_Tracker_Septiembre_2026_MOBILE.pdf',
        parts:[
          'reports/2026-09/mobile-01.b64','reports/2026-09/mobile-02.b64',
          'reports/2026-09/mobile-03.b64','reports/2026-09/mobile-04.b64',
          'reports/2026-09/mobile-05.b64','reports/2026-09/mobile-06.b64',
          'reports/2026-09/mobile-07.b64'
        ]
      }
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
      <div class="section-sub">PDF para escritorio y lectura mobile</div>
    </div>
    <div class="note" style="margin-bottom:8px">Cada nuevo REM agrega una edición al historial. Los PDFs se generan con la misma metodología y quedan disponibles para descarga desde esta sección.</div>
    <div class="report-list" id="report-list"></div>
    <div class="report-status" id="report-status"></div>
  `;
  main.appendChild(panel);

  const list=panel.querySelector('#report-list');
  REPORTS.slice().sort((a,b)=>b.period.localeCompare(a.period)).forEach(r=>{
    const row=document.createElement('div');
    row.className='report-row';
    row.innerHTML=`
      <div>
        <div class="report-period">${r.label}</div>
        <div class="report-meta">${r.vintage} · publicado ${r.published}</div>
      </div>
      <div class="report-actions">
        <button class="report-btn" data-period="${r.period}" data-kind="desktop">Descargar PDF · PC</button>
        <button class="report-btn secondary" data-period="${r.period}" data-kind="mobile">Descargar PDF · Mobile</button>
      </div>
    `;
    list.appendChild(row);
  });

  async function downloadReport(period,kind,button){
    const report=REPORTS.find(r=>r.period===period),cfg=report?.[kind];
    if(!cfg)return;
    const status=panel.querySelector('#report-status'),old=button.textContent;
    button.disabled=true;button.textContent='Preparando…';status.textContent='Armando PDF para descarga…';
    try{
      const chunks=await Promise.all(cfg.parts.map(async p=>{
        const res=await fetch(p,{cache:'force-cache'});
        if(!res.ok)throw new Error('No se pudo leer '+p);
        return (await res.text()).trim();
      }));
      const binary=atob(chunks.join('')),bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
      const a=document.createElement('a');a.href=url;a.download=cfg.filename;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      status.textContent='PDF listo.';
    }catch(e){
      console.error(e);status.textContent='No se pudo preparar el PDF. Reintentá en unos segundos.';
    }finally{
      button.disabled=false;button.textContent=old;
    }
  }
  panel.addEventListener('click',e=>{
    const b=e.target.closest('button[data-period][data-kind]');if(!b)return;
    downloadReport(b.dataset.period,b.dataset.kind,b);
  });
})();