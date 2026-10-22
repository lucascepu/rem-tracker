/* REM → Bandas cambiarias: interfaz.
   Agrega la subsección «Bandas cambiarias» dentro de «Detalle REM» sin modificar el resto de la app:
   envuelve window.switchRem / switchMain / syncFxHistory y usa los helpers de canvas existentes.
   Datos: BANDS_HISTORY (Excel BCRA, OFICIAL) + REM_HISTORY (INDEC y REM) + BandsModel (algoritmo). El SIOPEL diario
   se lee de seguimiento-fx.vercel.app (variables hDates / hS). */
(function(){
  'use strict';
  if(!window.BandsModel||!window.BANDS_HISTORY||!window.REM_HISTORY)return;
  const tabs=document.getElementById('tabs-rem'),anchor=document.getElementById('rem-charts');
  if(!tabs||!anchor)return;

  const MODEL=window.BandsModel,H=window.BANDS_HISTORY,REM=window.REM_HISTORY;
  const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const TABLE_FROM='2026-09',TABLE_TO='2027-08',CHART_FROM='2026-06',DAILY_END='2027-08-31';
  const C={techo:'#C29B55',piso:'#8A94A0',siopel:'#5F9F84',rem:'#6B9FD1',orig:'#BD6A67'};
  const KIND_LABEL={observado:'INDEC',rem:'REM',implicito:'Implícito',original:'Supuesto original'};
  const BADGE={'OFICIAL':'b-ok','ESTIMADO TÉCNICO':'b-warn','PROYECTADO REM':'b-now','PROYECTADO IMPLÍCITO':'b-pend','ESCENARIO ORIGINAL':'b-pend'};

  /* ---------- formato ---------- */
  const nf=(v,d=2)=>Number.isFinite(v)?Number(v).toLocaleString('es-AR',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
  const money=(v,d=2)=>Number.isFinite(v)?'$'+nf(v,d):'—';
  const signed=(v,d=2,u='')=>Number.isFinite(v)?(v>=0?'+':'−')+nf(Math.abs(v),d)+u:'—';
  const sMoney=v=>Number.isFinite(v)?(v>=0?'+$':'−$')+nf(Math.abs(v),2):'—';
  const fd=iso=>iso?iso.slice(8,10)+'/'+iso.slice(5,7)+'/'+iso.slice(2,4):'—';
  const fdl=iso=>iso?iso.slice(8,10)+'/'+iso.slice(5,7)+'/'+iso.slice(0,4):'—';
  const fm=ym=>ym?MES[+ym.slice(5,7)-1]+'-'+ym.slice(2,4):'—';
  const todayISO=()=>{try{return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires'}).format(new Date())}catch{return new Date().toISOString().slice(0,10)}};
  const badge=s=>`<span class="badge ${BADGE[s]||'b-pend'}">${s}</span>`;

  /* ---------- estado ---------- */
  let scenario='rem',range='all',vintageKey=null,siopel=[],siopelMonthly={},fxFetched=false;
  const models={};
  const vintageKeys=Object.keys(REM.vintages).filter(k=>REM.vintages[k].ipcPath&&REM.vintages[k].next12).sort();
  vintageKey=vintageKeys[vintageKeys.length-1]||null;
  const model=()=>models[vintageKey]||(models[vintageKey]=MODEL.create({rows:H.rows,rem:REM,vintage:vintageKey}));

  /* ---------- SIOPEL diario (seguimiento-fx) ---------- */
  function parseFx(text){
    try{
      const dm=text.match(/var\s+hDates\s*=\s*(\[[\s\S]*?\]);/),sm=text.match(/var\s+hS\s*=\s*(\[[\s\S]*?\]);/);
      if(!dm||!sm)return false;
      const d=JSON.parse(dm[1].replace(/'/g,'"')),v=JSON.parse(sm[1]);
      const out=[],mm={};
      for(let i=0;i<Math.min(d.length,v.length);i++){
        if(!d[i]||!Number.isFinite(v[i]))continue;
        out.push([d[i],v[i]]);
        const k=d[i].slice(0,7);(mm[k]||(mm[k]={sum:0,n:0})).sum+=v[i];mm[k].n++;
      }
      if(!out.length)return false;
      siopel=out;siopelMonthly={};Object.keys(mm).forEach(k=>siopelMonthly[k]=mm[k].sum/mm[k].n);
      return true;
    }catch{return false}
  }

  /* ---------- DOM ---------- */
  const style=document.createElement('style');
  style.textContent=`
    .bnd-lead{font-size:12px;color:var(--muted);max-width:930px;margin-bottom:14px;line-height:1.6}
    .bnd-controls{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;margin-bottom:16px}
    .bnd-controls select{background:var(--surface);border:1px solid var(--border);border-radius:5px;color:var(--text);font:12px var(--font);padding:6px 9px;min-width:190px}
    .bnd-controls .field label{font-size:9.5px}
    .bnd-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:24px}
    .bnd-kpi{background:var(--surface);border:1px solid var(--border);padding:14px;border-radius:7px;min-width:0}
    .bnd-kl{font-size:10.5px;color:var(--muted)}
    .bnd-kv{font-size:21px;font-weight:650;letter-spacing:-.03em;margin:6px 0 4px;white-space:nowrap}
    .bnd-ks{font-size:10px;color:var(--faint);line-height:1.5}
    .bnd-ks .badge{margin-right:4px}
    .bnd-block{margin-bottom:26px}
    .bnd-block .tbl-wrap table{min-width:760px}
    .bnd-sub{font-size:10px;color:var(--faint);display:block;font-weight:400}
    .bnd-dash{display:inline-block;width:16px;height:0;border-top:2px dashed;margin-right:5px;vertical-align:3px}
    .bnd-det{border:1px solid var(--border);border-radius:7px;padding:12px 14px;margin-top:6px;background:var(--surface)}
    .bnd-det summary{cursor:pointer;font-size:12px;font-weight:600;color:var(--text)}
    .bnd-det h4{font-size:11px;margin:14px 0 4px;color:var(--text)}
    .bnd-det p,.bnd-det li{font-size:11px;color:var(--muted);line-height:1.65}
    .bnd-det ul{margin:4px 0 0 18px}
    .bnd-det code{font:11px ui-monospace,Menlo,monospace;color:var(--text);background:rgba(255,255,255,.04);padding:1px 5px;border-radius:3px}
    .bnd-det a{color:var(--blue);text-decoration:none}
    .bnd-warn{border-left:2px solid var(--amber);padding:6px 10px;font-size:11px;color:var(--muted);margin:10px 0 0;background:rgba(194,155,85,.05)}
    @media(max-width:980px){.bnd-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}
    @media(max-width:620px){.bnd-kpis{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.bnd-kpi{padding:11px}.bnd-kv{font-size:17px}.bnd-controls select{min-width:0;width:100%}.bnd-controls .field{flex:1 1 100%}}
  `;
  document.head.appendChild(style);

  const btn=document.createElement('button');
  btn.className='subtab';btn.textContent='Bandas cambiarias';
  btn.setAttribute('onclick',"switchRem('bands',this)");
  tabs.appendChild(btn);

  const panel=document.createElement('div');
  panel.className='subpanel';panel.id='rem-bands';
  panel.innerHTML=`
    <p class="bnd-lead">Banda cambiaria oficial del BCRA (límite superior e inferior) frente al SIOPEL y a las expectativas de tipo de cambio del REM.
      El techo se actualiza con el IPC de <strong>dos meses antes (T−2)</strong>. Los valores se muestran siempre con su estado: <em>oficial</em>, <em>estimado técnico</em> o <em>proyectado</em>. Ninguna proyección está confirmada por el BCRA.</p>
    <div class="bnd-controls">
      <div class="field"><label for="bnd-scn">ESCENARIO</label>
        <select id="bnd-scn"><option value="rem">Escenario base REM (predeterminado)</option><option value="original">Escenario original (referencia histórica)</option></select></div>
      <div class="field" id="bnd-vin-wrap" style="display:none"><label for="bnd-vin">VINTAGE REM</label><select id="bnd-vin"></select></div>
    </div>
    <div class="bnd-kpis" id="bnd-kpis"></div>
    <div class="bnd-block"><div class="chart-head"><div><div class="chart-title">Banda diaria · techo, piso y SIOPEL</div><div class="chart-sub" id="bnd-daily-sub"></div></div>
      <select id="bnd-range"><option value="all">Desde ene-26</option><option value="recent">Desde ago-26</option></select></div>
      <div class="chart-wrap" style="height:300px"><canvas id="bnd-chart-daily"></canvas></div>
      <div class="chart-legend" id="bnd-daily-leg"></div></div>
    <div class="bnd-block"><div class="chart-head"><div><div class="chart-title">Cierre mensual · techo vs. TC REM y SIOPEL</div><div class="chart-sub">techo al último día calendario del mes · TC REM = promedio mensual · SIOPEL = promedio de meses cerrados</div></div></div>
      <div class="chart-wrap" style="height:280px"><canvas id="bnd-chart-month"></canvas></div>
      <div class="chart-legend" id="bnd-month-leg"></div></div>
    <div class="bnd-block"><div class="chart-head"><div><div class="chart-title">Tabla de seguimiento mensual</div><div class="chart-sub" id="bnd-table-sub"></div></div></div>
      <div class="tbl-wrap"><table><thead><tr><th>Mes</th><th>Techo oficial o proyectado</th><th>Variación mensual</th><th>IPC utilizado</th><th>Mes de ref. del IPC</th><th>TC REM (prom. mensual)</th><th>Diferencia $</th><th>Diferencia %</th><th>Clasificación</th></tr></thead><tbody id="bnd-tbody"></tbody></table></div>
      <div class="note" id="bnd-table-note"></div></div>
    <div class="bnd-block"><div class="chart-head"><div><div class="chart-title">Comparación de escenarios · techo al cierre de mes</div><div class="chart-sub">Escenario base REM vs. escenario original (1,7 %, 1,8 % y 1,274 % mensual, solo referencia histórica)</div></div></div>
      <div class="tbl-wrap"><table><thead><tr><th>Mes</th><th>Base REM</th><th>Original</th><th>Diferencia $ (REM − original)</th><th>Diferencia %</th><th>IPC REM / original</th></tr></thead><tbody id="bnd-scn-tbody"></tbody></table></div></div>
    <div class="bnd-det"></div>`;
  anchor.insertAdjacentElement('afterend',panel);
  const $=id=>document.getElementById(id);

  /* ---------- KPIs ---------- */
  function renderKpis(m){
    const ref=siopel.length?siopel[siopel.length-1][0]:todayISO(),sp=siopel.length?siopel[siopel.length-1][1]:NaN;
    const v=m.valueAt(ref,scenario),dec=m.monthly(scenario,'2026-12','2026-12')[0];
    const dist=v&&Number.isFinite(sp)?v.techo-sp:NaN,distPct=v&&Number.isFinite(sp)?(v.techo/sp-1)*100:NaN;
    const cards=[
      ['Techo · '+fd(ref),v?money(v.techo):'—',v?badge(v.status)+(v.official?'BCRA':'calculado con la regla vigente'):''],
      ['Piso · '+fd(ref),v?money(v.piso):'—',v?badge(v.status)+(v.official?'BCRA':'calculado con la regla vigente'):''],
      ['SIOPEL observado',money(sp),Number.isFinite(sp)?'cierre '+fd(ref)+' · seguimiento-fx':'sin datos de seguimiento-fx'],
      ['Distancia al techo',sMoney(dist),Number.isFinite(distPct)?nf(distPct,2)+'% sobre el SIOPEL (cuánto debería subir para tocar el techo)':'—'],
      ['Techo proyectado · dic-26',dec?money(dec.techo):'—',dec?badge(dec.status)+'cierre 31/12/2026 · IPC '+fm(dec.ipcRef)+' '+nf(dec.rate,2)+'%':'']
    ];
    $('bnd-kpis').innerHTML=cards.map(c=>`<div class="bnd-kpi"><div class="bnd-kl">${c[0]}</div><div class="bnd-kv">${c[1]}</div><div class="bnd-ks">${c[2]}</div></div>`).join('');
  }

  /* ---------- gráficos ---------- */
  function line(ctx,pts,color,w,dash){
    const p=pts.filter(z=>Number.isFinite(z[0])&&Number.isFinite(z[1]));if(p.length<2)return;
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineJoin='round';ctx.setLineDash(dash||[]);ctx.beginPath();
    p.forEach((z,i)=>i?ctx.lineTo(z[0],z[1]):ctx.moveTo(z[0],z[1]));ctx.stroke();ctx.restore();
  }
  function legend(el,items){
    el.innerHTML=items.map(([label,color,dashed])=>`<span>${dashed?`<i class="bnd-dash" style="border-color:${color}"></i>`:`<i class="legend-line" style="background:${color}"></i>`}${label}</span>`).join('');
  }

  function renderDaily(m){
    const c=canvasSetup('bnd-chart-daily');if(!c)return;
    const {canvas,ctx,w,h}=c;enableCanvasTooltip(canvas);
    const H2=m.helpers,start=range==='recent'?'2026-08-01':'2026-01-02',end=DAILY_END;
    const t0=H2.toDays(start),t1=H2.toDays(end),pad={l:54,r:14,t:14,b:30};
    const off=m.rows.filter(r=>r.date>=start),proj=m.projection(scenario,end);
    const sio=siopel.filter(z=>z[0]>=start);
    const vals=[];off.forEach(r=>vals.push(r.techo,r.piso));proj.forEach(r=>vals.push(r.techo,r.piso));sio.forEach(z=>vals.push(z[1]));
    const [yMin,yMax]=niceRange(vals,.05);
    const X=iso=>pad.l+(w-pad.l-pad.r)*(H2.toDays(iso)-t0)/(t1-t0),Y=v=>pad.t+(yMax-v)/(yMax-yMin)*(h-pad.t-pad.b);
    /* ejes */
    ctx.save();ctx.font='10px Inter,system-ui';ctx.fillStyle=cssVar('--faint');ctx.strokeStyle='rgba(255,255,255,.07)';
    for(let i=0;i<=4;i++){const y=pad.t+(h-pad.t-pad.b)*i/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText('$'+Math.round(yMax-(yMax-yMin)*i/4).toLocaleString('es-AR'),pad.l-7,y)}
    ctx.textAlign='center';ctx.textBaseline='top';
    const step=w<520?3:(range==='recent'?1:2);let idx=0;
    for(let ym=start.slice(0,7);ym<=end.slice(0,7);ym=H2.addMonths(ym,1),idx++){
      const x=X(ym+'-01');if(x<pad.l-2)continue;
      ctx.strokeStyle='rgba(255,255,255,.04)';ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,h-pad.b);ctx.stroke();
      if(idx%step===0)ctx.fillText(fm(ym),Math.min(Math.max(x+14,pad.l+10),w-pad.r-10),h-pad.b+9);
    }
    ctx.restore();
    /* franja de la banda oficial */
    ctx.save();ctx.beginPath();off.forEach((r,i)=>i?ctx.lineTo(X(r.date),Y(r.techo)):ctx.moveTo(X(r.date),Y(r.techo)));
    for(let i=off.length-1;i>=0;i--)ctx.lineTo(X(off[i].date),Y(off[i].piso));ctx.closePath();ctx.fillStyle='rgba(194,155,85,.05)';ctx.fill();ctx.restore();
    /* proyección (discontinua) y oficial (continua) */
    line(ctx,proj.map(r=>[X(r.date),Y(r.techo)]),C.techo,1.8,[6,4]);
    line(ctx,proj.map(r=>[X(r.date),Y(r.piso)]),C.piso,1.5,[6,4]);
    line(ctx,off.map(r=>[X(r.date),Y(r.techo)]),C.techo,2.2);
    line(ctx,off.map(r=>[X(r.date),Y(r.piso)]),C.piso,2);
    line(ctx,sio.map(z=>[X(z[0]),Y(z[1])]),C.siopel,1.8);
    /* marca: último dato oficial publicado */
    const lx=X(m.lastOfficial);
    ctx.save();ctx.setLineDash([2,3]);ctx.strokeStyle='rgba(255,255,255,.28)';ctx.beginPath();ctx.moveTo(lx,pad.t);ctx.lineTo(lx,h-pad.b);ctx.stroke();ctx.setLineDash([]);
    ctx.font='9.5px Inter,system-ui';ctx.fillStyle=cssVar('--faint');ctx.textAlign=lx>w-110?'right':'left';ctx.textBaseline='top';
    ctx.fillText('último dato oficial '+fd(m.lastOfficial),lx+(lx>w-110?-5:5),pad.t+2);ctx.restore();
    /* tooltips */
    off.forEach((r,i)=>{if(i%2===0||r.date===m.lastOfficial){addHit(canvas,X(r.date),Y(r.techo),`Techo OFICIAL ${fd(r.date)}: ${money(r.techo)}`,C.techo);addHit(canvas,X(r.date),Y(r.piso),`Piso OFICIAL ${fd(r.date)}: ${money(r.piso)}`,C.piso)}});
    proj.forEach((r,i)=>{if(i>0&&i%4===0){addHit(canvas,X(r.date),Y(r.techo),`Techo ${r.status} ${fd(r.date)}: ${money(r.techo)}`,C.techo);addHit(canvas,X(r.date),Y(r.piso),`Piso ${r.status} ${fd(r.date)}: ${money(r.piso)}`,C.piso)}});
    sio.forEach(z=>addHit(canvas,X(z[0]),Y(z[1]),`SIOPEL ${fd(z[0])}: ${money(z[1])}`,C.siopel));
    legend($('bnd-daily-leg'),[['Techo oficial BCRA',C.techo],['Piso oficial BCRA',C.piso],['SIOPEL',C.siopel],['Techo proyectado',C.techo,true],['Piso proyectado',C.piso,true]]);
    $('bnd-daily-sub').textContent='continuo = oficial (Excel BCRA, incluye fechas ya publicadas hasta '+fd(m.lastOfficial)+') · discontinuo = proyectado ('+(scenario==='rem'?'escenario base REM':'escenario original')+')';
  }

  function renderMonthly(m){
    const c=canvasSetup('bnd-chart-month');if(!c)return;
    const {canvas,ctx,w,h}=c;enableCanvasTooltip(canvas);
    const rows=m.monthly(scenario,CHART_FROM,TABLE_TO),labels=rows.map(r=>fm(r.ym));
    const rem=(m.vintage&&m.vintage.tcPath)||{};
    const lastSio=siopel.length?siopel[siopel.length-1][0].slice(0,7):null;
    const sioM=rows.map(r=>lastSio&&r.ym<lastSio&&Number.isFinite(siopelMonthly[r.ym])?siopelMonthly[r.ym]:null);
    const remM=rows.map(r=>Number.isFinite(rem[r.ym])?rem[r.ym]:null);
    const vals=[];rows.forEach(r=>vals.push(r.techo));sioM.concat(remM).forEach(v=>vals.push(v));
    const [yMin,yMax]=niceRange(vals,.06),pad={l:54,r:14,t:14,b:30},xy=xyFactory(w,h,pad,labels,yMin,yMax);
    const skip=w<560?3:1;
    drawAxesCanvas(ctx,{w,h,pad,yMin,yMax,labels:labels.map((l,i)=>i%skip===0?l:''),yFmt:v=>'$'+Math.round(v).toLocaleString('es-AR')});
    /* techo: continuo mientras es oficial, discontinuo desde el primer mes no oficial */
    const firstNon=rows.findIndex(r=>!r.official),cut=firstNon<0?rows.length:firstNon;
    const pts=rows.map((r,i)=>[xy.x(i),xy.y(r.techo)]);
    drawPolyline(ctx,pts.slice(0,Math.max(cut,1)),C.techo,2.4);
    if(cut<rows.length)drawPolyline(ctx,pts.slice(Math.max(cut-1,0)),C.techo,2.2,[6,4]);
    drawPolyline(ctx,sioM.map((v,i)=>v==null?null:[xy.x(i),xy.y(v)]),C.siopel,2.2);
    drawPolyline(ctx,remM.map((v,i)=>v==null?null:[xy.x(i),xy.y(v)]),C.rem,2,[3,4]);
    rows.forEach((r,i)=>{
      addHit(canvas,xy.x(i),xy.y(r.techo),`Techo cierre ${fm(r.ym)} (${fd(r.endDate)}) · ${r.status}: ${money(r.techo)}`,C.techo);
      if(remM[i]!=null)addHit(canvas,xy.x(i),xy.y(remM[i]),`TC REM ${fm(r.ym)} (prom. mensual): ${money(remM[i])}`,C.rem);
      if(sioM[i]!=null)addHit(canvas,xy.x(i),xy.y(sioM[i]),`SIOPEL ${fm(r.ym)} (prom. mensual): ${money(sioM[i])}`,C.siopel);
    });
    legend($('bnd-month-leg'),[['Techo al cierre (oficial)',C.techo],['Techo al cierre (estimado / proyectado)',C.techo,true],['TC REM · promedio mensual',C.rem,true],['SIOPEL · promedio de meses cerrados',C.siopel]]);
  }

  /* ---------- tablas ---------- */
  const rt4=v=>Number.isFinite(v)?nf(v,4).replace(/0+$/,'').replace(/,$/,',0'):'—';
  function ipcText(r){return r.rate==null?'—':rt4(r.rate)+'% <span class="bnd-sub">'+(KIND_LABEL[r.ipcKind]||'')+'</span>'}
  function renderTable(m){
    const rem=(m.vintage&&m.vintage.tcPath)||{},rows=m.monthly(scenario,TABLE_FROM,TABLE_TO);
    $('bnd-tbody').innerHTML=rows.map(r=>{
      const t=rem[r.ym],dif=Number.isFinite(t)?r.techo-t:NaN,difP=Number.isFinite(t)?(r.techo/t-1)*100:NaN;
      const note=r.lastRueda?`<span class="bnd-sub">última rueda oficial ${fd(r.lastRueda.date)}: ${money(r.lastRueda.techo)}</span>`:'';
      return `<tr><td class="hi">${fm(r.ym)}<span class="bnd-sub">cierre ${fd(r.endDate)}</span></td>
        <td class="hi">${money(r.techo)}${note}</td><td>${signed(r.varPct,2,'%')}</td><td>${ipcText(r)}</td><td>${fm(r.ipcRef)}</td>
        <td>${Number.isFinite(t)?money(t):'<span class="nd">sin dato REM</span>'}</td><td>${sMoney(dif)}</td><td>${signed(difP,2,'%')}</td><td>${badge(r.status)}</td></tr>`}).join('');
    $('bnd-table-sub').textContent='techo al último día calendario de cada mes · '+(scenario==='rem'?'escenario base REM':'escenario original')+' · '+(m.vintage?m.vintage.label:'');
    $('bnd-table-note').innerHTML='<strong>Atención:</strong> se contrasta un <strong>techo de fin de mes</strong> con un <strong>tipo de cambio promedio mensual</strong> del REM; no son magnitudes equivalentes, por lo que el TC promedio queda naturalmente por debajo del techo de cierre. Meses sin mediana mensual publicada en el REM no se interpolan. El «fin de mes» es la fecha calendario; cuando no hay fila oficial para esa fecha se indica la última rueda publicada por el BCRA.';
    const a=m.monthly('rem','2026-12','2027-08'),b=m.monthly('original','2026-12','2027-08');
    $('bnd-scn-tbody').innerHTML=a.map((r,i)=>{
      const o=b[i],d=r.techo-o.techo,p=(r.techo/o.techo-1)*100;
      return `<tr><td class="hi">${fm(r.ym)}</td><td>${money(r.techo)}<span class="bnd-sub">${r.status}</span></td><td>${money(o.techo)}<span class="bnd-sub">${o.status}</span></td>
        <td class="${Math.abs(d)<0.005?'':'hi'}">${sMoney(d)}</td><td>${signed(p,2,'%')}</td><td>${rt4(r.rate)}% / ${rt4(o.rate)}%</td></tr>`}).join('');
  }

  /* ---------- método y fuentes ---------- */
  function renderDetails(m){
    const imp=m.implied,v=m.vintage,s=H.meta.source,today=fdl(todayISO());
    const impTxt=imp?`${nf(imp.rate,4)} % mensual (${imp.months.map(fm).join(', ')})`:'no disponible';
    const wrap=panel.querySelector('.bnd-det');
    wrap.innerHTML=`<details><summary>Metodología, fuentes y supuestos</summary>
      <h4>Algoritmo (verificado contra el Excel del BCRA)</h4>
      <ul>
        <li>La banda del mes <em>M</em> se desliza con el IPC mensual INDEC de <em>M−2</em> (octubre usa agosto; noviembre, septiembre; diciembre, octubre…).</li>
        <li>Se capitaliza por <strong>día calendario</strong> (incluye fines de semana y feriados): <code>techo(d) = techo(d−1) × (1 + IPC)^(1/días del mes)</code>; <code>piso(d) = piso(d−1) × (1 − IPC)^(1/días del mes)</code>. Por eso el techo al último día de un mes es el del mes anterior × (1 + IPC T−2), sin saltos en el cambio de mes.</li>
        <li>Conciliación: el modelo reproduce las ${m.reconcile().checked} transiciones diarias del Excel oficial con IPC T−2 observado (error máximo de techo ${nf(m.reconcile().maxErrTecho,4)} $ y de piso ${nf(m.reconcile().maxErrPiso,4)} $, por el redondeo a 2 decimales de la publicación). Enero y febrero no se concilian porque dependen del IPC de nov/dic-25, que no está cargado.</li>
        <li>Los datos oficiales no se redondean ni se modifican; las proyecciones parten del último valor oficial publicado (${fdl(m.lastOfficial)}) y solo se redondea al mostrar.</li>
      </ul>
      <h4>Estados de los datos</h4>
      <ul>
        <li>${badge('OFICIAL')} fila del Excel del BCRA (incluye fechas futuras ya publicadas).</li>
        <li>${badge('ESTIMADO TÉCNICO')} fecha sin fila oficial calculada con la regla vigente (por ejemplo, un sábado o fin de mes posterior a la última rueda). No es dato oficial.</li>
        <li>${badge('PROYECTADO REM')} usa las medianas mensuales de inflación del ${v?v.label:'REM'}.</li>
        <li>${badge('PROYECTADO IMPLÍCITO')} usa una tasa mensual derivada de la expectativa de inflación interanual a 12 meses; <strong>no es un pronóstico mensual publicado</strong>.</li>
      </ul>
      <h4>Supuesto de tasa implícita</h4>
      <p>${imp?`Se asume que la inflación interanual esperada a ${fm(imp.horizon)} (${nf(imp.yoy,2)} %, mediana REM, ${imp.participants||'n/d'} participantes) es la composición de los 12 IPC mensuales terminados en ese mes. Con los ${imp.known} meses con dato observado o REM, la tasa que cierra el resultado es <strong>${impTxt}</strong>, aplicada de forma uniforme. Se usa desde el IPC de ${fm(imp.months[0])} (banda de ${fm(m.helpers.addMonths(imp.months[0],2))}) en adelante.`:'No hay dato de inflación interanual a 12 meses en este vintage.'}</p>
      <h4>Fuentes</h4>
      <ul>
        <li>Bandas: <a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name} ↗</a> · <a href="${s.page}" target="_blank" rel="noopener noreferrer">página del régimen ↗</a> · archivo cargado el ${fdl(H.meta.retrievedAt)} (${H.rows.length} filas, ${fdl(H.meta.firstDate)} a ${fdl(H.meta.lastDate)}).</li>
        <li>IPC observado: INDEC (variación mensual nacional), último dato ${fm(Object.keys(REM.actualIpc).sort().pop())}.</li>
        <li>IPC y TC esperados: ${v?`<a href="${v.source}" target="_blank" rel="noopener noreferrer">${v.label} (BCRA) ↗</a>, publicado el ${fdl(v.published)}`:'—'}.</li>
        <li>SIOPEL: serie diaria de <a href="https://seguimiento-fx.vercel.app/" target="_blank" rel="noopener noreferrer">seguimiento-fx.vercel.app ↗</a>${siopel.length?`, último dato ${fdl(siopel[siopel.length-1][0])}`:' (sin conexión)'}.</li>
      </ul>
      <p class="bnd-warn">Proyección calculada el ${today} con ${v?v.label:'—'} y el escenario «${scenario==='rem'?'base REM':'original'}». Se recalcula al cambiar el IPC observado o al incorporar un nuevo vintage del REM (los vintages anteriores se conservan). Las proyecciones son cálculos propios y <strong>no están confirmadas por el Banco Central</strong>.</p>
    </details>`;
  }

  /* ---------- render ---------- */
  function render(){
    if(!panel.classList.contains('active'))return;
    try{
      const m=model();
      renderKpis(m);renderDaily(m);renderMonthly(m);renderTable(m);renderDetails(m);
    }catch(e){console.error('Bandas cambiarias',e);panel.insertAdjacentHTML('afterbegin','<p class="bnd-warn">No se pudo calcular el módulo de bandas: '+String(e.message||e)+'</p>')}
  }
  /* los canvas necesitan que el panel sea visible */
  const renderSoon=()=>requestAnimationFrame(render);

  $('bnd-scn').addEventListener('change',e=>{scenario=e.target.value;render()});
  $('bnd-range').addEventListener('change',e=>{range=e.target.value;render()});
  if(vintageKeys.length>1){
    $('bnd-vin-wrap').style.display='';
    $('bnd-vin').innerHTML=vintageKeys.slice().reverse().map(k=>`<option value="${k}">${REM.vintages[k].label}</option>`).join('');
    $('bnd-vin').addEventListener('change',e=>{vintageKey=e.target.value;render()});
  }
  let rsz=null;window.addEventListener('resize',()=>{clearTimeout(rsz);rsz=setTimeout(render,140)});

  /* ---------- integración con la app existente (sin modificar sus funciones) ---------- */
  const origRem=window.switchRem;
  window.switchRem=function(key,b){
    if(typeof origRem==='function')origRem.apply(this,arguments);
    if(key==='bands'){panel.classList.add('active');renderSoon()}else panel.classList.remove('active');
  };
  const origMain=window.switchMain;
  window.switchMain=function(key){
    if(typeof origMain==='function')origMain.apply(this,arguments);
    if(key==='rem'&&panel.classList.contains('active'))renderSoon();
  };
  const origSync=window.syncFxHistory;
  window.syncFxHistory=function(text){
    try{if(parseFx(text)){fxFetched=true;renderSoon()}}catch{}
    return typeof origSync==='function'?origSync.apply(this,arguments):undefined;
  };
  /* si la app ya consultó seguimiento-fx antes de cargar este módulo, se consulta una vez más */
  setTimeout(async()=>{
    if(fxFetched)return;
    try{
      const r=await (typeof fetchWithTimeout==='function'?fetchWithTimeout('https://seguimiento-fx.vercel.app/',6000):fetch('https://seguimiento-fx.vercel.app/'));
      if(parseFx(await r.text())){fxFetched=true;renderSoon()}
    }catch{}
  },5000);
})();
