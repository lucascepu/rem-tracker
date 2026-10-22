/*
  REM historical forecasts — official BCRA publications.

  Accuracy methodology:
  - Observed month is compared with the median forecast from the immediately preceding REM vintage.
  - TC = nominal monthly average forecast ($/USD).
  - IPC = monthly inflation median (% m/m).
  - TAMAR = monthly average forecast (TNA, %).

  Data policy:
  - Only values verified in an official BCRA REM publication are stored here.
  - No interpolation is used in this historical dataset.
  - `next` is the one-step-ahead observation used by Accuracy.
  - `ipcPath` / `tamarPath` / `tcPath` store additional verified monthly forecasts when available.
  - `dec26` stores the December-2026 anchor published in each vintage.
  - Manual observed-data overrides are disabled; observed data is automatic only.
*/
try{localStorage.removeItem('remTracker_manual_v2')}catch{}
window.REM_HISTORY = {
  methodology: {
    accuracy: 'one_step_ahead',
    description: 'Observed month vs median forecast from the immediately preceding REM vintage.',
    tcReal: 'simple monthly average of daily SIOPEL observations',
    ipcReal: 'official INDEC monthly IPC',
    tamarReal: 'official BCRA monthly TAMAR when available',
    interpolation: false,
    manualOverrides: false
  },
  vintages: {
    '2025-12': {
      label: 'REM dic-25', published: '2026-01-07',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-diciembre-de-2025/',
      next: { period: '2026-01', tc: 1484.3, ipc: 2.0, tamar: 28.05 },
      ipcPath: { '2026-01':2.0,'2026-02':1.8,'2026-03':1.9,'2026-04':1.7,'2026-05':1.6,'2026-06':1.5 },
      tamarPath: { '2026-01':28.05,'2026-02':27.52,'2026-03':27.30,'2026-04':26.25,'2026-05':25.86,'2026-06':24.36 },
      tcPath: { '2026-01':1484.3,'2026-02':1515,'2026-03':1544,'2026-04':1570,'2026-05':1588,'2026-06':1605 },
      dec26: { tc: 1753, ipc_yoy: 20.1, tamar: 21.0 }
    },
    '2026-01': {
      label: 'REM ene-26', published: '2026-02-05',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-enero-de-2026/',
      next: { period: '2026-02', tc: 1475, ipc: 2.1, tamar: 31.80 },
      ipcPath: { '2026-02':2.1,'2026-03':2.2,'2026-04':1.9,'2026-05':1.7,'2026-06':1.6,'2026-07':1.5 },
      tamarPath: { '2026-02':31.80,'2026-03':30.14,'2026-04':28.65,'2026-05':27.60,'2026-06':26.15,'2026-07':25.00 },
      tcPath: { '2026-02':1475,'2026-03':1502,'2026-04':1526,'2026-05':1549,'2026-06':1577,'2026-07':1604 },
      dec26: { tc: 1750, ipc_yoy: 22.4, tamar: 22.41 }
    },
    '2026-02': {
      label: 'REM feb-26', published: '2026-03-05',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-febrero-de-2026/',
      next: { period: '2026-03', tc: 1429, ipc: 2.5, tamar: 31.32 },
      ipcPath: { '2026-03':2.5,'2026-04':2.2,'2026-05':1.9,'2026-06':1.8,'2026-07':1.7,'2026-08':1.5 },
      tamarPath: { '2026-03':31.32,'2026-04':30.00,'2026-05':28.60,'2026-06':27.41,'2026-07':26.19,'2026-08':25.48 },
      tcPath: { '2026-03':1429,'2026-04':1452,'2026-05':1475,'2026-06':1500,'2026-07':1532,'2026-08':1565 },
      dec26: { tc: 1707, ipc_yoy: 26.1, tamar: 24.0 }
    },
    '2026-03': {
      label: 'REM mar-26', published: '2026-04-08',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-marzo-de-2026/',
      next: { period: '2026-04', tc: 1420, ipc: 2.6, tamar: 26.8 },
      ipcPath: { '2026-04':2.6,'2026-05':2.3,'2026-06':2.0,'2026-07':2.0,'2026-08':1.8,'2026-09':1.8 },
      tamarPath: { '2026-04':26.8,'2026-05':26.0,'2026-06':25.8,'2026-07':25.9,'2026-08':25.1,'2026-09':24.9 },
      tcPath: { '2026-04':1420,'2026-05':1449,'2026-06':1481,'2026-07':1504,'2026-08':1533,'2026-09':1572 },
      dec26: { tc: 1700, ipc_yoy: 29.1, tamar: 23.4 }
    },
    '2026-04': {
      label: 'REM abr-26', published: '2026-05-07',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-abril-de-2026/',
      next: { period: '2026-05', tc: 1410, ipc: 2.3, tamar: 23.10 },
      ipcPath: { '2026-05':2.3,'2026-06':2.1,'2026-07':2.0,'2026-08':1.8,'2026-09':1.9,'2026-10':1.8 },
      tamarPath: { '2026-05':23.10,'2026-06':22.95,'2026-07':22.80,'2026-08':22.55,'2026-09':22.30,'2026-10':22.30 },
      tcPath: { '2026-05':1410 },
      dec26: { tc: 1676, ipc_yoy: 30.5, tamar: 22.0 }
    },
    '2026-05': {
      label: 'REM may-26', published: '2026-06-04',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-mayo-de-2026/',
      next: { period: '2026-06', tc: 1422, ipc: 2.1, tamar: 22.75 },
      ipcPath: { '2026-06':2.1,'2026-07':2.0,'2026-08':1.8,'2026-09':1.9,'2026-10':1.8,'2026-11':1.7 },
      tamarPath: { '2026-06':22.75 },
      tcPath: { '2026-06':1422 },
      dec26: { tc: 1658, ipc_yoy: 30.5, tamar: 22.1 }
    },
    '2026-06': {
      label: 'REM jun-26', published: '2026-07-06',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-junio-2026/',
      next: { period: '2026-07', tc: 1482, ipc: 2.0, tamar: 22.50 },
      ipcPath: { '2026-07':2.0,'2026-08':1.8,'2026-09':1.8,'2026-10':1.7,'2026-11':1.7,'2026-12':1.8 },
      tamarPath: { '2026-07':22.50 },
      tcPath: { '2026-07':1482 },
      dec26: { tc: 1673, ipc_yoy: 30.0, tamar: 22.0 }
    },
    '2026-07': {
      label: 'REM jul-26', published: '2026-08-06',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-julio-de-2026/',
      next: { period: '2026-08', tc: 1512, ipc: 1.8, tamar: 22.40 },
      ipcPath: { '2026-08':1.8,'2026-09':1.8,'2026-10':1.7,'2026-11':1.6,'2026-12':1.8,'2027-01':1.7 },
      tamarPath: { '2026-08':22.40 },
      tcPath: { '2026-08':1512 },
      dec26: { tc: 1652, ipc_yoy: 29.8, tamar: 22.2 }
    },
    '2026-08': {
      label: 'REM ago-26', published: '2026-09-04',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-agosto-de-2026/',
      next: { period: '2026-09', tc: 1530.397708358, ipc: 1.8, tamar: 24.11 },
      ipcPath: { '2026-09':1.8,'2026-10':1.7,'2026-11':1.6,'2026-12':1.776387951127933 },
      tamarPath: { '2026-09':24.11,'2026-10':23.80226105563481,'2026-11':23.26127318667481,'2026-12':23.45,'2027-01':23.00,'2027-02':22.90 },
      tcPath: { '2026-09':1530.397708358,'2026-10':1565,'2026-11':1600,'2026-12':1629.580206637178,'2027-01':1661.088197986527,'2027-02':1695 },
      dec26: { tc: 1629.580206637178, ipc_yoy: 30.0, tamar: 23.45 }
    },
    '2026-09': {
      label: 'REM sep-26', published: '2026-10-06',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-septiembre-de-2026/',
      participants: 44,
      next: { period: '2026-10', tc: 1545.03203561277, ipc: 1.7, tamar: 23.5625 },
      ipcPath: { '2026-09':1.9,'2026-10':1.7,'2026-11':1.615,'2026-12':1.8,'2027-01':1.6,'2027-02':1.6,'2027-03':1.7 },
      tamarPath: { '2026-10':23.5625,'2026-11':23.5,'2026-12':23.5,'2027-01':23.15,'2027-02':22.61,'2027-03':22.255 },
      tcPath: { '2026-10':1545.03203561277,'2026-11':1579.92075,'2026-12':1614.32226296034,'2027-01':1644,'2027-02':1672,'2027-03':1704 },
      dec26: { tc: 1614.32226296034, ipc_yoy: 30.0, tamar: 23.5 },
      annual: {
        ipc_2026_yoy:30, ipc_2027_yoy:21.21, ipc_2028_yoy:15,
        core_ipc_2026_yoy:28, core_ipc_2027_yoy:21.2, core_ipc_2028_yoy:14.45,
        tc_dec26:1614.32226296034, tc_dec27:2008.5,
        tamar_dec26:23.5, tamar_dec27:21.3391,
        gdp_2026:1.5, gdp_2027:2.474341479389266, gdp_2028:2.95,
        exports_2026:101200, exports_2027:105333.58,
        imports_2026:75498.69020526, imports_2027:82259.8238650099,
        primary_2026:15000, primary_2027:18463,
        unemployment_2026_q4:7.7, unemployment_2027_q4:7.620833762001833
      }
    }
  },
  actualIpc: {
    '2026-01': 2.9,'2026-02': 2.9,'2026-03': 3.4,'2026-04': 2.6,
    '2026-05': 2.1,'2026-06': 1.9,'2026-07': 2.1,'2026-08': 1.7,'2026-09': 1.9
  },
  actualIpcSources: {
    '2026-09': {
      institution:'INDEC',
      period:'2026-09',
      published:'2026-10-13',
      title:'Índice de precios al consumidor (IPC). Septiembre de 2026',
      url:'https://www.indec.gob.ar/uploads/informesdeprensa/ipc_10_268C45A9444C.pdf',
      sourcePage:'https://www.indec.gob.ar/Nivel3/Tema/3/5',
      publication:'Informes técnicos, vol. 10, n.º 250; Índices de precios, vol. 10, n.º 31',
      coverage:'Total nacional',
      monthly:1.9,
      yearToDate:23.6,
      yearOverYear:33.4,
      coreMonthly:1.7,
      regulatedMonthly:2.3,
      seasonalMonthly:2.9,
      dataSource:'INDEC, resumen ejecutivo, páginas 3 y 4 del PDF',
      status:'official'
    }
  }
};
