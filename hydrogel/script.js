'use strict';

const ids = (id) => document.getElementById(id);

const inputs = [
  'fibVol','thrVol','cellVol',
  'gelmaTarget','gelmaStock',
  'fibTarget','fibStock',
  'thrTarget','thrStock'
];

inputs.forEach(id => ids(id).addEventListener('input', calculate));

function calculate() {
  const fibVol    = parseFloat(ids('fibVol').value)    || 0;
  const thrVol    = parseFloat(ids('thrVol').value)    || 0;
  const cellVol   = parseFloat(ids('cellVol').value)   || 0;
  const gT        = parseFloat(ids('gelmaTarget').value)  || 0;
  const gS        = parseFloat(ids('gelmaStock').value)   || 0;
  const fT        = parseFloat(ids('fibTarget').value)    || 0;
  const fS        = parseFloat(ids('fibStock').value)     || 0;
  const tT        = parseFloat(ids('thrTarget').value)    || 0;
  const tS        = parseFloat(ids('thrStock').value)     || 0;

  const err = ids('errorBanner');
  const errors = [];

  if (gS > 0 && gT > gS) errors.push('Target GelMA > Stock GelMA.');
  if (fS > 0 && fT > fS) errors.push('Target Fibrinogen > Stock Fibrinogen.');
  if (tS > 0 && tT > tS) errors.push('Target Thrombin > Stock Thrombin.');
  if (cellVol > fibVol)   errors.push('Cell suspension volume > Fibrinogen mix volume.');

  if (errors.length) {
    err.style.display = 'block';
    err.textContent = errors.join(' ');
  } else {
    err.style.display = 'none';
  }

  // Syringe A: GelMA + Fibrinogen + Cells + Media top-up = fibVol
  const gelmaVol = gS > 0 ? (gT * fibVol) / gS : 0;
  const fibVolOut = fS > 0 ? (fT * fibVol) / fS : 0;
  const mediaTopup = Math.max(0, fibVol - gelmaVol - fibVolOut - cellVol);
  const totalA = gelmaVol + fibVolOut + cellVol + mediaTopup;

  // Syringe B: Thrombin + Buffer = thrVol
  const thrVolOut  = tS > 0 ? (tT * thrVol) / tS : 0;
  const bufferTopup = Math.max(0, thrVol - thrVolOut);
  const totalB = thrVolOut + bufferTopup;

  const fmt = (v) => v > 0 ? v.toFixed(1) + ' µL' : '0.0 µL';

  ids('out-gelma').textContent  = fmt(gelmaVol);
  ids('out-fib').textContent    = fmt(fibVolOut);
  ids('out-cell').textContent   = fmt(cellVol);
  ids('out-media').textContent  = fmt(mediaTopup);
  ids('out-totalA').textContent = fmt(totalA);

  ids('out-thr').textContent    = fmt(thrVolOut);
  ids('out-buffer').textContent = fmt(bufferTopup);
  ids('out-totalB').textContent = fmt(totalB);
}

calculate();
