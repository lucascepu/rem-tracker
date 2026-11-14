/* Controles del módulo de bandas cambiarias. Ejecutar: node tests/bands.check.js
   Verifica (1) los datos oficiales del BCRA, (2) que el modelo reproduce el Excel oficial y
   (3) las proyecciones contra los valores de control. Falla con código 1 ante cualquier desvío. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const sb={window:{}};vm.createContext(sb);
['data/rem-history.js','data/bands-history.js'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),sb,{filename:f}));
const {create,impliedRate,KINDS}=require(path.join(root,'data/bands-model.js'));
const H=sb.window.BANDS_HISTORY,REM=sb.window.REM_HISTORY;
const near=(a,b,tol,label)=>{assert.ok(Math.abs(a-b)<=tol,`${label}: ${a} vs ${b} (tol ${tol})`);return `${label}: ${a.toFixed(4)} ✓`};
const out=[];
const m=create({rows:H.rows,rem:REM});

/* 1) valores oficiales de control (Excel BCRA) */
[['2026-09-30',1919.40],['2026-10-22',1942.50],['2026-10-30',1950.97],['2026-11-30',1989.12]].forEach(([d,v])=>{
  const x=m.valueAt(d,'rem');assert.equal(x.status,'OFICIAL');assert.equal(x.techo,v,'oficial '+d);out.push(`oficial ${d} = ${v} ✓`)});
assert.equal(H.rows.length,220);assert.equal(H.meta.lastDate,'2026-11-30');
H.rows.forEach(r=>assert.ok(r[1]<r[2],'piso < techo '+r[0]));

/* 2) el modelo reproduce el Excel oficial */
const rec=m.reconcile();
assert.ok(rec.checked>=170,'pares verificados '+rec.checked);
assert.ok(rec.maxErrTecho<=rec.tolerance&&rec.maxErrPiso<=rec.tolerance,`error máx. techo ${rec.maxErrTecho} piso ${rec.maxErrPiso}`);
out.push(`conciliación: ${rec.checked} transiciones, error máx. techo ${rec.maxErrTecho.toFixed(4)} / piso ${rec.maxErrPiso.toFixed(4)} (tol. ${rec.tolerance}), omitidas ${rec.skipped} (sin IPC T-2 observado: ene/feb)`);

/* 3) tasa implícita */
const imp=impliedRate(REM.vintages['2026-09'],REM.actualIpc);
out.push(near(imp.rate,1.4573049056,0.000001,'tasa implícita sep-26 con IPC oct-26 real (% mensual)'));
assert.equal(REM.actualIpc['2026-10'],2.2,'IPC INDEC oct-26 observado');
assert.equal(imp.months.length,6);assert.equal(imp.months[0],'2027-04');

/* 3b) tasa implícita del REM oct-26 (XLSX oficial: próx. 12 meses oct-27 = 21,8 %; 6 meses publicados nov-26 a abr-27) */
const imp10=impliedRate(REM.vintages['2026-10'],REM.actualIpc);
out.push(near(imp10.rate,1.614078,0.00001,'tasa implícita REM oct-26 (% mensual)'));
assert.equal(imp10.months.length,6);assert.equal(imp10.months[0],'2027-05');assert.equal(imp10.horizon,'2027-10');
assert.equal(REM.vintages['2026-10'].precision,'official_xlsx');
assert.equal(REM.vintages['2026-10'].ipcPath['2026-12'],1.84);

/* 4) fin de mes calendario vs última rueda */
const tab=m.monthly('rem','2026-06','2027-12'),by=Object.fromEntries(tab.map(x=>[x.ym,x]));
assert.equal(m.vintageKey,'2026-10');
assert.equal(by['2026-10'].status,'ESTIMADO TÉCNICO');assert.equal(by['2026-10'].lastRueda.date,'2026-10-30');assert.equal(by['2026-10'].lastRueda.techo,1950.97);
out.push(near(by['2026-10'].techo,1952.03,0.01,'techo 31/10 (estimado técnico)'));
assert.equal(by['2026-11'].status,'OFICIAL');assert.equal(by['2026-09'].status,'OFICIAL');

