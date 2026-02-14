/**
 * Generates a branded ESG seal as a PNG using Canvas API.
 */

interface SealConfig {
  levelName: string;
  levelLabel: string;
  icon: string;
  gradient: [string, string];
  co2Avoided: string;
  treesEquiv: number;
  recycleRate: number;
  companyName: string;
}

const LEVEL_CONFIGS: Record<string, { gradient: [string, string]; ringColor: string }> = {
  "Bronze Eco": {
    gradient: ["#92400e", "#d97706"],
    ringColor: "#b45309",
  },
  "Silver Cycle": {
    gradient: ["#64748b", "#cbd5e1"],
    ringColor: "#94a3b8",
  },
  "Gold Impact": {
    gradient: ["#ca8a04", "#facc15"],
    ringColor: "#eab308",
  },
  "Green Black": {
    gradient: ["#059669", "#34d399"],
    ringColor: "#10b981",
  },
};

export function generateESGSeal(config: SealConfig): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const size = 800;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas not supported"));

    const levelConfig = LEVEL_CONFIGS[config.levelName] || LEVEL_CONFIGS["Bronze Eco"];
    const [c1, c2] = levelConfig.gradient;
    const cx = size / 2;
    const cy = size / 2;

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, size, size);

    // Outer ring gradient
    const ringGrad = ctx.createLinearGradient(0, 0, size, size);
    ringGrad.addColorStop(0, c1);
    ringGrad.addColorStop(1, c2);

    ctx.beginPath();
    ctx.arc(cx, cy, 360, 0, Math.PI * 2);
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 12;
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.arc(cx, cy, 340, 0, Math.PI * 2);
    ctx.strokeStyle = levelConfig.ringColor + "44";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner dark circle
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 330);
    bgGrad.addColorStop(0, "#1e293b");
    bgGrad.addColorStop(1, "#0f172a");
    ctx.beginPath();
    ctx.arc(cx, cy, 330, 0, Math.PI * 2);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Icon
    ctx.font = "80px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(config.icon, cx, 180);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Inter, sans-serif";
    ctx.fillText("SELO ESG", cx, 260);

    // Level name with gradient-like color
    ctx.fillStyle = c2;
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillText(config.levelName.toUpperCase(), cx, 305);

    // Divider line
    const lineGrad = ctx.createLinearGradient(cx - 120, 0, cx + 120, 0);
    lineGrad.addColorStop(0, "transparent");
    lineGrad.addColorStop(0.5, levelConfig.ringColor);
    lineGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 120, 335);
    ctx.lineTo(cx + 120, 335);
    ctx.stroke();

    // CO2 stat
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "600 20px Inter, sans-serif";
    ctx.fillText("CO₂ Evitado", cx, 375);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px Inter, sans-serif";
    ctx.fillText(`${config.co2Avoided} ton`, cx, 425);

    // Secondary stats
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 18px Inter, sans-serif";
    ctx.fillText(`🌳 ${config.treesEquiv} árvores equivalentes`, cx, 480);
    ctx.fillText(`♻️ Taxa de reciclagem: ${config.recycleRate}%`, cx, 510);

    // Company name
    ctx.fillStyle = c2;
    ctx.font = "bold 22px Inter, sans-serif";
    ctx.fillText(config.companyName || "Minha Empresa", cx, 575);

    // Footer
    ctx.fillStyle = "#64748b";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText("Certificado CicloMTR", cx, 630);
    const date = new Date().toLocaleDateString("pt-BR");
    ctx.fillText(`Emitido em ${date}`, cx, 655);

    // "CicloMTR" watermark
    ctx.fillStyle = levelConfig.ringColor + "15";
    ctx.font = "bold 120px Inter, sans-serif";
    ctx.fillText("CicloMTR", cx, 740);

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to generate seal image"));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
