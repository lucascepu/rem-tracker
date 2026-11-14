/* Bandas cambiarias: BCRA official business-day prices Nov-Dec 2026, then forecast based on REM Oct 2026.
   Official publication checked 2026-11-13. Model uses calendar-day geometric allocation, not official daily BCRA rate.
   May-Oct 2027 monthly CPI is a model-derived constant from Dec-2027 REM 21.9% yoy, not REM monthly medians. */
(function(){
  const main=document.querySelector('main'),nav=document.querySelector('.main-tabs');
  if(!main||!nav)return;
  const officialRaw={
    '2026-11':"02 711.06 1954.48\n03 710.60 1955.71\n04 710.15 1956.93\n05 709.69 1958.16\n11 706.98 1965.55\n12 706.52 1966.78\n13 706.07 1968.01\n16 704.72 1971.72\n17 704.27 1972.96\n18 703.82 1974.20\n19 703.37 1975.44\n20 702.92 1976.68\n24 701.12 1981.64\n25 700.68 1982.89\n26 700.23 1984.13\n27 699.78 1985.38\n30 698.44 1989.12",
    '2026-12':"01 697.94 1990.51\n02 697.44 1991.91\n03 696.94 1993.31\n04 696.44 1994.71\n09 693.94 2001.72\n10 693.45 2003.13\n11 692.95 2004.54\n14 691.46 2008.76\n15 690.96 2010.17\n16 690.47 2011.58\n17 689.97 2013.00\n18 689.48 2014.41\n21 687.99 2018.66\n22 687.50 2020.08\n23 687.51 2021.49\n24 687.52 2022.91\n28 687.53 2028.60\n29 687.54 2030.03\n30 687.55 2031.45\n31 687.56 2032.88"
  };
  const fmt=n=>Number(n).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const fixedMonth=(k,s)=>s.trim().split('\n').map(line=>{const [d,piso,techo]=line.trim().split(/\s+/);return {date:k+'-'+d,lower:Number(piso),upper:Number(techo),type:'Oficial BCRA',ipc:'IPC oficial · T−2',rate:null}});
  const official=Object.entries(officialRaw).flatMap(([k,s])=>fixedMonth(k,s));
  const rem=window.REM_HISTORY?.vintages?.['2026-10'];
  const ipc=rem?.ipcPath||{};
  const expectedAnnual=rem?.annual?.ipc_2027_yoy;
  const monthlyJanApr=[ipc['2027-01'],ipc['2027-02'],ipc['2027-03'],ipc['2027-04']];
  const tail=Number.isFinite(expectedAnnual)&&monthlyJanApr.every(Number.isFinite)
    ?Math.pow((1+expectedAnnual/100)/monthlyJanApr.reduce((p,x)=>p*(1+x/100),1),1/8)-1 :NaN;
  const assumptions={};
  ['2026-11','2026-12','2027-01','2027-02','2027-03','2027-04'].forEach(m=>assumptions[m]=ipc[m]);
  // REM Oct may store monthly Nov/Dec directly; all values are explicit and should be required.
  if(!Number.isFinite(assumptions['2026-11']))assumptions['2026-11']=1.7;
  if(!Number.isFinite(assumptions['2026-12']))assumptions['2026-12']=1.8;
  for(let m=5;m<=12;m++)assumptions['2027-'+String(m).padStart(2,'0')]=tail*100;
  let upper=2032.88,lower=687.56;
  const forecast=[],closes=[];
  for(let m=1;m<=12;m++){
    const days=new Date(2027,m,0).getDate();
    const refMonth=m-2<=0?String(m+10).padStart(2,'0'):String(m-2).padStart(2,'0');
    const refYear=m<=2?'2026':'2027',ref=refYear+'-'+refMonth;
    const rate=assumptions[ref]/100,source=m<=6?'REM oct-26':'Estimación propia';
    if(!Number.isFinite(rate))continue;
    for(let d=1;d<=days;d++){
      upper*=Math.pow(1+rate,1/days);
      lower*=Math.pow(1-rate,1/days);
      const date='2027-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      forecast.push({date,upper,lower,type:source,ipc:ref,rate});
    }
    closes.push(forecast[forecast.length-1]);
  }
  window.BANDAS_HISTORY={official,forecast,closes,assumptions,monthlyImputed:tail,updated:'2026-11-13'};
  const style=document.createElement('style');
  style.textContent='.band-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:14px 0 20px}.band-kpi{border:1px solid var(--border);background:var(--surface);border-radius:7px;padding:14px}.band-kpi-label{font-size:11px;color:var(--faint)}.band-kpi-value{font-size:22px;font-weight:650;margin-top:5px}.band-help{color:var(--muted);font-size:11px;line-height:1.8;margin-bottom:18px}.band-table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}.band-table th,.band-table td{padding:10px 11px;border-bottom:1px solid var(--border);font-size:11px;text-align:right}.band-table th:first-child,.band-table td:first-child{text-align:left}.band-table td:last-child{text-align:left}.band-table th{font-size:10px;color:var(--muted)}.band-a{color:var(--blue);text-decoration:none}.band-actions{display:flex;gap:10px;flex-wrap:wrap;margin:15px 0}.band-dl{border:1px solid var(--border2);background:var(--surface2);padding:9px 13px;color:var(--text);font:600 11px var(--font);border-radius:5px;cursor:pointer}@media(max-width:680px){.band-kpis{grid-template-columns:1fr}.band-table td,.band-table th{padding:8px 5px;font-size:10px}}';
  document.head.appendChild(style);
  const btn=document.createElement('button');btn.className='main-tab';btn.textContent='BANDAS';btn.onclick=function(){switchMain('bandas',this)};nav.appendChild(btn);
  const panel=document.createElement('section');panel.className='main-panel';panel.id='main-bandas';
  const refName={1:'Ene',2:'Feb',3:'Mar',4:'Abr',5:'May',6:'Jun',7:'Jul',8:'Ago',9:'Sep',10:'Oct',11:'Nov',12:'Dic'};
  panel.innerHTML=`
    <div class="section-head"><div><div class="kicker">BCRA · Actualizado 13/11/2026</div><div class="section-title">Bandas cambiarias y proyección REM</div></div><div class="section-sub">Oficial hasta diciembre 2026 · escenario 2027</div></div>
    <div class="band-kpis">
      <div class="band-kpi"><div class="band-kpi-label">IPC observado · octubre</div><div class="band-kpi-value">2,20%</div><div class="band-help">INDEC · 12/11/2026</div></div>
      <div class="band-kpi"><div class="band-kpi-label">Techo oficial · 31/12/2026</div><div class="band-kpi-value">$${fmt(2032.88)}</div><div class="band-help">Valor diario BCRA · no estimado</div></div>
      <div class="band-kpi"><div class="band-kpi-label">Techo simulado · 31/12/2027</div><div class="band-kpi-value">$${closes.length?fmt(closes[closes.length-1].upper):'—'}</div><div class="band-help">Modelo REM + supuestos explícitos</div></div>
    </div>
    <p class="band-help">La banda se ajusta según IPC INDEC con rezago de dos meses (T−2). Las fechas publicadas para noviembre y diciembre 2026 son valores diarios <strong>oficiales BCRA</strong>; no se recalculan. Enero–junio 2027 aplica las medianas mensuales del REM octubre. Julio–diciembre utiliza IPC mensual imputado de ${Number.isFinite(tail)?(tail*100).toFixed(4).replace('.',','):'—'}%, consistente matemáticamente con la mediana interanual REM de diciembre 2027 (21,9%). La composición de medianas no es una predicción oficial.</p>
    <div class="band-actions"><button class="band-dl" id="download-bandas">Descargar bandas diarias · CSV</button>
      <a class="band-a" href="https://www.bcra.gob.ar/regimen-de-bandas-cambiarias/" target="_blank" rel="noopener noreferrer">Valores diarios oficiales BCRA ↗</a>
      <a class="band-a" href="https://www.indec.gob.ar/uploads/informesdeprensa/ipc_11_269335F5BA6B.pdf" target="_blank" rel="noopener noreferrer">IPC octubre INDEC ↗</a>
    </div>
    <div class="section"><div class="section-head"><div><div class="section-title">Cierre de mes · bandas</div></div><div class="section-sub">ARS por USD</div></div>
      <div class="tbl-wrap"><table class="band-table"><thead><tr><th>Mes</th><th>IPC aplicado</th><th>Piso $/USD</th><th>Techo $/USD</th><th>Fuente</th></tr></thead><tbody id="band-monthly"></tbody></table></div>
    </div>
    <p class="band-help">En 2027, el ajuste se distribuye geométricamente por días calendario. El BCRA publica valores para fechas operativas: la trayectoria simulada no pretende reproducir su fórmula diaria exacta. El piso proyectado sigue la variación mensual descendente (1−IPC), partiendo del último piso oficial publicado. Con cada nuevo IPC se debe reemplazar la proyección correspondiente.</p>
  `;
  main.appendChild(panel);
  const rows=[official[official.length-1],...closes];
  panel.querySelector('#band-monthly').innerHTML=rows.map((r,i)=>{
    const mm=Number(r.date.slice(5,7)),yy=r.date.slice(0,4),source=i===0?'BCRA oficial':i<=6?'REM oct-26':'Estimación propia';
    const rt=i===0?2.2:r.rate*100;
    return '<tr><td>'+refName[mm]+' '+yy+'</td><td>'+rt.toFixed(2).replace('.',',')+'%</td><td>$'+fmt(r.lower)+'</td><td>$'+fmt(r.upper)+'</td><td>'+source+'</td></tr>';
  }).join('');
  const download=panel.querySelector('#download-bandas');
  download.addEventListener('click',()=>{
    const all=[...official,...forecast],header='Fecha;Piso ARS/USD;Techo ARS/USD;Tipo;IPC ref;IPC aplicado %';
    const body=all.map(r=>[r.date,fmt(r.lower),fmt(r.upper),r.type,r.ipc,r.rate==null?'':(r.rate*100).toFixed(6).replace('.',',')].join(';'));
    const blob=new Blob(['\uFEFF'+[header,...body].join('\r\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Bandas_BCRA_REM_oct2026_2027.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  });
})();