'use strict';
/* ============================================================
   BenchKit - PlateMaster Pro App
   ============================================================ */

/* ── Plate configurations ─────────────────────────────────── */
const PLATE_CFG = {
  6:   { rows: 2,  cols: 3,  rowL: ['A','B'],                             sa: 9.5,  maxVol: 3500, workVol: 2000 },
  12:  { rows: 3,  cols: 4,  rowL: ['A','B','C'],                         sa: 3.8,  maxVol: 2000, workVol: 1000 },
  24:  { rows: 4,  cols: 6,  rowL: ['A','B','C','D'],                     sa: 1.9,  maxVol: 1000, workVol: 500  },
  48:  { rows: 6,  cols: 8,  rowL: ['A','B','C','D','E','F'],             sa: 0.75, maxVol: 600,  workVol: 300  },
  96:  { rows: 8,  cols: 12, rowL: ['A','B','C','D','E','F','G','H'],     sa: 0.32, maxVol: 360,  workVol: 200  },
  384: { rows: 16, cols: 24, rowL: 'ABCDEFGHIJKLMNOP'.split(''),          sa: 0.056,maxVol: 90,   workVol: 50   },
};

const COLORS = [
  { bg:'#dbeafe', border:'#3b82f6', text:'#1e40af' },
  { bg:'#d1fae5', border:'#10b981', text:'#065f46' },
  { bg:'#fef3c7', border:'#f59e0b', text:'#78350f' },
  { bg:'#fee2e2', border:'#ef4444', text:'#991b1b' },
  { bg:'#ede9fe', border:'#8b5cf6', text:'#4c1d95' },
  { bg:'#cffafe', border:'#06b6d4', text:'#164e63' },
  { bg:'#ffedd5', border:'#f97316', text:'#7c2d12' },
  { bg:'#fce7f3', border:'#ec4899', text:'#831843' },
];

/* ── App state ─────────────────────────────────────────────── */
const state = {
  format: 96,
  groups: ['Treatment A', 'Treatment B', 'Treatment C'],
  timepoints: ['24h'],
  bioReps: 3,
  techReps: 1,
  controls: true,
  labels: true,
  volume: 200,
  experimentName: '',
  researcher: '',
  layout: [],
  zoom: 1.0,
};

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupSubTabs();
  setupFormatBtns();
  setupTagInputs();
  setupReplicateInputs();
  setupOptions();
  setupZoom();
  setupExport();
  setupCFU();
  setupDilution();
  updateLayoutCount();
  renderGroupTags();
  renderTimepointTags();
  generateLayout();
});

/* ── Tabs ──────────────────────────────────────────────────── */
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

function setupSubTabs() {
  document.querySelectorAll('.sub-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('sub-' + btn.dataset.sub).classList.add('active');
    });
  });
}

/* ── Format buttons ────────────────────────────────────────── */
function setupFormatBtns() {
  document.querySelectorAll('.fmt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.format = parseInt(btn.dataset.fmt);
      generateLayout();
    });
  });
}

/* ── Tag inputs ────────────────────────────────────────────── */
function setupTagInputs() {
  const groupInput = document.getElementById('groupInput');
  const addGroupBtn = document.getElementById('addGroupBtn');
  const tpInput = document.getElementById('timepointInput');
  const addTpBtn = document.getElementById('addTimepointBtn');

  function addGroup() {
    const v = groupInput.value.trim();
    if (v && !state.groups.includes(v)) {
      state.groups.push(v);
      renderGroupTags();
      generateLayout();
    }
    groupInput.value = '';
    groupInput.focus();
  }
  addGroupBtn.addEventListener('click', addGroup);
  groupInput.addEventListener('keydown', e => { if (e.key === 'Enter') addGroup(); });

  function addTimepoint() {
    const v = tpInput.value.trim();
    if (v && !state.timepoints.includes(v)) {
      state.timepoints.push(v);
      renderTimepointTags();
      generateLayout();
    }
    tpInput.value = '';
    tpInput.focus();
  }
  addTpBtn.addEventListener('click', addTimepoint);
  tpInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTimepoint(); });

  document.getElementById('expName').addEventListener('input', e => { state.experimentName = e.target.value; });
  document.getElementById('researcher').addEventListener('input', e => { state.researcher = e.target.value; });
  document.getElementById('wellVol').addEventListener('input', e => { state.volume = parseFloat(e.target.value) || 200; });
}