/* 5) proyección REM oct-26 con IPC octubre REAL 2,2 % y medianas posteriores del XLSX. 
   No comparar contra el escenario anterior de 1,8 % para octubre. */
[['2026-12',2032.88064],['2027-01',2067.43961],['2027-02',2105.48050],['2027-03',2141.27367],['2027-04',2175.53405],
 ['2027-05',2212.51813],['2027-06',2249.24037],['2027-07',2285.54488],['2027-08',2322.43537],
 ['2027-09',2359.92130],['2027-10',2398.01228],['2027-11',2436.71808],['2027-12',2476.04862]].forEach(([k,v])=>out.push(near(by[k].techo,v,0.01,'techo fin de '+k)));
assert.equal(by['2026-12'].status,'ESTIMADO TÉCNICO','diciembre basado en IPC octubre ya observado');
['2027-01','2027-02','2027-03','2027-04','2027-05','2027-06'].forEach(k=>assert.equal(by[k].status,'PROYECTADO REM',k));
['2027-07','2027-08','2027-09','2027-10','2027-11','2027-12'].forEach(k=>assert.equal(by[k].status,'PROYECTADO IMPLÍCITO',k));
assert.equal(by['2026-12'].ipcRef,'2026-10');assert.equal(by['2027-06'].ipcRef,'2027-04');assert.equal(by['2027-07'].ipcRef,'2027-05');assert.equal(by['2026-10'].ipcRef,'2026-08');assert.equal(by['2026-10'].rate,1.7);assert.equal(by['2026-11'].rate,1.9);
assert.equal(by['2026-12'].ipcRef,'2026-10');assert.equal(by['2026-12'].rate,2.2);

/* 6) sin saltos en el cambio de mes: cada día calendario usa el factor de su mes; el mes cierra con (1+IPC) exacto */
const days=m.projection('rem','2027-12-31',{allDays:true}),H2=m.helpers;
for(let i=1;i<days.length;i++){const ym=H2.monthOf(days[i].date),r=m.rateFor(ym,'rem').rate,f=Math.pow(1+r/100,1/H2.dim(ym));
  assert.ok(Math.abs(days[i].techo/days[i-1].techo-f)<1e-12,'factor diario '+days[i].date)}
const dec=days.find(x=>x.date==='2026-12-31'),nov=days[0];
out.push(near(dec.techo/nov.techo,1.022,1e-12,'cierre dic / cierre nov = 1 + IPC oct observado'));
assert.equal(days[0].date,'2026-11-30');assert.equal(days[0].techo,1989.12);assert.equal(days[0].status,'OFICIAL');

/* 7) escenario original (referencia histórica) */
const og=Object.fromEntries(m.monthly('original','2026-12','2027-12').map(x=>[x.ym,x]));
out.push(near(og['2026-12'].techo,2032.88064,0.01,'original dic-26 con IPC real'),near(og['2027-01'].techo,2067.43961,0.02,'original ene-27'),
  near(og['2027-02'].techo,2104.65352,0.02,'original feb-27'),near(og['2027-03'].techo,2131.46681,0.03,'original mar-27'),near(og['2027-08'].techo,2270.74513,0.1,'original ago-27'));
assert.equal(og['2027-03'].status,'ESCENARIO ORIGINAL');
assert.ok(by['2027-08'].techo>og['2027-08'].techo,'el escenario REM supera al original a ago-27');

/* 8) los datos oficiales no se alteran al proyectar */
const before=JSON.stringify(H.rows);m.projection('rem','2027-12-31');m.monthly('original','2026-12','2027-12');assert.equal(JSON.stringify(H.rows),before);

console.log(out.join('\n'));
console.log('\nOK · bands.check.js · '+KINDS.length+' clasificaciones · '+H.rows.length+' filas oficiales');
