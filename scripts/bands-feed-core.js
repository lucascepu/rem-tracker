/* Pure, portable builder for the public FX-band JSON feed.
 * BCRA source figures are never rounded or changed here.
 * Node build: scripts/build-bands-feed.js. Browser consumers: static JSON.
 */
(function(root){
  'use strict';
  function buildFeed(H,REM,Model){
    if(!H?.rows?.length||!REM?.vintages||!Model?.create)throw Error('Missing source data/model');
    const vintages=Object.entries(REM.vintages).filter(([,v])=>v.ipcPath).sort(([a],[b])=>a.localeCompare(b));
    const latest=vintages.filter(([,v])=>v.next12).at(-1)?.[0]||vintages.at(-1)?.[0];
    if(!latest)throw Error('No REM vintage');
    const model=Model.create({rows:H.rows,rem:REM,vintage:latest});
    const from='2026-01',to='2027-08',end='2027-08-31';
    const fmt=value=>value===null||value===undefined||!Number.isFinite(value)?null:Number(value);
    const entries=H.rows.map(([date,piso,techo])=>({date,piso,techo,status:'OFICIAL',source:'BCRA'}));
    const forward=model.projection('rem',end).slice(1).map(v=>({
      date:v.date,piso:fmt(v.piso),techo:fmt(v.techo),status:v.status,
      source:v.status==='PROYECTADO REM'?'REM '+latest:'Cálculo implícito '+latest
    }));
    const month=model.monthly('rem',from,to).map(v=>({
      month:v.ym,date:v.endDate,piso:fmt(v.piso),techo:fmt(v.techo),
      status:v.status,official:v.official===true,
      change_pct:fmt(v.varPct),ipc_month:v.ipcRef||null,ipc_rate_pct:fmt(v.rate),
      ipc_origin:v.ipcKind||null, last_official_trading_day:v.lastRueda||null,
      rem_fx_mean:fmt(REM.vintages[latest]?.tcPath?.[v.ym])
    }));
    const older=model.monthly('original',from,to).map(v=>({
      month:v.ym,date:v.endDate,techo:fmt(v.techo),piso:fmt(v.piso),
      status:v.status,ipc_month:v.ipcRef||null,ipc_rate_pct:fmt(v.rate)
    }));
    const ipcHistory=Object.entries(REM.actualIpc||{}).sort().map(([month,rate_pct])=>({
      month,rate_pct,source:'INDEC'
    }));
    const vintageRefs=vintages.map(([id,v])=>({
      id,published:v.published,source:v.source||null,
      monthly_ipc_path:v.ipcPath||{},
      monthly_fx_mean_path:v.tcPath||{},
      forecast_12_month_inflation:v.next12?{
        horizon:v.next12.horizon,yoy_pct:v.next12.ipc_yoy
      }:null
    }));
    const sourceDocs={
      bcra_excel:H.meta.source.url,
      bcra_band_page:H.meta.source.page,
      rem_page:REM.vintages[latest].source||null,
      indec_page:'https://www.indec.gob.ar/Nivel3/Tema/3/5'
    };
    return{
      schema_version:'1.0.0',
      dataset:'REM_TRACKER_BCRA_FX_BANDS',
      publisher:'REM Tracker (lucascepu/rem-tracker)',
      source_of_truth:'https://github.com/lucascepu/rem-tracker',
      date_of_snapshot:H.meta.retrievedAt,
      currency:'ARS/USD',
      unit:'pesos por USD',
      assumptions:{
        rule:'Band month M uses monthly INDEC IPC M-2',
        calculation:'Calendar-day compound factors (1+IPC/100)^(1/days in month) for upper, (1-IPC/100)^(1/days in month) for lower',
        official_values_are_unmodified:true,
        historical_official_end:model.lastOfficial,
        future_official_values_can_be_published:true,
        projected_after:model.lastOfficial,
        vintage_used:latest,
        projected_start:'2026-12-01',
        projection_end:end,
        missing_monthly_REM:'Use implied flat monthly rate from REM 12-month YoY; not an official individual monthly forecast',
        hypothetical_older_scenarios:'Original dashboard scenario is a sensitivity only, not REM official',
        comparison_warning:'REM nominal FX is a monthly average; the band ceiling is a value at date/month-end'
      },
      sources:sourceDocs,
      implied_inflation:model.implied?{
        rate_pct:model.implied.rate,months:model.implied.months,
        horizon:model.implied.horizon,yoy_pct:model.implied.yoy
      }:null,
      counts:{official_daily:entries.length,projection_weekdays:forward.length,monthly:month.length},
      ipc_observed:ipcHistory,
      rem_vintages:vintageRefs,
      official_daily:entries,
      projected_daily:forward,
      monthly_ceiling:month,
      original_scenario_monthly:older
    };
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={buildFeed};
  root.BandsFeedCore={buildFeed};
})(typeof window!=='undefined'?window:globalThis);