function renderGroupTags() {
  const container = document.getElementById('groupTags');
  container.innerHTML = '';
  state.groups.forEach((g, i) => {
    const col = COLORS[i % COLORS.length];
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.style.cssText = `background:${col.bg};border-color:${col.border};color:${col.text}`;
    tag.innerHTML = `${g}<span class="tag__del" data-idx="${i}">&#x2715;</span>`;
    tag.querySelector('.tag__del').addEventListener('click', () => {
      if (state.groups.length <= 1) return;
      state.groups.splice(i, 1);
      renderGroupTags();
      generateLayout();
    });
    container.appendChild(tag);
  });
}

function renderTimepointTags() {
  const container = document.getElementById('timepointTags');
  container.innerHTML = '';
  state.timepoints.forEach((tp, i) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.style.cssText = 'background:#f0fdf4;border-color:#10b981;color:#065f46';
    tag.innerHTML = `${tp}<span class="tag__del" data-idx="${i}">&#x2715;</span>`;
    tag.querySelector('.tag__del').addEventListener('click', () => {
      if (state.timepoints.length <= 1) return;
      state.timepoints.splice(i, 1);
      renderTimepointTags();
      generateLayout();
    });
    container.appendChild(tag);
  });
}

/* ── Replicates & options ──────────────────────────────────── */
function setupReplicateInputs() {
  document.getElementById('bioReps').addEventListener('input', e => {
    state.bioReps = parseInt(e.target.value) || 1;
    generateLayout();
  });
  document.getElementById('techReps').addEventListener('input', e => {
    state.techReps = parseInt(e.target.value) || 1;
    generateLayout();
  });
}

function setupOptions() {
  document.getElementById('optControls').addEventListener('change', e => { state.controls = e.target.checked; generateLayout(); });
  document.getElementById('optLabels').addEventListener('change', e => { state.labels = e.target.checked; generateLayout(); });
  document.getElementById('generateBtn').addEventListener('click', generateLayout);
}

/* ── Zoom ──────────────────────────────────────────────────── */
function setupZoom() {
  document.getElementById('zoomInBtn').addEventListener('click', () => { state.zoom = Math.min(state.zoom + 0.1, 2.5); applyZoom(); });
  document.getElementById('zoomOutBtn').addEventListener('click', () => { state.zoom = Math.max(state.zoom - 0.1, 0.3); applyZoom(); });
}
function applyZoom() {
  document.getElementById('plateContainer').style.transform = `scale(${state.zoom})`;
  document.getElementById('zoomLabel').textContent = Math.round(state.zoom * 100) + '%';
}

/* ── Layout generation ─────────────────────────────────────── */
function generateLayout() {
  const cfg = PLATE_CFG[state.format];
  const total = cfg.rows * cfg.cols;
  const layout = new Array(total).fill(null);

  const controlCols = state.controls ? 1 : 0;
  const usableCols  = cfg.cols - controlCols;

  if (state.controls) {
    for (let r = 0; r < cfg.rows; r++) {
      layout[r * cfg.cols + (cfg.cols - 1)] = {
        type: 'control', group: 'Control', timepoint: '', bioRep: 0, techRep: 0,
        label: cfg.rowL[r] + cfg.cols,
      };
    }
  }

  const wellsPerGroup = cfg.rows * usableCols;
  const groupWellCount = Math.max(1, Math.floor(wellsPerGroup / state.groups.length));
  let gIdx = 0, tpIdx = 0, bioRep = 1, techRep = 1;
  let groupWellsUsed = 0;

  for (let r = 0; r < cfg.rows; r++) {
    for (let c = 0; c < usableCols; c++) {
      const wi = r * cfg.cols + c;
      const g  = state.groups[gIdx % state.groups.length];
      const tp = state.timepoints[tpIdx % state.timepoints.length];
      const col = COLORS[gIdx % COLORS.length];

      layout[wi] = {
        type: 'experimental', group: g, timepoint: tp,
        bioRep, techRep,
        label: cfg.rowL[r] + (c + 1),
        bg: col.bg, border: col.border, text: col.text,
      };

      groupWellsUsed++;
      if (groupWellsUsed >= groupWellCount) {
        groupWellsUsed = 0;
        gIdx++;
        tpIdx = (tpIdx + 1) % state.timepoints.length;
      }

      techRep++;
      if (techRep > state.techReps) { techRep = 1; bioRep++; }
      if (bioRep > state.bioReps)   { bioRep = 1; }
    }
  }

  state.layout = layout;
  updateStats(layout, cfg);
  renderPlate(layout, cfg);
  renderLegend();
  incrementLayoutCount();
}

