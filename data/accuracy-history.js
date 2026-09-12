/* Accuracy layer built on data/rem-history.js.
   Loaded after index.html's core script so it can replace the original bar chart
   without touching SIOPEL, REM path or manual-data logic. */
(function(){
  const MONTH_NAME={'01':'Ene','02':'Feb','03':'Mar','04':'Abr','05':'May','06':'Jun','07':'Jul','08':'Ago','09':'Sep','10':'Oct','11':'Nov','12':'Dic'};
  const CFG={ipc:{label:'IPC',tol:.10,unit:'p.p.'},tc:{label:'Tipo de cambio',tol:1.00,unit:'%'},tamar:{label:'TAMAR',tol:.10,unit:'p.p.'}};
  function periodLabel(period){const [y,m]=period.split('-');return `${MONTH_NAME[m]} ${y}`}
  function currentYM(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
  function realFor(variable,period){
    if(variable==='ipc') return Number(window.REM_HISTORY?.actualIpc?.[period]);
    if(variable==='tc'){
      if(period>=currentYM()) return NaN;
      const hist=(typeof fxMonthly!=='undefined')?fxMonthly:{};
      return Number(hist?.[period]?.avg);
    }
    if(variable==='tamar'){
      const app=(typeof DATA!=='undefined')?DATA:null;
      return Number(app?.tamar?.[periodLabel(period)]?.real);
    }
    return NaN;
  }
  function historyRows(variable){
    const hist=window.REM_HISTORY?.vintages||{},cfg=CFG[variable];if(!cfg)return[];
    return Object.entries(hist).sort(([a],[b])=>a.localeCompare(b)).map(([vintage,v])=>{
      const n=v?.next,period=n?.period,forecast=Number(n?.[variable]),real=period?realFor(variable,period):NaN;
      if(!period||!Number.isFinite(forecast)||!Number.isFinite(real))return null;
      const error=variable==='tc'?((real/forecast)-1)*100:(real-forecast);
      return {variable,period,label:periodLabel(period),vintage,sourceLabel:v.label,forecast,real,error,tol:cfg.tol,unit:cfg.unit,norm:error/cfg.tol};
    }).filter(Boolean);
  }
  window.accuracyObservations=function(variable){return variable==='all'?['ipc','tc','tamar'].flatMap(historyRows):historyRows(variable)};
  function fmtValue(v,variable){if(variable==='tc')return '$'+Math.round(v).toLocaleString('es-AR');return v.toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:2})+'%'}
  function fmtError(v,variable){const sign=v>0?'+':'';return sign+v.toLocaleString('es-AR',{minimumFractionDigits:variable==='tc'?1:2,maximumFractionDigits:variable==='tc'?1:2})+(variable==='tc'?'%':' p.p.')}
  function updateMetrics(rows,variable){
    const M=document.getElementById('acc-mae'),H=document.getElementById('acc-hit'),B=document.getElementById('acc-bias'),ML=document.getElementById('acc-mae-lbl'),HL=document.getElementById('acc-hit-lbl'),BL=document.getElementById('acc-bias-lbl');
    if(!rows.length){M.textContent='—';H.textContent='—';B.textContent='—';return}
    const isAll=variable==='all',hit=rows.filter(r=>Math.abs(r.error)<=r.tol+1e-9).length,hitPct=hit/rows.length*100;
    if(isAll){const mae=rows.reduce((a,r)=>a+Math.abs(r.norm),0)/rows.length,bias=rows.reduce((a,r)=>a+r.norm,0)/rows.length;M.textContent=mae.toFixed(2).replace('.',',')+'x';H.textContent=Math.round(hitPct)+'% ('+hit+'/'+rows.length+')';B.textContent=(bias>=0?'+':'')+bias.toFixed(2).replace('.',',')+'x';ML.textContent='Error normalizado medio';HL.textContent='Dentro tolerancia';BL.textContent='Sesgo normalizado'}
    else{const mae=rows.reduce((a,r)=>a+Math.abs(r.error),0)/rows.length,bias=rows.reduce((a,r)=>a+r.error,0)/rows.length,u=variable==='tc'?'%':' p.p.';M.textContent=mae.toFixed(variable==='tc'?1:2).replace('.',',')+u;H.textContent=Math.round(hitPct)+'% ('+hit+'/'+rows.length+')';B.textContent=(bias>=0?'+':'')+bias.toFixed(variable==='tc'?1:2).replace('.',',')+u;ML.textContent='MAE';HL.textContent='Dentro tolerancia';BL.textContent='Sesgo medio'}
  }
  function emptyChart(ctx,w,h,msg,sub){ctx.save();ctx.fillStyle=cssVar('--faint');ctx.textAlign='center';ctx.font='12px Inter,system-ui';ctx.fillText(msg,w/2,h/2-5);ctx.font='10px Inter,system-ui';ctx.fillText(sub,w/2,h/2+16);ctx.restore()}
  function renderDumbbell(canvas,ctx,w,h,rows,variable){
    const vals=rows.flatMap(r=>[r.forecast,r.real]),range=niceRange(vals,.10),min=range[0],max=range[1],pad={l:w<520?48:66,r:w<520?52:76,t:28,b:30},plotW=w-pad.l-pad.r,x=v=>pad.l+(v-min)/(max-min)*plotW,rowH=(h-pad.t-pad.b)/Math.max(rows.length,1);
    ctx.save();ctx.font='9.5px Inter,system-ui';ctx.fillStyle=cssVar('--faint');ctx.textAlign='center';ctx.textBaseline='top';
    for(let i=0;i<=4;i++){const v=min+(max-min)*i/4,xx=x(v);ctx.strokeStyle='rgba(255,255,255,.05)';ctx.beginPath();ctx.moveTo(xx,pad.t-5);ctx.lineTo(xx,h-pad.b);ctx.stroke();ctx.fillText(variable==='tc'?'$'+Math.round(v).toLocaleString('es-AR'):v.toFixed(1).replace('.',',')+'%',xx,h-pad.b+8)}
    rows.forEach((r,i)=>{const y=pad.t+rowH*(i+.5),xf=x(r.forecast),xr=x(r.real),inside=Math.abs(r.error)<=r.tol+1e-9;ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillStyle=cssVar('--faint');ctx.font='10px Inter,system-ui';ctx.fillText(r.label.split(' ')[0],pad.l-10,y);ctx.strokeStyle=inside?'rgba(95,159,132,.55)':'rgba(255,255,255,.20)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xf,y);ctx.lineTo(xr,y);ctx.stroke();ctx.fillStyle=cssVar('--blue');ctx.beginPath();ctx.arc(xf,y,4,0,Math.PI*2);ctx.fill();ctx.fillStyle=cssVar('--bg');ctx.strokeStyle=cssVar('--text');ctx.lineWidth=2;ctx.beginPath();ctx.arc(xr,y,4.5,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.textAlign='left';ctx.fillStyle=inside?cssVar('--green'):cssVar('--muted');ctx.font='600 9.5px Inter,system-ui';ctx.fillText(fmtError(r.error,variable),w-pad.r+10,y);addHit(canvas,xf,y,`${r.label} · ${r.sourceLabel}: ${fmtValue(r.forecast,variable)}`,cssVar('--blue'));addHit(canvas,xr,y,`${r.label} · Real: ${fmtValue(r.real,variable)} · error ${fmtError(r.error,variable)}`,cssVar('--text'))});ctx.restore();
  }
  function renderAll(canvas,ctx,w,h,rows){
    const pad={l:w<520?74:105,r:54,t:24,b:28},bound=Math.max(2,...rows.map(r=>Math.abs(r.norm)))*1.1,min=-bound,max=bound,x=v=>pad.l+(v-min)/(max-min)*(w-pad.l-pad.r),rowH=(h-pad.t-pad.b)/rows.length;
    ctx.save();const x0=x(0),xm=x(-1),xp=x(1);ctx.strokeStyle='rgba(95,159,132,.26)';ctx.setLineDash([4,4]);[xm,xp].forEach(xx=>{ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke()});ctx.setLineDash([]);ctx.strokeStyle='rgba(255,255,255,.14)';ctx.beginPath();ctx.moveTo(x0,pad.t);ctx.lineTo(x0,h-pad.b);ctx.stroke();
    rows.forEach((r,i)=>{const y=pad.t+rowH*(i+.5),xx=x(r.norm),inside=Math.abs(r.norm)<=1;ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillStyle=cssVar('--faint');ctx.font='9.5px Inter,system-ui';ctx.fillText(`${CFG[r.variable].label} ${r.label.split(' ')[0]}`,pad.l-9,y);ctx.strokeStyle='rgba(255,255,255,.14)';ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(xx,y);ctx.stroke();const col=inside?cssVar('--green'):(r.norm>0?cssVar('--red'):cssVar('--amber'));ctx.fillStyle=col;ctx.beginPath();ctx.arc(xx,y,4,0,Math.PI*2);ctx.fill();addHit(canvas,xx,y,`${CFG[r.variable].label} ${r.label}: ${r.norm>=0?'+':''}${r.norm.toFixed(2).replace('.',',')}x tolerancia`,col)});ctx.restore();
  }
  window.renderAccuracyChart=function(){
    const c=canvasSetup('chart-accuracy');if(!c)return;const{canvas,ctx,w,h}=c;enableCanvasTooltip(canvas);const variable=document.getElementById('accuracy-variable')?.value||'ipc',rows=window.accuracyObservations(variable),names={ipc:'IPC',tc:'Tipo de cambio',tamar:'TAMAR',all:'Consolidado'};
    document.getElementById('accuracy-title').textContent='Accuracy del REM · '+names[variable];document.getElementById('accuracy-sub').textContent=variable==='all'?'Error normalizado por tolerancia':'REM anterior al mes observado ●────○ Real';const note=document.getElementById('accuracy-note');
    if(variable==='tc')note.textContent='● REM previo · ○ promedio mensual SIOPEL. Septiembre entra recién cuando cierra el mes.';else if(variable==='ipc')note.textContent='● REM previo · ○ IPC INDEC real. Comparación one-step-ahead, sin mezclar vintages.';else if(variable==='tamar')note.textContent='● REM previo · ○ TAMAR mensual real. Se muestran solo meses con dato BCRA comparable.';else note.textContent='Consolidado: cada error se divide por su tolerancia. ±1,0x es el límite de acierto.';
    updateMetrics(rows,variable);if(!rows.length){emptyChart(ctx,w,h,variable==='tc'?'Cargando histórico SIOPEL…':'Sin observaciones comparables','El gráfico aparece cuando forecast y real están disponibles.');return}if(variable==='all')renderAll(canvas,ctx,w,h,rows);else renderDumbbell(canvas,ctx,w,h,rows,variable);
  };
  requestAnimationFrame(()=>window.renderAccuracyChart());
})();
