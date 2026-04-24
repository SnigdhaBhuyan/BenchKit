/* ─────────────────────────────────────────────────────────────
   BenchKit — Landing Page Script
   Animated hero SVG plate + Canvas well-plate demo + PNG export
   ───────────────────────────────────────────────────────────── */

'use strict';

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════ */

const PLATE_CONFIGS = {
  6:   { rows: 2,  cols: 3,  rowLabels: ['A','B'], name: '6-well' },
  12:  { rows: 3,  cols: 4,  rowLabels: ['A','B','C'], name: '12-well' },
  24:  { rows: 4,  cols: 6,  rowLabels: ['A','B','C','D'], name: '24-well' },
  48:  { rows: 6,  cols: 8,  rowLabels: ['A','B','C','D','E','F'], name: '48-well' },
  96:  { rows: 8,  cols: 12, rowLabels: ['A','B','C','D','E','F','G','H'], name: '96-well' },
  384: { rows: 16, cols: 24, rowLabels: 'ABCDEFGHIJKLMNOP'.split(''), name: '384-well' },
};

const PALETTE = [
  { fill: '#3b82f6', border: '#1d4ed8' },  // blue
  { fill: '#10b981', border: '#059669' },  // green
  { fill: '#f59e0b', border: '#b45309' },  // amber
  { fill: '#ef4444', border: '#b91c1c' },  // red
  { fill: '#8b5cf6', border: '#6d28d9' },  // purple
  { fill: '#ec4899', border: '#be185d' },  // pink
  { fill: '#06b6d4', border: '#0e7490' },  // cyan
  { fill: '#f97316', border: '#c2410c' },  // orange
];

const CONTROL_COLOR  = { fill: '#e2e8f0', border: '#94a3b8' };
const EMPTY_COLOR    = { fill: '#1e293b', border: '#334155' };


/* ══════════════════════════════════════════════════════════════
   NAV — scroll behaviour + mobile burger
   ══════════════════════════════════════════════════════════════ */

(function initNav() {
  const nav     = document.getElementById('nav');
  const burger  = document.getElementById('navBurger');
  const links   = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });

  // close mobile menu on link click
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      links.classList.remove('open');
    })
  );
})();


/* ══════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS — Intersection Observer
   ══════════════════════════════════════════════════════════════ */

(function initScrollAnimations() {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('[data-animate]').forEach(el => io.observe(el));
})();


/* ══════════════════════════════════════════════════════════════
   HERO ANIMATED SVG PLATE
   ══════════════════════════════════════════════════════════════ */

