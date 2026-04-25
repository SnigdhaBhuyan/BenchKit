const PLATE_CONFIG = {
  6: { rows: 2, cols: 3, rowLabels: ["A", "B"], surfaceArea: 9.5, defaultVolume: 2000 },
  12: { rows: 3, cols: 4, rowLabels: ["A", "B", "C"], surfaceArea: 3.8, defaultVolume: 1000 },
  24: { rows: 4, cols: 6, rowLabels: ["A", "B", "C", "D"], surfaceArea: 1.9, defaultVolume: 500 },
  48: { rows: 6, cols: 8, rowLabels: ["A", "B", "C", "D", "E", "F"], surfaceArea: 0.75, defaultVolume: 300 },
  96: { rows: 8, cols: 12, rowLabels: ["A", "B", "C", "D", "E", "F", "G", "H"], surfaceArea: 0.32, defaultVolume: 200 },
  384: { rows: 16, cols: 24, rowLabels: "ABCDEFGHIJKLMNOP".split(""), surfaceArea: 0.056, defaultVolume: 50 },
};

const GROUP_COLORS = [
  { fill: "#2563eb", border: "#1d4ed8" },
  { fill: "#0f766e", border: "#115e59" },
  { fill: "#dc6803", border: "#b54708" },
  { fill: "#9333ea", border: "#7e22ce" },
  { fill: "#e11d48", border: "#be123c" },
  { fill: "#0891b2", border: "#0e7490" },
  { fill: "#65a30d", border: "#4d7c0f" },
  { fill: "#ea580c", border: "#c2410c" },
];

const defaults = {
  experimentName: "Hydrogel Screening Plate",
  researcherName: "Snigdha Bhuyan",
  plateFormat: 96,
  wellVolume: 200,
  bioReps: 3,
  techReps: 2,
  includeControls: true,
  showWellLabels: true,
  groups: ["Control Media", "Treatment A", "Treatment B"],
  timepoints: ["24h", "48h"],
};

const state = {
  plateFormat: defaults.plateFormat,
  groups: [...defaults.groups],
  timepoints: [...defaults.timepoints],
  layoutEntries: [],
};

