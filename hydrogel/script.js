const defaults = {
  syringeAFinal: 1000,
  syringeBFinal: 1000,
  cellSuspension: 100,
  targetGelma: 3,
  stockGelma: 6,
  targetFibrinogen: 3,
  stockFibrinogen: 40,
  targetThrombin: 6.25,
  stockThrombin: 100,
};

const elements = {
  syringeAFinal: document.getElementById("syringeAFinal"),
  syringeBFinal: document.getElementById("syringeBFinal"),
  cellSuspension: document.getElementById("cellSuspension"),
  targetGelma: document.getElementById("targetGelma"),
  stockGelma: document.getElementById("stockGelma"),
  targetFibrinogen: document.getElementById("targetFibrinogen"),
  stockFibrinogen: document.getElementById("stockFibrinogen"),
  targetThrombin: document.getElementById("targetThrombin"),
  stockThrombin: document.getElementById("stockThrombin"),
  gelmaDilutionNote: document.getElementById("gelmaDilutionNote"),
  fibrinogenDilutionNote: document.getElementById("fibrinogenDilutionNote"),
  thrombinDilutionNote: document.getElementById("thrombinDilutionNote"),
  outGelma: document.getElementById("outGelma"),
  outFibrinogen: document.getElementById("outFibrinogen"),
  outCell: document.getElementById("outCell"),
  outMediaTopUp: document.getElementById("outMediaTopUp"),
  outTotalA: document.getElementById("outTotalA"),
  outThrombin: document.getElementById("outThrombin"),
  outBufferTopUp: document.getElementById("outBufferTopUp"),
  outTotalB: document.getElementById("outTotalB"),
  errorA: document.getElementById("errorA"),
  errorB: document.getElementById("errorB"),
  tableWrapA: document.getElementById("tableWrapA"),
  tableWrapB: document.getElementById("tableWrapB"),
  statusA: document.getElementById("statusA"),
  statusADetail: document.getElementById("statusADetail"),
  statusB: document.getElementById("statusB"),
  statusBDetail: document.getElementById("statusBDetail"),
  totalStockPull: document.getElementById("totalStockPull"),
  resetDefaults: document.getElementById("resetDefaults"),
  copySummary: document.getElementById("copySummary"),
};

const exportButtons = document.querySelectorAll("[data-export-target]");
const numericInputs = document.querySelectorAll("[data-number-input]");
const presetButtons = document.querySelectorAll("[data-preset]");

function readNumber(id) {
  const rawValue = parseFloat(elements[id].value);
  if (!Number.isFinite(rawValue)) {
    return 0;
  }

  return Math.max(rawValue, 0);
}

function formatVolume(value) {
  return `${value.toFixed(1)} µL`;
}

function dilutionFactor(target, stock) {
  if (target <= 0 || stock <= 0) {
    return "Dilution factor: not available.";
  }

  return `Dilution factor: ${(stock / target).toFixed(2)}x from stock.`;
}

function updateShorthand(targetGelma, targetFibrinogen) {
  const gelmaLabel = Number.isInteger(targetGelma) ? targetGelma.toFixed(0) : targetGelma.toFixed(1).replace(/\.0$/, "");
  const fibrinogenLabel = Number.isInteger(targetFibrinogen) ? targetFibrinogen.toFixed(0) : targetFibrinogen.toFixed(1).replace(/\.0$/, "");
  document.getElementById("currentShorthand").textContent = `${gelmaLabel}G${fibrinogenLabel}F`;
  document.getElementById("currentShorthandDetail").textContent = `${gelmaLabel}% GelMA and ${fibrinogenLabel} mg/mL Fibrinogen`;
}

function applyPreset(preset) {
  const presets = {
    "3g3f": { targetGelma: 3, targetFibrinogen: 3, targetThrombin: 6.25, stockGelma: 6, stockFibrinogen: 40, stockThrombin: 100 },
    "5g3f": { targetGelma: 5, targetFibrinogen: 3, targetThrombin: 6.25, stockGelma: 10, stockFibrinogen: 40, stockThrombin: 100 },
    "high-thrombin": { targetGelma: 3, targetFibrinogen: 3, targetThrombin: 12.5, stockGelma: 6, stockFibrinogen: 40, stockThrombin: 100 },
  };

  const nextPreset = presets[preset];
  if (!nextPreset) {
    return;
  }

  Object.entries(nextPreset).forEach(([key, value]) => {
    elements[key].value = value;
  });

  calculate();
}

function showError(errorElement, tableElement, message) {
  errorElement.hidden = false;
  errorElement.textContent = message;
  tableElement.hidden = true;
}

function clearError(errorElement, tableElement) {
  errorElement.hidden = true;
  errorElement.textContent = "";
  tableElement.hidden = false;
}

function updateStatus(label, detail, state, message) {
  label.textContent = state;
  detail.textContent = message;
}