(function initHeroPlate() {
  const svg  = document.getElementById('heroSvg');
  const lbl  = document.getElementById('heroAnimLabel');
  if (!svg) return;

  const rows = 8, cols = 12;
  const W = 420, H = 300;
  const PAD = { top: 30, left: 28, right: 14, bottom: 14 };
  const cellW = (W - PAD.left - PAD.right)  / cols;
  const cellH = (H - PAD.top  - PAD.bottom) / rows;
  const r = Math.min(cellW, cellH) * 0.37;

  const ANIM_GROUPS = [
    { label: 'Control',      wells: [0,1,2,3,4,5,6,7].map(r => r*cols+11),         color: '#64748b' },
    { label: 'Treatment A',  wells: flatRange(0,2,cols),                            color: '#3b82f6' },
    { label: 'Treatment B',  wells: flatRange(2,4,cols),                            color: '#10b981' },
    { label: 'Treatment C',  wells: flatRange(4,6,cols),                            color: '#f59e0b' },
    { label: 'Treatment D',  wells: flatRange(6,8,cols),                            color: '#ef4444' },
  ];

  function flatRange(rStart, rEnd, cols) {
    const arr = [];
    for (let row = rStart; row < rEnd; row++)
      for (let col = 0; col < cols - 1; col++)
        arr.push(row * cols + col);
    return arr;
  }

  // Build flat color map
  const colorMap = new Array(rows * cols).fill('#1e293b');
  ANIM_GROUPS.forEach(g => g.wells.forEach(i => (colorMap[i] = g.color)));

  // Create SVG elements
  const NS = 'http://www.w3.org/2000/svg';

  // background plate rect
  const bg = document.createElementNS(NS, 'rect');
  Object.assign(bg, {});
  svg.setAttribute('xmlns', NS);

  const plate = document.createElementNS(NS, 'rect');
  plate.setAttribute('x', PAD.left - 6);
  plate.setAttribute('y', PAD.top - 6);
  plate.setAttribute('width', W - PAD.left - PAD.right + 12);
  plate.setAttribute('height', H - PAD.top - PAD.bottom + 12);
  plate.setAttribute('rx', '8');
  plate.setAttribute('fill', '#0d1630');
  plate.setAttribute('stroke', '#1a2e55');
  plate.setAttribute('stroke-width', '1');
  svg.appendChild(plate);

  // column numbers
  const rowLabels = 'ABCDEFGH'.split('');
  for (let c = 0; c < cols; c++) {
    const x = PAD.left + c * cellW + cellW / 2;
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', PAD.top - 10);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', '#475569');
    t.setAttribute('font-size', '9');
    t.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    t.setAttribute('font-weight', '500');
    t.textContent = c + 1;
    svg.appendChild(t);
  }

  // row labels
  for (let row = 0; row < rows; row++) {
    const y = PAD.top + row * cellH + cellH / 2 + 3.5;
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', PAD.left - 10);
    t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', '#475569');
    t.setAttribute('font-size', '9');
    t.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    t.setAttribute('font-weight', '500');
    t.textContent = rowLabels[row];
    svg.appendChild(t);
  }

  // wells
  const circles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = PAD.left + col * cellW + cellW / 2;
      const cy = PAD.top  + row * cellH + cellH / 2;
      const idx = row * cols + col;

      const circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', '#1e293b');
      circle.setAttribute('stroke', '#334155');
      circle.setAttribute('stroke-width', '0.8');
      svg.appendChild(circle);
      circles.push(circle);
    }
  }

  // Animate: wave fill with stagger
  let groupIdx = 0;
  let phase = 'fill'; // fill → hold → clear
  let timeout;

  function animateWave() {
    const group = ANIM_GROUPS[groupIdx];
    lbl.textContent = `Showing: ${group.label}`;

    // clear all first
    circles.forEach((c, i) => {
      c.setAttribute('fill', '#1e293b');
      c.setAttribute('stroke', '#334155');
      c.style.transition = '';
    });

    // fill group wells with stagger
    group.wells.forEach((wi, i) => {
      setTimeout(() => {
        circles[wi].setAttribute('fill', group.color);
        circles[wi].setAttribute('stroke', darken(group.color, 25));
        circles[wi].style.filter = `drop-shadow(0 0 3px ${group.color}80)`;
      }, i * 12);
    });

    const duration = 800 + group.wells.length * 12;
    timeout = setTimeout(() => {
      groupIdx = (groupIdx + 1) % ANIM_GROUPS.length;
      animateWave();
    }, duration + 1200);
  }

  animateWave();

  // pause animation when tab not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timeout);
    else animateWave();
  });
})();


/* ══════════════════════════════════════════════════════════════
   DEMO — Interactive plate designer + Canvas PNG export
   ══════════════════════════════════════════════════════════════ */

