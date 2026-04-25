const previewPlate = document.getElementById("heroPlate");
const footerYear = document.getElementById("footerYear");

if (footerYear) {
  footerYear.textContent = String(new Date().getFullYear());
}

if (previewPlate) {
  const totalWells = 96;
  const colors = [
    { fill: "#2563eb", border: "#1d4ed8" },
    { fill: "#0f766e", border: "#115e59" },
    { fill: "#dc6803", border: "#b54708" },
    { fill: "#9333ea", border: "#7e22ce" },
  ];

  const wells = [];
  for (let index = 0; index < totalWells; index += 1) {
    const well = document.createElement("div");
    well.className = "preview__well";
    previewPlate.appendChild(well);
    wells.push(well);
  }

  let phase = 0;
  window.setInterval(() => {
    wells.forEach((well, index) => {
      const band = Math.floor(index / 24);
      const shouldActivate = band === phase || index % 12 === 11;
      const color = colors[band % colors.length];
      well.classList.toggle("is-active", shouldActivate);
      if (shouldActivate) {
        well.style.setProperty("--preview-fill", color.fill);
        well.style.setProperty("--preview-border", color.border);
      }
    });

    phase = (phase + 1) % 4;
  }, 1200);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll("[data-reveal]").forEach((element) => {
  revealObserver.observe(element);
});