/* ── Plate rendering ───────────────────────────────────────── */
function renderPlate(layout, cfg) {
  const grid = document.getElementById('plateGrid');
  grid.innerHTML = '';

  const isLarge = state.format === 384;
  const wellSize = isLarge ? 18 : state.format <= 24 ? 48 : state.format === 48 ? 34 : 26;

  grid.style.gridTemplateColumns = `22px repeat(${cfg.cols}, ${wellSize}px)`;

  // Header row: col numbers
  const emptyCell = document.createElement('div');
  grid.appendChild(emptyCell);
  for (let c = 0; c < cfg.cols; c++) {
    const lbl = document.createElement('div');
    lbl.className = 'plate-col-label';
    lbl.style.fontSize = isLarge ? '0.5rem' : '0.65rem';
    lbl.textContent = c + 1;
    grid.appendChild(lbl);
  }

  // Rows
  for (let r = 0; r < cfg.rows; r++) {
    const rowLbl = document.createElement('div');
    rowLbl.className = 'plate-row-label';
    rowLbl.style.fontSize = isLarge ? '0.5rem' : '0.65rem';
    rowLbl.textContent = cfg.rowL[r];
    grid.appendChild(rowLbl);

    for (let c = 0; c < cfg.cols; c++) {
      const wi   = r * cfg.cols + c;
      const well = layout[wi];
      const el   = document.createElement('div');
      el.className = 'well';
      el.style.width  = wellSize + 'px';
      el.style.height = wellSize + 'px';
      el.dataset.well = cfg.rowL[r] + (c + 1);

      if (well) {
        el.dataset.type = well.type;
        if (well.type === 'experimental') {
          el.style.background   = well.bg;
          el.style.borderColor  = well.border;
          el.style.color        = well.text;
          if (state.labels && !isLarge) el.textContent = well.label;
        } else {
          el.textContent = state.labels && !isLarge ? 'C' : '';
        }
        el.title = well.type === 'control'
          ? `${well.label} — Control`
          : `${well.label} — ${well.group}${well.timepoint ? ' | ' + well.timepoint : ''} | Bio ${well.bioRep}, Tech ${well.techRep}`;
      }
      grid.appendChild(el);
    }
  }
}

/* ── Legend ────────────────────────────────────────────────── */
function renderLegend() {
  const container = document.getElementById('plateLegend');
  container.innerHTML = '';

  state.groups.forEach((g, i) => {
    const col = COLORS[i % COLORS.length];
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-dot" style="background:${col.bg};border-color:${col.border}"></span>${g}`;
    container.appendChild(item);
  });

  if (state.controls) {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-dot" style="background:#f1f5f9;border-color:#94a3b8"></span>Control`;
    container.appendChild(item);
  }
}

/* ── Stats ─────────────────────────────────────────────────── */
function updateStats(layout, cfg) {
  const total = cfg.rows * cfg.cols;
  const used  = layout.filter(Boolean).length;
  document.getElementById('statNeed').textContent  = used;
  document.getElementById('statAvail').textContent = total;
  document.getElementById('statUtil').textContent  = Math.round(used / total * 100) + '%';
  document.getElementById('statArea').textContent  = cfg.sa + ' cm²';
}

/* ── Layout count ──────────────────────────────────────────── */
function updateLayoutCount() {
  const n = parseInt(localStorage.getItem('pm_layoutCount') || '0');
  document.getElementById('layoutCount').textContent = n + ' layout' + (n === 1 ? '' : 's') + ' created';
}
function incrementLayoutCount() {
  const n = parseInt(localStorage.getItem('pm_layoutCount') || '0') + 1;
  localStorage.setItem('pm_layoutCount', n);
  document.getElementById('layoutCount').textContent = n + ' layout' + (n === 1 ? '' : 's') + ' created';
}

