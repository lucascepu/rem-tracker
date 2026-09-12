/*
  REM historical one-step-ahead forecasts and Dec-26 anchors.
  Source: official BCRA REM publications.
  Methodology for accuracy: each observed month is compared with the REM immediately preceding it.
  TC = nominal monthly average forecast ($/USD).
  IPC = monthly median forecast (% m/m).
  TAMAR = monthly average forecast (TNA, %).
*/
window.REM_HISTORY = {
  methodology: {
    accuracy: 'one_step_ahead',
    description: 'Observed month vs median forecast from the immediately preceding REM vintage.',
    tcReal: 'simple monthly average of daily SIOPEL/A3500 observations',
    ipcReal: 'official INDEC monthly IPC',
    tamarReal: 'official BCRA monthly TAMAR when available'
  },
  vintages: {
    '2025-12': {
      label: 'REM dic-25', published: '2026-01-07',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-diciembre-de-2025/',
      next: { period: '2026-01', tc: 1484.3, ipc: 2.0, tamar: 28.05 },
      dec26: { tc: 1753, ipc_yoy: 20.1, tamar: 21.0 }
    },
    '2026-01': {
      label: 'REM ene-26', published: '2026-02-05',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-enero-de-2026/',
      next: { period: '2026-02', tc: 1475, ipc: 2.1, tamar: 31.80 },
      dec26: { tc: 1750, ipc_yoy: 22.4, tamar: 22.41 }
    },
    '2026-02': {
      label: 'REM feb-26', published: '2026-03-05',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-febrero-de-2026/',
      next: { period: '2026-03', tc: 1429, ipc: 2.5, tamar: 31.32 },
      dec26: { tc: 1707, ipc_yoy: 26.1, tamar: 24.0 }
    },
    '2026-03': {
      label: 'REM mar-26', published: '2026-04-08',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-marzo-de-2026/',
      next: { period: '2026-04', tc: 1420, ipc: 2.6, tamar: 26.8 },
      dec26: { tc: 1700, ipc_yoy: 29.1, tamar: 23.4 }
    },
    '2026-04': {
      label: 'REM abr-26', published: '2026-05-07',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-abril-de-2026/',
      next: { period: '2026-05', tc: 1410, ipc: 2.3, tamar: 23.10 },
      dec26: { tc: 1676, ipc_yoy: 30.5, tamar: 22.0 }
    },
    '2026-05': {
      label: 'REM may-26', published: '2026-06-04',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-mayo-de-2026/',
      next: { period: '2026-06', tc: 1422, ipc: 2.1, tamar: 22.75 },
      dec26: { tc: 1658, ipc_yoy: 30.5, tamar: 22.1 }
    },
    '2026-06': {
      label: 'REM jun-26', published: '2026-07-06',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-junio-2026/',
      next: { period: '2026-07', tc: 1482, ipc: 2.0, tamar: 22.50 },
      dec26: { tc: 1673, ipc_yoy: 30.0, tamar: 22.0 }
    },
    '2026-07': {
      label: 'REM jul-26', published: '2026-08-06',
      source: 'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-julio-de-2026/',
      next: { period: '2026-08', tc: 1512, ipc: 1.8, tamar: 22.40 },
      dec26: { tc: 1652, ipc_yoy: 29.8, tamar: 22.2 }
    },
    '2026-08': {
      label: 'REM ago-26', published: '2026-09-04',
      source: 'https://www.bcra.gob.ar/relevamiento-expectativas-mercado-rem/',
      next: { period: '2026-09', tc: 1530, ipc: 1.8, tamar: 24.11 },
      dec26: { tc: 1630, ipc_yoy: 30.0, tamar: 23.45 }
    }
  },
  actualIpc: {
    '2026-01': 2.9,
    '2026-02': 2.9,
    '2026-03': 3.4,
    '2026-04': 2.6,
    '2026-05': 2.1,
    '2026-06': 1.9,
    '2026-07': 2.1,
    '2026-08': 1.7
  }
};
