/* Modelo de bandas cambiarias BCRA — valores oficiales, estimaciones técnicas y proyecciones.

   METODOLOGÍA (verificada contra el Excel oficial del BCRA, ver tests/bands.check.js)
   - Desde el 1/1/2026 los límites se deslizan con el IPC mensual INDEC de dos meses antes (T-2):
     la banda del mes M usa el IPC de M-2.
   - El deslizamiento se capitaliza POR DÍA CALENDARIO (incluye fines de semana y feriados):
       banda superior(d) = banda superior(d-1) × (1 + IPC_T-2 del mes de d)^(1 / días del mes de d)
       banda inferior(d) = banda inferior(d-1) × (1 − IPC_T-2 del mes de d)^(1 / días del mes de d)
     El factor de un día depende del mes al que pertenece ese día; en el cambio de mes no hay saltos.
     Por eso el valor al último día calendario de un mes = valor al último día del mes anterior × (1 + IPC_T-2).
   - Los datos oficiales no se redondean ni se modifican: las proyecciones parten del último valor oficial publicado
     y los cálculos intermedios conservan toda la precisión; solo se redondea al mostrar.

   CLASIFICACIÓN DE CADA VALOR
   - OFICIAL: fila del Excel del BCRA (incluye fechas futuras ya publicadas por el BCRA).
   - ESTIMADO TÉCNICO: fecha sin fila oficial calculada con la regla vigente y IPC observado (ej. 31/10, sábado).
   - PROYECTADO REM: usa medianas mensuales de inflación publicadas en el REM.
   - PROYECTADO IMPLÍCITO: usa una tasa mensual derivada de la expectativa REM de inflación interanual a 12 meses;
     NO es un pronóstico mensual publicado.
   - ESCENARIO ORIGINAL: supuestos usados antes (1,7 %, 1,8 % y 1,274 % mensual), solo como referencia histórica. */