function calculate() {
  const syringeAFinal = readNumber("syringeAFinal");
  const syringeBFinal = readNumber("syringeBFinal");
  const cellSuspension = readNumber("cellSuspension");
  const targetGelma = readNumber("targetGelma");
  const stockGelma = readNumber("stockGelma");
  const targetFibrinogen = readNumber("targetFibrinogen");
  const stockFibrinogen = readNumber("stockFibrinogen");
  const targetThrombin = readNumber("targetThrombin");
  const stockThrombin = readNumber("stockThrombin");

  elements.gelmaDilutionNote.textContent = dilutionFactor(targetGelma, stockGelma);
  elements.fibrinogenDilutionNote.textContent = dilutionFactor(targetFibrinogen, stockFibrinogen);
  elements.thrombinDilutionNote.textContent = dilutionFactor(targetThrombin, stockThrombin);
  updateShorthand(targetGelma, targetFibrinogen);

  const gelmaVolume = stockGelma > 0 ? (targetGelma / stockGelma) * syringeAFinal : 0;
  const fibrinogenVolume = stockFibrinogen > 0 ? (targetFibrinogen / stockFibrinogen) * syringeAFinal : 0;
  const mediaTopUp = syringeAFinal - gelmaVolume - fibrinogenVolume - cellSuspension;
  const thrombinVolume = stockThrombin > 0 ? (targetThrombin / stockThrombin) * syringeBFinal : 0;
  const bufferTopUp = syringeBFinal - thrombinVolume;

  elements.outGelma.textContent = formatVolume(gelmaVolume);
  elements.outFibrinogen.textContent = formatVolume(fibrinogenVolume);
  elements.outCell.textContent = formatVolume(cellSuspension);
  elements.outMediaTopUp.textContent = formatVolume(Math.max(mediaTopUp, 0));
  elements.outTotalA.textContent = formatVolume(syringeAFinal);
  elements.outThrombin.textContent = formatVolume(thrombinVolume);
  elements.outBufferTopUp.textContent = formatVolume(Math.max(bufferTopUp, 0));
  elements.outTotalB.textContent = formatVolume(syringeBFinal);

  const totalStock = gelmaVolume + fibrinogenVolume + thrombinVolume;
  elements.totalStockPull.textContent = formatVolume(totalStock);

  const syringeAInvalidStock =
    (targetGelma > 0 && stockGelma <= 0) || (targetFibrinogen > 0 && stockFibrinogen <= 0);
  const syringeBInvalidStock = targetThrombin > 0 && stockThrombin <= 0;

  if (syringeAInvalidStock) {
    showError(
      elements.errorA,
      elements.tableWrapA,
      "Syringe A cannot be calculated because the GelMA and Fibrinogen stock concentrations must be greater than 0."
    );
    updateStatus(elements.statusA, elements.statusADetail, "Check Inputs", "Stock concentration must be greater than 0.");
  } else if (mediaTopUp < 0) {
    showError(
      elements.errorA,
      elements.tableWrapA,
      "Required Syringe A components exceed the total volume. Increase the final volume or reduce the target concentrations or cell suspension volume."
    );
    updateStatus(elements.statusA, elements.statusADetail, "Overfilled", "Required components exceed final volume.");
  } else {
    clearError(elements.errorA, elements.tableWrapA);
    updateStatus(elements.statusA, elements.statusADetail, "Ready", "Blank media top-up is available.");
  }

  if (syringeBInvalidStock) {
    showError(
      elements.errorB,
      elements.tableWrapB,
      "Syringe B cannot be calculated because the Thrombin stock concentration must be greater than 0."
    );
    updateStatus(elements.statusB, elements.statusBDetail, "Check Inputs", "Stock concentration must be greater than 0.");
  } else if (bufferTopUp < 0) {
    showError(
      elements.errorB,
      elements.tableWrapB,
      "Required Syringe B components exceed the total volume. Increase the final volume or reduce the target Thrombin concentration."
    );
    updateStatus(elements.statusB, elements.statusBDetail, "Overfilled", "Required components exceed final volume.");
  } else {
    clearError(elements.errorB, elements.tableWrapB);
    updateStatus(elements.statusB, elements.statusBDetail, "Ready", "Buffer top-up is available.");
  }
}

function resetDefaults() {
  Object.entries(defaults).forEach(([key, value]) => {
    elements[key].value = value;
  });

  calculate();
}

async function copySummary() {
  const summary = [
    "Dual-Syringe Hydrogel Batch Calculator",
    `Syringe A Final Volume: ${formatVolume(readNumber("syringeAFinal"))}`,
    `Syringe B Final Volume: ${formatVolume(readNumber("syringeBFinal"))}`,
    `Cell Suspension Volume: ${formatVolume(readNumber("cellSuspension"))}`,
    `GelMA Stock: ${elements.outGelma.textContent}`,
    `Fibrinogen Stock: ${elements.outFibrinogen.textContent}`,
    `Blank Media Top-Up: ${elements.outMediaTopUp.textContent}`,
    `Thrombin Stock: ${elements.outThrombin.textContent}`,
    `Buffer Top-Up: ${elements.outBufferTopUp.textContent}`,
  ].join("\n");

  try {
    await navigator.clipboard.writeText(summary);
    elements.copySummary.textContent = "Summary Copied";
  } catch (error) {
    elements.copySummary.textContent = "Copy Failed";
  }

  window.setTimeout(() => {
    elements.copySummary.textContent = "Copy Summary";
  }, 1600);
}

async function exportCardAsPng(targetId) {
  const card = document.getElementById(targetId);

  if (!card || typeof window.html2canvas !== "function") {
    return;
  }

  const canvas = await window.html2canvas(card, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });

  const link = document.createElement("a");
  link.download = `${targetId}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

numericInputs.forEach((input) => {
  input.addEventListener("input", calculate);
});

elements.resetDefaults.addEventListener("click", resetDefaults);
elements.copySummary.addEventListener("click", copySummary);

exportButtons.forEach((button) => {
  button.addEventListener("click", () => {
    exportCardAsPng(button.dataset.exportTarget);
  });
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyPreset(button.dataset.preset);
  });
});

calculate();