/* ── Export ────────────────────────────────────────────────── */
function setupExport() {
  document.getElementById('exportPngBtn').addEventListener('click', exportPNG);
  document.getElementById('exportCsvBtn').addEventListener('click', exportCSV);
  document.getElementById('exportTxtBtn').addEventListener('click', exportTXT);
}

function exportPNG() {
  const cfg = PLATE_CFG[state.format];
  const prevZoom = state.zoom;
  state.zoom = 1.0;
  applyZoom();

  const container = document.getElementById('plateContainer');
  html2canvas(container, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    logging: false,
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = (state.experimentName || 'plate_layout') + '_' + state.format + 'well.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    state.zoom = prevZoom;
    applyZoom();
    toast('PNG exported successfully', 'success');
  }).catch(() => {
    state.zoom = prevZoom;
    applyZoom();
    toast('Export failed — try zooming to 100% first', 'error');
  });
}

function exportCSV() {
  const cfg = PLATE_CFG[state.format];
  const rows = ['Well,Row,Column,Group,Timepoint,BioReplicate,TechReplicate,Type'];
  state.layout.forEach((w, i) => {
    if (!w) return;
    const row = Math.floor(i / cfg.cols);
    const col = i % cfg.cols;
    rows.push([w.label, cfg.rowL[row], col + 1, w.group, w.timepoint || '', w.bioRep || 0, w.techRep || 0, w.type].join(','));
  });
  download((state.experimentName || 'plate') + '_data.csv', rows.join('\n'), 'text/csv');
  toast('CSV exported', 'success');
}