(function(root){
  'use strict';
  const MS=864e5;
  const pad=n=>String(n).padStart(2,'0');
  const toDays=iso=>Date.UTC(+iso.slice(0,4),+iso.slice(5,7)-1,+iso.slice(8,10))/MS;
  const fromDays=n=>{const d=new Date(n*MS);return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())};
  const monthOf=iso=>iso.slice(0,7);
  const dim=ym=>new Date(Date.UTC(+ym.slice(0,4),+ym.slice(5,7),0)).getUTCDate();
  const addMonths=(ym,n)=>{const t=+ym.slice(0,4)*12+(+ym.slice(5,7)-1)+n;return Math.floor(t/12)+'-'+pad(t%12+1)};
  const endOfMonth=ym=>ym+'-'+pad(dim(ym));
  const isWeekday=iso=>{const w=new Date(toDays(iso)*MS).getUTCDay();return w>0&&w<6};

  const KINDS=['ESTIMADO TÉCNICO','PROYECTADO REM','PROYECTADO IMPLÍCITO','ESCENARIO ORIGINAL'];
  const RANK={observado:0,rem:1,implicito:2,original:3};
  /* Supuestos anteriores del dashboard, conservados solo para comparar */
  const ORIGINAL_RATES={'2026-12':1.7,'2027-01':1.7,'2027-02':1.8};
  const ORIGINAL_DEFAULT=1.274;

  /* Tasa mensual implícita para los meses SIN sendero mensual REM publicado.
     Supuesto calculado: la inflación interanual esperada a 12 meses (REM) equivale a la composición de los
     12 IPC mensuales del período; con los meses publicados como dato, se reparte el resto en partes iguales. */
  function impliedRate(vintage,actualIpc){
    const n12=vintage&&vintage.next12;
    if(!n12||!Number.isFinite(n12.ipc_yoy))return null;
    const path=vintage.ipcPath||{};
    let prod=1,known=0;const missing=[];
    for(let i=11;i>=0;i--){
      const m=addMonths(n12.horizon,-i);
      const v=Number.isFinite(actualIpc[m])?actualIpc[m]:path[m];
      if(Number.isFinite(v)){prod*=1+v/100;known++}else missing.push(m);
    }
    if(!missing.length)return null;
    const g=Math.pow((1+n12.ipc_yoy/100)/prod,1/missing.length)-1;
    return{rate:g*100,months:missing,known,yoy:n12.ipc_yoy,horizon:n12.horizon,participants:n12.participants||null};
  }

  function create(opts){
    const rows=opts.rows.map(r=>({date:r[0],piso:r[1],techo:r[2]})).sort((a,b)=>a.date<b.date?-1:1);
    if(!rows.length)throw new Error('Sin datos oficiales de bandas');
    const byDate=new Map(rows.map(r=>[r.date,r]));
    const firstOff=rows[0].date,lastOff=rows[rows.length-1].date;
    const actualIpc=(opts.rem&&opts.rem.actualIpc)||{};
    const vintages=(opts.rem&&opts.rem.vintages)||{};
    const vKey=opts.vintage||Object.keys(vintages).filter(k=>vintages[k].ipcPath&&vintages[k].next12).sort().pop()||Object.keys(vintages).sort().pop();
    const vintage=vintages[vKey]||null;
    const implied=impliedRate(vintage,actualIpc);

    /* IPC aplicable a la banda del mes ym (T-2) y su origen */
    function rateFor(ym,scenario){
      const ref=addMonths(ym,-2);
      if(Number.isFinite(actualIpc[ref]))return{rate:actualIpc[ref],ref,kind:'observado'};
      if(scenario==='original')return{rate:ORIGINAL_RATES[ym]!==undefined?ORIGINAL_RATES[ym]:ORIGINAL_DEFAULT,ref,kind:'original'};
      const v=vintage&&vintage.ipcPath&&vintage.ipcPath[ref];
      if(Number.isFinite(v))return{rate:v,ref,kind:'rem'};
      if(implied)return{rate:implied.rate,ref,kind:'implicito'};
      return null;
    }

    /* Avanza día calendario por día calendario desde un ancla hasta toDate. Devuelve null si falta algún IPC. */
    function walk(anchor,toDate,scenario,collect){
      let t=anchor.techo,p=anchor.piso,rank=0;
      const a=toDays(anchor.date),b=toDays(toDate);
      for(let i=a+1;i<=b;i++){
        const iso=fromDays(i),ym=monthOf(iso),rf=rateFor(ym,scenario);
        if(!rf)return null;
        const n=dim(ym);
        t*=Math.pow(1+rf.rate/100,1/n);
        p*=Math.pow(1-rf.rate/100,1/n);
        if(RANK[rf.kind]>rank)rank=RANK[rf.kind];
        if(collect)collect.push({date:iso,techo:t,piso:p,rank});
      }
      return{techo:t,piso:p,rank};
    }

    function prevOfficial(date){
      let lo=0,hi=rows.length-1,ans=-1;
      while(lo<=hi){const m=(lo+hi)>>1;if(rows[m].date<=date){ans=m;lo=m+1}else hi=m-1}
      return ans>=0?rows[ans]:null;
    }
    function nextOfficial(date){
      for(let i=0;i<rows.length;i++)if(rows[i].date>=date)return rows[i];
      return null;
    }

    /* Valor de las bandas en una fecha cualquiera + clasificación */
    function valueAt(date,scenario){
      scenario=scenario||'rem';
      const o=byDate.get(date);
      if(o)return{date,techo:o.techo,piso:o.piso,status:'OFICIAL',official:true,anchorDate:date};
      const prev=prevOfficial(date);
      if(!prev)return null;
      if(date<lastOff){
        /* hueco dentro del período oficial: regla vigente con IPC observado; si falta IPC (ene/feb), interpolación geométrica */
        const w=walk(prev,date,'rem');
        if(w&&w.rank===0)return{date,techo:w.techo,piso:w.piso,status:KINDS[0],official:false,anchorDate:prev.date};
        const nx=nextOfficial(date),f=(toDays(date)-toDays(prev.date))/(toDays(nx.date)-toDays(prev.date));
        return{date,techo:prev.techo*Math.pow(nx.techo/prev.techo,f),piso:prev.piso*Math.pow(nx.piso/prev.piso,f),status:KINDS[0],official:false,anchorDate:prev.date};
      }
      const w=walk(prev,date,scenario);
      if(!w)return null;
      return{date,techo:w.techo,piso:w.piso,status:KINDS[w.rank],official:false,anchorDate:prev.date};
    }

    /* Proyección posterior al último dato oficial: un punto por día hábil (lunes a viernes). Los feriados futuros no
       cambian los valores de los demás días porque el cálculo es por día calendario. El primer punto es el ancla oficial. */
    function projection(scenario,endDate,opts2){
      scenario=scenario||'rem';
      const weekdaysOnly=!(opts2&&opts2.allDays);
      const last=rows[rows.length-1],out=[{date:last.date,techo:last.techo,piso:last.piso,status:'OFICIAL',anchor:true}];
      const col=[];
      walk(last,endDate,scenario,col);
      col.forEach(x=>{if(!weekdaysOnly||isWeekday(x.date))out.push({date:x.date,techo:x.techo,piso:x.piso,status:KINDS[x.rank]})});
      return out;
    }

    /* Tabla mensual: techo al último día calendario de cada mes */
    function monthly(scenario,fromYm,toYm){
      scenario=scenario||'rem';
      const out=[];
      let prev=null;
      /* valor del mes anterior para la variación */
      const pv=valueAt(endOfMonth(addMonths(fromYm,-1)),scenario);
      prev=pv?pv.techo:null;
      for(let ym=fromYm;ym<=toYm;ym=addMonths(ym,1)){
        const end=endOfMonth(ym),v=valueAt(end,scenario);
        if(!v){out.push({ym,endDate:end,techo:null});continue}
        const rf=rateFor(ym,scenario);
        const lastRueda=v.official?null:(prevOfficial(end)&&prevOfficial(end).date<=end&&end<=lastOff?prevOfficial(end):null);
        out.push({
          ym,endDate:end,techo:v.techo,piso:v.piso,status:v.status,official:v.official,
          varPct:prev!=null?(v.techo/prev-1)*100:null,
          rate:rf?rf.rate:null,ipcRef:rf?rf.ref:addMonths(ym,-2),ipcKind:rf?rf.kind:null,
          lastRueda:lastRueda?{date:lastRueda.date,techo:lastRueda.techo}:null
        });
        prev=v.techo;
      }
      return out;
    }

    /* Conciliación contra el Excel oficial: cada fila oficial se compara con la predicha desde la fila anterior */
    function reconcile(){
      let checked=0,skipped=0,maxT=0,maxP=0,worst=null;
      for(let i=1;i<rows.length;i++){
        const w=walk(rows[i-1],rows[i].date,'rem');
        if(!w||w.rank!==0){skipped++;continue}
        checked++;
        const et=Math.abs(w.techo-rows[i].techo),ep=Math.abs(w.piso-rows[i].piso);
        if(et>maxT){maxT=et;worst=rows[i].date}
        if(ep>maxP)maxP=ep;
      }
      return{checked,skipped,maxErrTecho:maxT,maxErrPiso:maxP,worstDate:worst,tolerance:0.0125};
    }

    return{rows,byDate,firstOfficial:firstOff,lastOfficial:lastOff,vintageKey:vKey,vintage,implied,
      rateFor,valueAt,projection,monthly,reconcile,helpers:{addMonths,endOfMonth,monthOf,dim,toDays,fromDays,isWeekday}};
  }

  const api={create,impliedRate,KINDS,ORIGINAL_RATES,ORIGINAL_DEFAULT};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.BandsModel=api;
})(typeof window!=='undefined'?window:globalThis);