(function initDemo() {
  const canvas       = document.getElementById('plateCanvas');
  if (!canvas) return;
  const ctx          = canvas.getContext('2d');
  const formatGrid   = document.getElementById('formatGrid');
  const groupsList   = document.getElementById('groupsList');
  const addGroupBtn  = document.getElementById('addGroupBtn');
  const optControls  = document.getElementById('optControls');
  const optLabels    = document.getElementById('optLabels');
  const exportBtn    = document.getElementById('exportBtn');
  const regenBtn     = document.getElementById('regenBtn');
  const expNameEl    = document.getElementById('demoExpName');
  const resNameEl    = document.getElementById('demoResName');
  const statUsed     = document.getElementById('statUsed');
  const statUtil     = document.getElementById('statUtil');
  const statTotal    = document.getElementById('statTotal');

  // State
  const state = {
    format: 96,
    groups: [
      { name: 'Treatment A', color: '#3b82f6' },
      { name: 'Treatment B', color: '#10b981' },
      { name: 'Treatment C', color: '#f59e0b' },
    ],
    controls: true,
    labels: true,
    layout: [],
  };

  // ─── Group list UI ───────────────────────────────────────── */

  function renderGroupsUI() {
    groupsList.innerHTML = '';
    state.groups.forEach((g, i) => {
      const row = document.createElement('div');
      row.className = 'group-row';
      row.innerHTML = `
        <input type="color" value="${g.color}" data-idx="${i}" />
        <input type="text" value="${g.name}" placeholder="Group name" data-idx="${i}" />
        <span class="group-row__del" data-idx="${i}" title="Remove"><i class="fas fa-times"></i></span>
      `;
      groupsList.appendChild(row);
    });

    groupsList.querySelectorAll('input[type="color"]').forEach(el =>
      el.addEventListener('input', e => {
        state.groups[+e.target.dataset.idx].color = e.target.value;
        redraw();
      })
    );
    groupsList.querySelectorAll('input[type="text"]').forEach(el =>
      el.addEventListener('input', e => {
        state.groups[+e.target.dataset.idx].name = e.target.value;
        redraw();
      })
    );
    groupsList.querySelectorAll('.group-row__del').forEach(el =>
      el.addEventListener('click', e => {
        const idx = +el.dataset.idx;
        if (state.groups.length <= 1) return;
        state.groups.splice(idx, 1);
        renderGroupsUI();
        redraw();
      })
    );
  }

  addGroupBtn.addEventListener('click', () => {
    if (state.groups.length >= 8) return;
    const col = PALETTE[state.groups.length % PALETTE.length];
    state.groups.push({ name: `Treatment ${String.fromCharCode(65 + state.groups.length)}`, color: col.fill });
    renderGroupsUI();
    redraw();
  });

  // ─── Format selector ─────────────────────────────────────── */

  formatGrid.querySelectorAll('.fmt-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      formatGrid.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.format = +btn.dataset.fmt;
      redraw();
    })
  );

  // ─── Options ─────────────────────────────────────────────── */

  optControls.addEventListener('change', () => { state.controls = optControls.checked; redraw(); });
  optLabels.addEventListener('change',   () => { state.labels   = optLabels.checked;   redraw(); });
  expNameEl.addEventListener('input', redraw);
  resNameEl.addEventListener('input', redraw);

  // ─── Randomize ───────────────────────────────────────────── */

  regenBtn.addEventListener('click', redraw);

  // ─── Export PNG ──────────────────────────────────────────── */

  exportBtn.addEventListener('click', () => {
    const expName = expNameEl.value.trim() || 'plate_layout';
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    // Re-draw at higher resolution for export
    drawPlate(ctx, canvas, state, { dpr, forExport: true });

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${expName.replace(/\s+/g,'_')}_plate_layout.png`;
      a.click();
      URL.revokeObjectURL(url);
      // Restore normal render
      redraw();
    }, 'image/png');
  });

  // ─── Generate layout ─────────────────────────────────────── */

  function generateLayout() {
    const cfg    = PLATE_CONFIGS[state.format];
    const total  = cfg.rows * cfg.cols;
    const layout = new Array(total).fill(null);

    // Assign controls to last column
    if (state.controls) {
      for (let row = 0; row < cfg.rows; row++)
        layout[row * cfg.cols + (cfg.cols - 1)] = { type: 'control', color: CONTROL_COLOR.fill, border: CONTROL_COLOR.border, label: 'Ctrl' };
    }

    // Distribute groups across remaining wells row-by-row
    const usableCols = state.controls ? cfg.cols - 1 : cfg.cols;
    const usable = cfg.rows * usableCols;
    const n = state.groups.length;

    for (let row = 0; row < cfg.rows; row++) {
      const gIdx = row % n;
      const g    = state.groups[gIdx];
      for (let col = 0; col < usableCols; col++) {
        const wi = row * cfg.cols + col;
        layout[wi] = {
          type:   'experimental',
          color:  g.color,
          border: darken(g.color, 22),
          label:  `${cfg.rowLabels[row]}${col + 1}`,
          group:  g.name,
        };
      }
    }

    // Stats
    const used = layout.filter(Boolean).length;
    statUsed.textContent  = used;
    statUtil.textContent  = Math.round(used / total * 100) + '%';
    statTotal.textContent = total;

    state.layout = layout;
    return layout;
  }

  // ─── Canvas renderer ─────────────────────────────────────── */

  function redraw() {
    drawPlate(ctx, canvas, state, { dpr: window.devicePixelRatio || 1, forExport: false });
  }

  function drawPlate(ctx, canvas, state, { dpr, forExport }) {
    const layout = generateLayout();
    const cfg    = PLATE_CONFIGS[state.format];
    const { rows, cols, rowLabels } = cfg;

    // Canvas logical size based on CSS size
    const cssW = canvas.offsetWidth  || 700;
    const cssH = Math.round(cssW * 0.62);

    canvas.width  = cssW  * dpr;
    canvas.height = cssH  * dpr;
    canvas.style.height = cssH + 'px';
    ctx.scale(dpr, dpr);

    // ── Background ──────────────────────────────────────── //
    ctx.fillStyle = '#ffffff';
    roundFill(ctx, 0, 0, cssW, cssH, 10, '#ffffff');

    // ── Header ──────────────────────────────────────────── //
    const HEADER_H = 52;
    ctx.fillStyle = '#f1f5f9';
    roundFill(ctx, 0, 0, cssW, HEADER_H, 10, '#f1f5f9', false);
    ctx.fillRect(0, 30, cssW, 22); // square bottom on header
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(0, HEADER_H); ctx.lineTo(cssW, HEADER_H);
    ctx.stroke();

    // Header text
    ctx.fillStyle    = '#0f172a';
    ctx.font         = `700 ${Math.min(13, cssW * 0.018)}px Inter, system-ui, sans-serif`;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(expNameEl.value.trim() || 'Plate Layout', 16, HEADER_H / 2 - 6);

    ctx.fillStyle = '#64748b';
    ctx.font      = `400 ${Math.min(10, cssW * 0.013)}px Inter, system-ui, sans-serif`;
    ctx.fillText(`${resNameEl.value.trim() || 'Researcher'}  ·  ${cfg.name}  ·  ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, 16, HEADER_H / 2 + 10);

    // ── Plate grid ──────────────────────────────────────── //
    const LEGEND_H = 44;
    const FOOTER_H = 28;
    const PAD = { top: HEADER_H + 12, left: 18, right: 12, bottom: LEGEND_H + FOOTER_H + 8 };

    const gridW = cssW - PAD.left - PAD.right;
    const gridH = cssH - PAD.top  - PAD.bottom;

    // extra left space for row labels
    const ROW_LBL_W = Math.max(14, gridW * 0.038);
    const COL_LBL_H = Math.max(12, gridH * 0.07);

    const wellAreaW = gridW - ROW_LBL_W;
    const wellAreaH = gridH - COL_LBL_H;

    const cellW = wellAreaW / cols;
    const cellH = wellAreaH / rows;
    const wellR = Math.min(cellW, cellH) * (state.format === 384 ? 0.36 : 0.40);

    // Plate body background
    roundFill(ctx,
      PAD.left, PAD.top,
      gridW, gridH,
      8, '#f8fafc'
    );
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth   = 1;
    roundStroke(ctx, PAD.left, PAD.top, gridW, gridH, 8);

    const gx0 = PAD.left + ROW_LBL_W;
    const gy0 = PAD.top  + COL_LBL_H;

    // Column numbers
    const colFontSize = Math.max(7, Math.min(11, cellW * 0.55));
    ctx.font         = `600 ${colFontSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle    = '#64748b';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    for (let c = 0; c < cols; c++) {
      const x = gx0 + c * cellW + cellW / 2;
      const y = PAD.top + COL_LBL_H / 2 + 2;
      ctx.fillText(c + 1, x, y);
    }

    // Row labels
    const rowFontSize = Math.max(7, Math.min(11, cellH * 0.55));
    ctx.font         = `600 ${rowFontSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle    = '#64748b';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    for (let row = 0; row < rows; row++) {
      const x = PAD.left + ROW_LBL_W / 2;
      const y = gy0 + row * cellH + cellH / 2;
      ctx.fillText(rowLabels[row], x, y);
    }

    // Wells
    ctx.save();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx  = row * cols + col;
        const well = layout[idx];
        const cx   = gx0 + col * cellW + cellW / 2;
        const cy   = gy0 + row * cellH + cellH / 2;

        const fillColor   = well ? well.color  : '#e2e8f0';
        const strokeColor = well ? well.border : '#cbd5e1';

        // shadow (only for larger formats)
        if (state.format <= 96) {
          ctx.shadowColor   = 'rgba(0,0,0,0.12)';
          ctx.shadowBlur    = wellR * 0.5;
          ctx.shadowOffsetY = wellR * 0.2;
        }

        ctx.beginPath();
        ctx.arc(cx, cy, wellR, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;
        ctx.shadowOffsetY = 0;

        ctx.beginPath();
        ctx.arc(cx, cy, wellR, 0, Math.PI * 2);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth   = state.format === 384 ? 0.6 : 1;
        ctx.stroke();

        // Well label (only if enabled and not 384-well)
        if (state.labels && state.format <= 96 && well) {
          const lFontSize = Math.max(5, wellR * 0.55);
          ctx.font         = `500 ${lFontSize}px Inter, system-ui, sans-serif`;
          ctx.fillStyle    = contrastColor(fillColor);
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(well.label, cx, cy);
        }
      }
    }
    ctx.restore();

    // ── Legend ──────────────────────────────────────────── //
    const legendY = cssH - LEGEND_H - FOOTER_H + 8;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, legendY); ctx.lineTo(cssW - PAD.right, legendY);
    ctx.stroke();

    const legendItems = [
      ...state.groups.map(g => ({ label: g.name, color: g.color })),
      ...(state.controls ? [{ label: 'Control', color: CONTROL_COLOR.fill }] : []),
    ];

    const boxSize    = 10;
    const itemGap    = Math.min(100, (cssW - PAD.left - PAD.right) / legendItems.length);
    const totalW     = legendItems.length * itemGap;
    const legendX0   = (cssW - totalW) / 2;
    const legendMidY = legendY + LEGEND_H / 2;

    ctx.font         = `500 ${Math.max(8, Math.min(10, itemGap * 0.15))}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign    = 'left';

    legendItems.forEach((item, i) => {
      const ix = legendX0 + i * itemGap;
      ctx.fillStyle    = item.color;
      ctx.strokeStyle  = darken(item.color, 15);
      ctx.lineWidth    = 0.5;
      roundFill(ctx, ix, legendMidY - boxSize / 2, boxSize, boxSize, 3, item.color);
      ctx.fillStyle = '#334155';
      ctx.fillText(item.label, ix + boxSize + 5, legendMidY);
    });

    // ── Footer ──────────────────────────────────────────── //
    const footerY = cssH - FOOTER_H + 4;
    ctx.fillStyle    = '#94a3b8';
    ctx.font         = `400 ${Math.max(7, Math.min(9, cssW * 0.011))}px Inter, system-ui, sans-serif`;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Generated by PlateMaster Pro · BenchKit', PAD.left, footerY + FOOTER_H / 2 - 4);

    ctx.textAlign = 'right';
    ctx.fillText(new Date().toISOString().slice(0, 10), cssW - PAD.right, footerY + FOOTER_H / 2 - 4);
  }

  // ── Canvas helper functions ──────────────────────────── */

  function roundFill(ctx, x, y, w, h, r, fill, doCorners = true) {
    ctx.beginPath();
    if (doCorners) {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y,     x + w, y + r,     r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function roundStroke(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.stroke();
  }

  // ── Init ─────────────────────────────────────────────── */

  renderGroupsUI();
  redraw();

  // Re-render on window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(redraw, 80);
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ══════════════════════════════════════════════════════════════ */

/**
 * Darken a hex color by `amount` (0-100).
 * @param {string} hex
 * @param {number} amount
 * @returns {string}
 */
function darken(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  let r = (n >> 16) & 0xff;
  let g = (n >>  8) & 0xff;
  let b =  n        & 0xff;
  const f = 1 - amount / 100;
  r = Math.max(0, Math.round(r * f));
  g = Math.max(0, Math.round(g * f));
  b = Math.max(0, Math.round(b * f));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Return black or white depending on background luminance.
 * @param {string} hex
 * @returns {string}
 */
function contrastColor(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >>  8) & 0xff;
  const b =  n        & 0xff;
  // Perceived luminance formula
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.55 ? '#1e293b' : '#ffffff';
}