function exportTXT() {
  const cfg = PLATE_CFG[state.format];
  const now = new Date().toISOString();
  let txt = `PLATE LAYOUT PROTOCOL\n${'='.repeat(50)}\n`;
  txt += `Experiment: ${state.experimentName || 'Untitled'}\n`;
  txt += `Researcher: ${state.researcher || '—'}\n`;
  txt += `Date: ${now.slice(0,10)}\n`;
  txt += `Plate format: ${state.format}-well\n`;
  txt += `Well volume: ${state.volume} µL\n\n`;
  txt += `TREATMENT GROUPS\n${'-'.repeat(30)}\n`;
  state.groups.forEach((g, i) => { txt += `${i + 1}. ${g}\n`; });
  txt += `\nTIME POINTS\n${'-'.repeat(30)}\n`;
  state.timepoints.forEach(tp => { txt += `${tp}\n`; });
  txt += `\nWELL ASSIGNMENTS\n${'-'.repeat(30)}\n`;
  state.layout.forEach(w => {
    if (!w) return;
    if (w.type === 'control') {
      txt += `${w.label}: Control\n`;
    } else {
      txt += `${w.label}: ${w.group}${w.timepoint ? ' | ' + w.timepoint : ''} | Bio ${w.bioRep}, Tech ${w.techRep}\n`;
    }
  });
  download((state.experimentName || 'plate') + '_protocol.txt', txt, 'text/plain');
  toast('Protocol exported', 'success');
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════════════
   CFU CALCULATORS
   ══════════════════════════════════════════════════════════════ */
function setupCFU() {
  document.getElementById('ss-calcBtn').addEventListener('click', calcSingleStrain);
  document.getElementById('ms-addBtn').addEventListener('click', addMsStrain);
  document.getElementById('ms-calcBtn').addEventListener('click', calcMultiStrain);
  document.getElementById('cc-calcBtn').addEventListener('click', calcColonyCounter);
  document.getElementById('sd-calcBtn').addEventListener('click', calcSerialDilution);

  // Seed 2 multi-strain rows
  addMsStrain(); addMsStrain();
}

/* Parse scientific notation + ×/^ notation */
function parseSci(str) {
  if (!str) return NaN;
  str = str.toString().trim()
    .replace(/×\s*10\^?/g, 'e')
    .replace(/x\s*10\^?/g, 'e')
    .replace(/\s/g, '');
  return parseFloat(str);
}

function toVolUnit(ml, unit) {
  return unit === 'µL' ? ml * 1000 : ml;
}
function fromVolUnit(val, unit) {
  return unit === 'µL' ? val / 1000 : val;  // to mL
}

/* Single Strain */
function calcSingleStrain() {
  const stockConc = parseSci(document.getElementById('ss-stockConc').value);
  const stockUnit = document.getElementById('ss-stockUnit').value;
  const targetVal = parseSci(document.getElementById('ss-targetConc').value);
  const targetUnit = document.getElementById('ss-targetUnit').value;
  const finalVolVal = parseSci(document.getElementById('ss-finalVol').value);
  const finalVolUnit = document.getElementById('ss-volUnit').value;
  const area = parseSci(document.getElementById('ss-area').value) || 0.32;

  const res = document.getElementById('ss-result');
  res.style.display = 'block';
  res.className = 'result-box';

  if ([stockConc, targetVal, finalVolVal].some(isNaN) || stockConc <= 0 || finalVolVal <= 0) {
    res.className = 'result-box error';
    res.textContent = 'Please fill in all fields with valid numbers.';
    return;
  }

  const finalVolML = fromVolUnit(finalVolVal, finalVolUnit);

  // Convert everything to CFU/mL
  let stockCFUmL = stockConc;
  if (stockUnit === 'CFU/µL') stockCFUmL *= 1000;

  let targetCFUmL = targetVal;
  if (targetUnit === 'CFU/µL')   targetCFUmL *= 1000;
  if (targetUnit === 'CFU/well') targetCFUmL = targetVal / (finalVolML * 1000) * 1e6;
  if (targetUnit === 'CFU/cm²')  targetCFUmL = targetVal / area / (finalVolML * 1000) * 1e6;

  if (targetCFUmL > stockCFUmL) {
    res.className = 'result-box error';
    res.textContent = 'Target concentration is higher than stock. Please dilute the stock first.';
    return;
  }

  const stockVolML   = (targetCFUmL * finalVolML) / stockCFUmL;
  const diluentVolML = finalVolML - stockVolML;

  res.innerHTML = `
    <strong>Results (C&#x2081;V&#x2081; = C&#x2082;V&#x2082;)</strong><br>
    Stock volume needed: <strong>${fmtVol(stockVolML)}</strong><br>
    Diluent / media: <strong>${fmtVol(diluentVolML)}</strong><br>
    Final volume: <strong>${fmtVol(finalVolML)}</strong><br>
    Final concentration: <strong>${fmtSci(targetCFUmL)} CFU/mL</strong>
  `;
}

/* Multi-Strain */
let msStrainCount = 0;
function addMsStrain() {
  const container = document.getElementById('ms-strains');
  const id = msStrainCount++;
  const div = document.createElement('div');
  div.className = 'ms-strain';
  div.id = 'ms-strain-' + id;
  div.innerHTML = `
    <div class="field">
      <label>Strain ${id + 1} name</label>
      <input class="input" type="text" id="ms-name-${id}" placeholder="e.g. E. coli K12" />
    </div>
    <div class="field">
      <label>Stock conc. (CFU/mL)</label>
      <input class="input" type="text" id="ms-conc-${id}" placeholder="e.g. 1e9" />
    </div>
    <button class="btn-icon" style="margin-bottom:0" onclick="document.getElementById('ms-strain-${id}').remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  container.appendChild(div);
}

function calcMultiStrain() {
  const totalVolVal  = parseSci(document.getElementById('ms-totalVol').value);
  const totalVolUnit = document.getElementById('ms-volUnit').value;
  const totalVolML   = fromVolUnit(totalVolVal, totalVolUnit);

  const strains = [];
  document.querySelectorAll('[id^="ms-strain-"]').forEach(row => {
    const id   = row.id.split('-').pop();
    const name = document.getElementById('ms-name-' + id)?.value.trim() || 'Strain';
    const conc = parseSci(document.getElementById('ms-conc-' + id)?.value);
    if (!isNaN(conc) && conc > 0) strains.push({ name, conc });
  });

  const res = document.getElementById('ms-result');
  res.style.display = 'block';
  res.className = 'result-box';

  if (strains.length < 2) { res.className = 'result-box error'; res.textContent = 'Add at least 2 strains.'; return; }
  if (isNaN(totalVolML) || totalVolML <= 0) { res.className = 'result-box error'; res.textContent = 'Enter a valid total volume.'; return; }

  const minConc = Math.min(...strains.map(s => s.conc));
  let lines = `<strong>Mix Protocol — equal proportions (1:${strains.length})</strong><br>`;
  let totalUsed = 0;

  strains.forEach(s => {
    const volML  = (minConc * totalVolML) / s.conc / strains.length;
    totalUsed += volML;
    lines += `${s.name}: <strong>${fmtVol(volML)}</strong><br>`;
  });

  const diluent = totalVolML - totalUsed;
  lines += `Media / diluent: <strong>${fmtVol(Math.max(0, diluent))}</strong><br>`;
  lines += `Final volume: <strong>${fmtVol(totalVolML)}</strong>`;
  res.innerHTML = lines;
}

/* Colony Counter */
function calcColonyCounter() {
  const colonies  = parseSci(document.getElementById('cc-colonies').value);
  const volumeUL  = parseSci(document.getElementById('cc-volume').value);
  const dilution  = parseSci(document.getElementById('cc-dilution').value);

  const res = document.getElementById('cc-result');
  res.style.display = 'block';
  res.className = 'result-box';

  if ([colonies, volumeUL, dilution].some(isNaN) || volumeUL <= 0) {
    res.className = 'result-box error';
    res.textContent = 'Fill in all fields with valid numbers. Dilution factor e.g. 1e-6';
    return;
  }

  const cfuPerML = colonies / (volumeUL / 1000) / Math.abs(dilution);
  res.innerHTML = `
    <strong>Original stock concentration:</strong><br>
    ${fmtSci(cfuPerML)} CFU/mL<br>
    = ${fmtSci(cfuPerML / 1000)} CFU/µL<br><br>
    <em>Formula: CFU/mL = Colonies / (Volume plated in mL × Dilution factor)</em>
  `;
}

/* Serial Dilution */
function calcSerialDilution() {
  const start  = parseSci(document.getElementById('sd-start').value);
  const factor = parseFloat(document.getElementById('sd-factor').value);
  const steps  = parseInt(document.getElementById('sd-steps').value);

  const res = document.getElementById('sd-result');
  res.style.display = 'block';
  res.className = 'result-box';

  if (isNaN(start) || start <= 0) {
    res.className = 'result-box error';
    res.textContent = 'Enter a valid starting concentration.';
    return;
  }

  let html = `<strong>Serial Dilution Series (1:${factor})</strong><br>`;
  html += `<table style="width:100%;font-size:0.82rem;border-collapse:collapse;margin-top:8px">`;
  html += `<tr style="border-bottom:1px solid #bbf7d0"><th style="text-align:left;padding:4px 0">Step</th><th style="text-align:left;padding:4px 0">Dilution</th><th style="text-align:right;padding:4px 0">Concentration (CFU/mL)</th></tr>`;

  let conc = start;
  for (let i = 0; i <= steps; i++) {
    const dilLabel = i === 0 ? 'Undiluted' : `1:${fmtSci(Math.pow(factor, i))}`;
    html += `<tr style="border-bottom:1px solid #f0fdf4"><td style="padding:3px 0">${i}</td><td>${dilLabel}</td><td style="text-align:right">${fmtSci(conc)}</td></tr>`;
    conc /= factor;
  }
  html += '</table>';
  res.innerHTML = html;
}

/* ══════════════════════════════════════════════════════════════
   DILUTION TOOLS
   ══════════════════════════════════════════════════════════════ */
function setupDilution() {
  document.getElementById('dil-calcBtn').addEventListener('click', calcDilution);
  document.getElementById('dil-clearBtn').addEventListener('click', () => {
    ['dil-c1','dil-v1','dil-c2','dil-v2'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('dil-result').style.display = 'none';
  });
}

const VOL_FACTORS = { 'L': 1, 'mL': 0.001, 'µL': 0.000001 };
const CONC_FACTORS = { 'M':1,'mM':0.001,'µM':1e-6,'nM':1e-9,'mg/mL':1,'µg/mL':0.001,'CFU/mL':1,'%':1 };

function calcDilution() {
  const c1v = document.getElementById('dil-c1').value.trim();
  const v1v = document.getElementById('dil-v1').value.trim();
  const c2v = document.getElementById('dil-c2').value.trim();
  const v2v = document.getElementById('dil-v2').value.trim();

  const c1u = document.getElementById('dil-c1unit').value;
  const v1u = document.getElementById('dil-v1unit').value;
  const c2u = document.getElementById('dil-c2unit').value;
  const v2u = document.getElementById('dil-v2unit').value;

  const res = document.getElementById('dil-result');
  res.style.display = 'block';
  res.className = 'result-box';

  const blanks = [!c1v,!v1v,!c2v,!v2v].filter(Boolean).length;
  if (blanks !== 1) {
    res.className = 'result-box error';
    res.textContent = blanks === 0 ? 'Leave exactly one field blank to solve for it.' : 'Too many blank fields. Fill in three values.';
    return;
  }

  const c1 = c1v ? parseSci(c1v) * (CONC_FACTORS[c1u] || 1) : null;
  const v1 = v1v ? parseSci(v1v) * (VOL_FACTORS[v1u]  || 1) : null;
  const c2 = c2v ? parseSci(c2v) * (CONC_FACTORS[c2u] || 1) : null;
  const v2 = v2v ? parseSci(v2v) * (VOL_FACTORS[v2u]  || 1) : null;

  let answer, label;
  if (!c1v) { answer = (c2 * v2) / v1; label = `C&#x2081; = <strong>${fmtSci(answer / (CONC_FACTORS[c1u]||1))} ${c1u}</strong>`; }
  if (!v1v) { answer = (c2 * v2) / c1; label = `V&#x2081; = <strong>${fmtSci(answer / (VOL_FACTORS[v1u]||1))} ${v1u}</strong>`; }
  if (!c2v) { answer = (c1 * v1) / v2; label = `C&#x2082; = <strong>${fmtSci(answer / (CONC_FACTORS[c2u]||1))} ${c2u}</strong>`; }
  if (!v2v) { answer = (c1 * v1) / c2; label = `V&#x2082; = <strong>${fmtSci(answer / (VOL_FACTORS[v2u]||1))} ${v2u}</strong>`; }

  if (isNaN(answer) || !isFinite(answer) || answer < 0) {
    res.className = 'result-box error';
    res.textContent = 'Invalid input — check that values are positive numbers.';
    return;
  }

  if (!v2v) {
    const finalVolL = answer;
    const stockVolL = v1;
    const diluentVolL = Math.max(0, finalVolL - stockVolL);
    const dv1u = v1u;
    res.innerHTML = `${label}<br>Stock volume (V&#x2081;): <strong>${fmtSci(stockVolL/(VOL_FACTORS[dv1u]||1))} ${dv1u}</strong><br>Diluent to add: <strong>${fmtSci(diluentVolL/(VOL_FACTORS[v2u]||1))} ${v2u}</strong>`;
  } else if (!v1v) {
    const stockVolL = answer;
    const finalVolL = v2;
    const diluentVolL = Math.max(0, finalVolL - stockVolL);
    res.innerHTML = `${label}<br>Diluent to add: <strong>${fmtSci(diluentVolL/(VOL_FACTORS[v1u]||1))} ${v1u}</strong>`;
  } else {
    res.innerHTML = label;
  }
}

/* ── Utility ───────────────────────────────────────────────── */
function fmtVol(ml) {
  if (ml < 0.0001) return '0 µL';
  if (ml < 1)  return (ml * 1000).toFixed(2) + ' µL';
  return ml.toFixed(3) + ' mL';
}

function fmtSci(n) {
  if (isNaN(n) || !isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 0.001 && abs < 1e7) return parseFloat(n.toPrecision(4)).toString();
  const exp  = Math.floor(Math.log10(abs));
  const mant = n / Math.pow(10, exp);
  return `${parseFloat(mant.toPrecision(3))} × 10<sup>${exp}</sup>`;
}

function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  setTimeout(() => { el.classList.remove('show'); }, 3000);
}