const elements = {
  experimentName: document.getElementById("experimentName"),
  researcherName: document.getElementById("researcherName"),
  wellVolume: document.getElementById("wellVolume"),
  bioReps: document.getElementById("bioReps"),
  techReps: document.getElementById("techReps"),
  includeControls: document.getElementById("includeControls"),
  showWellLabels: document.getElementById("showWellLabels"),
  groupInput: document.getElementById("groupInput"),
  timepointInput: document.getElementById("timepointInput"),
  groupTags: document.getElementById("groupTags"),
  timepointTags: document.getElementById("timepointTags"),
  addGroupBtn: document.getElementById("addGroupBtn"),
  addTimepointBtn: document.getElementById("addTimepointBtn"),
  formatGrid: document.getElementById("formatGrid"),
  requiredWells: document.getElementById("requiredWells"),
  requiredDetail: document.getElementById("requiredDetail"),
  availableWells: document.getElementById("availableWells"),
  capacityDetail: document.getElementById("capacityDetail"),
  layoutStatus: document.getElementById("layoutStatus"),
  layoutStatusDetail: document.getElementById("layoutStatusDetail"),
  boardTitle: document.getElementById("boardTitle"),
  boardResearcher: document.getElementById("boardResearcher"),
  boardFormat: document.getElementById("boardFormat"),
  boardVolume: document.getElementById("boardVolume"),
  assignedWells: document.getElementById("assignedWells"),
  controlWells: document.getElementById("controlWells"),
  utilization: document.getElementById("utilization"),
  surfaceArea: document.getElementById("surfaceArea"),
  legend: document.getElementById("legend"),
  plateGrid: document.getElementById("plateGrid"),
  warningBanner: document.getElementById("warningBanner"),
  exportBoard: document.getElementById("exportBoard"),
  exportPngBtn: document.getElementById("exportPngBtn"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  exportTxtBtn: document.getElementById("exportTxtBtn"),
  copySummaryBtn: document.getElementById("copySummaryBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

function readPositiveInteger(input, fallback) {
  const parsed = Number.parseInt(input.value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function readPositiveNumber(input, fallback) {
  const parsed = Number.parseFloat(input.value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function slugifyLabel(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function shortCode(value, maxLength) {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return "NA";
  }

  if (words.length === 1) {
    return words[0].slice(0, maxLength).toUpperCase();
  }

  return words.map((word) => word[0]).join("").slice(0, maxLength).toUpperCase();
}

function createTagPill(text, index, kind) {
  const pill = document.createElement("span");
  pill.className = "tag-pill";
  pill.textContent = text;

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `Remove ${kind} ${text}`);
  removeButton.textContent = "x";
  removeButton.addEventListener("click", () => {
    if (kind === "group") {
      if (state.groups.length === 1) {
        return;
      }

      state.groups.splice(index, 1);
      renderTags();
      generateLayout();
      return;
    }

    if (state.timepoints.length === 1) {
      return;
    }

    state.timepoints.splice(index, 1);
    renderTags();
    generateLayout();
  });

  pill.appendChild(removeButton);
  return pill;
}

function renderTags() {
  elements.groupTags.innerHTML = "";
  state.groups.forEach((group, index) => {
    elements.groupTags.appendChild(createTagPill(group, index, "group"));
  });

  elements.timepointTags.innerHTML = "";
  state.timepoints.forEach((timepoint, index) => {
    elements.timepointTags.appendChild(createTagPill(timepoint, index, "timepoint"));
  });
}

function addTag(kind) {
  const input = kind === "group" ? elements.groupInput : elements.timepointInput;
  const nextValue = input.value.trim();

  if (!nextValue) {
    return;
  }

  const collection = kind === "group" ? state.groups : state.timepoints;
  if (collection.includes(nextValue)) {
    input.value = "";
    return;
  }

  collection.push(nextValue);
  input.value = "";
  renderTags();
  generateLayout();
}

function setActiveFormatButton() {
  elements.formatGrid.querySelectorAll("[data-format]").forEach((button) => {
    button.classList.toggle("is-active", Number.parseInt(button.dataset.format, 10) === state.plateFormat);
  });
}

function buildAssignments(bioReps, techReps) {
  const assignments = [];

  state.groups.forEach((group) => {
    state.timepoints.forEach((timepoint) => {
      for (let bio = 1; bio <= bioReps; bio += 1) {
        for (let tech = 1; tech <= techReps; tech += 1) {
          assignments.push({
            group,
            timepoint,
            bio,
            tech,
            groupCode: shortCode(group, 3),
            timeCode: shortCode(timepoint, 3),
          });
        }
      }
    });
  });

  return assignments;
}

function buildLegend() {
  elements.legend.innerHTML = "";

  state.groups.forEach((group, index) => {
    const color = GROUP_COLORS[index % GROUP_COLORS.length];
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `<span class="legend-swatch" style="background:${color.fill}; border-color:${color.border}"></span>${group}`;
    elements.legend.appendChild(item);
  });

  if (elements.includeControls.checked) {
    const controlItem = document.createElement("div");
    controlItem.className = "legend-item";
    controlItem.innerHTML = '<span class="legend-swatch" style="background:#f6fafc; border-color:#9cb6c7"></span>Control';
    elements.legend.appendChild(controlItem);
  }
}

function wellSizeForFormat(format) {
  if (format === 384) {
    return 18;
  }

  if (format === 96) {
    return 28;
  }

  if (format === 48) {
    return 36;
  }

  if (format <= 24) {
    return 54;
  }

  return 32;
}

function renderPlate(layout, config) {
  const showWellLabels = elements.showWellLabels.checked;
  const wellSize = wellSizeForFormat(state.plateFormat);
  const axisSize = Math.max(22, Math.round(wellSize * 0.5));
  elements.plateGrid.innerHTML = "";
  elements.plateGrid.style.gridTemplateColumns = `${axisSize}px repeat(${config.cols}, ${wellSize}px)`;

  const emptyAxis = document.createElement("div");
  emptyAxis.className = "plate-axis";
  elements.plateGrid.appendChild(emptyAxis);

  for (let col = 0; col < config.cols; col += 1) {
    const colLabel = document.createElement("div");
    colLabel.className = "plate-axis";
    colLabel.textContent = col + 1;
    elements.plateGrid.appendChild(colLabel);
  }

  for (let row = 0; row < config.rows; row += 1) {
    const rowLabel = document.createElement("div");
    rowLabel.className = "plate-axis";
    rowLabel.textContent = config.rowLabels[row];
    elements.plateGrid.appendChild(rowLabel);

    for (let col = 0; col < config.cols; col += 1) {
      const index = row * config.cols + col;
      const cell = layout[index];
      const well = document.createElement("div");
      const location = `${config.rowLabels[row]}${col + 1}`;
      well.className = "well";
      well.style.width = `${wellSize}px`;
      well.style.height = `${wellSize}px`;

      const locationLabel = document.createElement("span");
      locationLabel.className = "well__location";
      locationLabel.textContent = location;
      well.appendChild(locationLabel);

      if (!cell) {
        well.title = `${location} — Empty`;
        elements.plateGrid.appendChild(well);
        continue;
      }

      if (cell.type === "control") {
        well.classList.add("well--control");
        if (showWellLabels && state.plateFormat <= 96) {
          const label = document.createElement("span");
          label.className = "well__label";
          label.textContent = "CTRL";
          well.appendChild(label);
        }
        well.title = `${location} - Control well`;
      } else {
        const color = GROUP_COLORS[cell.groupIndex % GROUP_COLORS.length];
        well.classList.add("well--experimental");
        well.style.background = color.fill;
        well.style.borderColor = color.border;
        well.title = `${location} - ${cell.group} | ${cell.timepoint} | Bio ${cell.bio} | Tech ${cell.tech}`;

        if (showWellLabels && state.plateFormat <= 96) {
          const label = document.createElement("span");
          label.className = "well__label";
          label.textContent = `${cell.groupCode}-${cell.timeCode}`;
          well.appendChild(label);

          const meta = document.createElement("span");
          meta.className = "well__meta";
          meta.textContent = `B${cell.bio} T${cell.tech}`;
          well.appendChild(meta);
        }
      }

      elements.plateGrid.appendChild(well);
    }
  }
}

function updateDashboard(summary, config) {
  elements.requiredWells.textContent = summary.requiredWells.toString();
  elements.availableWells.textContent = summary.totalWells.toString();
  elements.requiredDetail.textContent = `${summary.experimentalAssignments} experiment + ${summary.controlCount} control wells`;
  elements.capacityDetail.textContent = `${summary.totalWells} wells available`;
  elements.assignedWells.textContent = summary.assignedExperimental.toString();
  elements.controlWells.textContent = summary.controlCount.toString();
  elements.utilization.textContent = `${Math.min(100, Math.round((summary.usedWells / summary.totalWells) * 100))}%`;
  elements.surfaceArea.textContent = `${config.surfaceArea} cm2`;

  elements.boardTitle.textContent = elements.experimentName.value.trim() || "Untitled Plate";
  elements.boardResearcher.textContent = `Researcher: ${elements.researcherName.value.trim() || "Not specified"}`;
  elements.boardFormat.textContent = `Format: ${state.plateFormat}-well`;
  elements.boardVolume.textContent = `Working volume: ${readPositiveNumber(elements.wellVolume, config.defaultVolume)} uL`;

  if (summary.overflowCount > 0) {
    elements.layoutStatus.textContent = "Overflow";
    elements.layoutStatusDetail.textContent = `${summary.overflowCount} requested wells do not fit this format`;
    elements.warningBanner.hidden = false;
    elements.warningBanner.textContent =
      `${summary.overflowCount} requested experimental wells do not fit the selected ${state.plateFormat}-well plate. ` +
      `Only the first ${summary.assignedExperimental} experimental wells were placed. Increase plate size or reduce groups, time points, or replicates.`;
  } else {
    elements.layoutStatus.textContent = "Ready";
    elements.layoutStatusDetail.textContent = "All requested combinations fit the plate";
    elements.warningBanner.hidden = true;
    elements.warningBanner.textContent = "";
  }
}

function generateLayout() {
  const config = PLATE_CONFIG[state.plateFormat];
  const totalWells = config.rows * config.cols;
  const bioReps = readPositiveInteger(elements.bioReps, defaults.bioReps);
  const techReps = readPositiveInteger(elements.techReps, defaults.techReps);
  const includeControls = elements.includeControls.checked;
  const assignments = buildAssignments(bioReps, techReps);
  const controlCount = includeControls ? config.rows : 0;
  const experimentalCapacity = totalWells - controlCount;
  const assignedExperimental = Math.min(assignments.length, experimentalCapacity);
  const overflowCount = Math.max(0, assignments.length - experimentalCapacity);

  const layout = new Array(totalWells).fill(null);
  let assignmentIndex = 0;

  for (let row = 0; row < config.rows; row += 1) {
    for (let col = 0; col < config.cols; col += 1) {
      const position = row * config.cols + col;
      const isControlColumn = includeControls && col === config.cols - 1;

      if (isControlColumn) {
        layout[position] = { type: "control" };
        continue;
      }

      if (assignmentIndex >= assignedExperimental) {
        continue;
      }

      const assignment = assignments[assignmentIndex];
      const groupIndex = state.groups.indexOf(assignment.group);
      layout[position] = {
        type: "experimental",
        group: assignment.group,
        timepoint: assignment.timepoint,
        bio: assignment.bio,
        tech: assignment.tech,
        groupCode: assignment.groupCode,
        timeCode: assignment.timeCode,
        groupIndex,
      };
      assignmentIndex += 1;
    }
  }

  state.layoutEntries = layout.map((entry, index) => {
    if (!entry) {
      return null;
    }

    const row = Math.floor(index / config.cols);
    const col = index % config.cols;
    return {
      well: `${config.rowLabels[row]}${col + 1}`,
      row: config.rowLabels[row],
      column: col + 1,
      ...entry,
    };
  }).filter(Boolean);

  const summary = {
    totalWells,
    controlCount,
    assignedExperimental,
    experimentalAssignments: assignments.length,
    overflowCount,
    usedWells: assignedExperimental + controlCount,
    requiredWells: assignments.length + controlCount,
  };

  renderPlate(layout, config);
  buildLegend();
  updateDashboard(summary, config);
}

function exportCsv() {
  const header = "Well,Row,Column,Type,Group,Timepoint,BiologicalReplicate,TechnicalReplicate";
  const lines = state.layoutEntries.map((entry) => {
    if (entry.type === "control") {
      return `${entry.well},${entry.row},${entry.column},control,Control,,0,0`;
    }

    return [
      entry.well,
      entry.row,
      entry.column,
      entry.type,
      entry.group,
      entry.timepoint,
      entry.bio,
      entry.tech,
    ].join(",");
  });

  downloadFile(
    `${slugifyLabel(elements.experimentName.value || "plate-layout")}.csv`,
    [header, ...lines].join("\n"),
    "text/csv"
  );
}

function exportProtocol() {
  const lines = [
    "PLATE LAYOUT PROTOCOL",
    "=====================",
    `Experiment: ${elements.experimentName.value.trim() || "Untitled Plate"}`,
    `Researcher: ${elements.researcherName.value.trim() || "Not specified"}`,
    `Plate Format: ${state.plateFormat}-well`,
    `Working Volume Per Well: ${readPositiveNumber(elements.wellVolume, PLATE_CONFIG[state.plateFormat].defaultVolume)} uL`,
    "",
    "GROUPS",
    "------",
    ...state.groups,
    "",
    "TIME POINTS",
    "-----------",
    ...state.timepoints,
    "",
    "WELL ASSIGNMENTS",
    "----------------",
  ];

  state.layoutEntries.forEach((entry) => {
    if (entry.type === "control") {
      lines.push(`${entry.well}: Control`);
      return;
    }

    lines.push(`${entry.well}: ${entry.group} | ${entry.timepoint} | Bio ${entry.bio} | Tech ${entry.tech}`);
  });

  downloadFile(
    `${slugifyLabel(elements.experimentName.value || "plate-layout")}-protocol.txt`,
    lines.join("\n"),
    "text/plain"
  );
}

async function exportPng() {
  if (typeof window.html2canvas !== "function") {
    return;
  }

  const canvas = await window.html2canvas(elements.exportBoard, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });

  const link = document.createElement("a");
  link.download = `${slugifyLabel(elements.experimentName.value || "plate-layout")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function copySummary() {
  const summary = [
    `Experiment: ${elements.experimentName.value.trim() || "Untitled Plate"}`,
    `Researcher: ${elements.researcherName.value.trim() || "Not specified"}`,
    `Plate Format: ${state.plateFormat}-well`,
    `Working Volume: ${readPositiveNumber(elements.wellVolume, PLATE_CONFIG[state.plateFormat].defaultVolume)} uL`,
    `Groups: ${state.groups.join(", ")}`,
    `Time Points: ${state.timepoints.join(", ")}`,
    `Biological Replicates: ${readPositiveInteger(elements.bioReps, defaults.bioReps)}`,
    `Technical Replicates: ${readPositiveInteger(elements.techReps, defaults.techReps)}`,
    `Controls Reserved: ${elements.includeControls.checked ? "Yes" : "No"}`,
    `Status: ${elements.layoutStatus.textContent}`,
  ].join("\n");

  try {
    await navigator.clipboard.writeText(summary);
    elements.copySummaryBtn.textContent = "Summary Copied";
  } catch (error) {
    elements.copySummaryBtn.textContent = "Copy Failed";
  }

  window.setTimeout(() => {
    elements.copySummaryBtn.textContent = "Copy Summary";
  }, 1600);
}

function resetDefaults() {
  elements.experimentName.value = defaults.experimentName;
  elements.researcherName.value = defaults.researcherName;
  elements.wellVolume.value = defaults.wellVolume;
  elements.bioReps.value = defaults.bioReps;
  elements.techReps.value = defaults.techReps;
  elements.includeControls.checked = defaults.includeControls;
  elements.showWellLabels.checked = defaults.showWellLabels;
  state.groups = [...defaults.groups];
  state.timepoints = [...defaults.timepoints];
  state.plateFormat = defaults.plateFormat;
  setActiveFormatButton();
  renderTags();
  generateLayout();
}

function bindEvents() {
  elements.addGroupBtn.addEventListener("click", () => addTag("group"));
  elements.addTimepointBtn.addEventListener("click", () => addTag("timepoint"));

  elements.groupInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag("group");
    }
  });

  elements.timepointInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag("timepoint");
    }
  });

  [
    elements.experimentName,
    elements.researcherName,
    elements.wellVolume,
    elements.bioReps,
    elements.techReps,
    elements.includeControls,
    elements.showWellLabels,
  ].forEach((input) => {
    input.addEventListener("input", generateLayout);
    input.addEventListener("change", generateLayout);
  });

  elements.formatGrid.querySelectorAll("[data-format]").forEach((button) => {
    button.addEventListener("click", () => {
      state.plateFormat = Number.parseInt(button.dataset.format, 10);
      const config = PLATE_CONFIG[state.plateFormat];
      elements.wellVolume.value = config.defaultVolume;
      setActiveFormatButton();
      generateLayout();
    });
  });

  elements.exportCsvBtn.addEventListener("click", exportCsv);
  elements.exportTxtBtn.addEventListener("click", exportProtocol);
  elements.exportPngBtn.addEventListener("click", exportPng);
  elements.copySummaryBtn.addEventListener("click", copySummary);
  elements.resetBtn.addEventListener("click", resetDefaults);
}

renderTags();
setActiveFormatButton();
bindEvents();
generateLayout();

