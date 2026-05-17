/**
 * TCO bar chart renderer — draws a 3-bar comparison chart on a Canvas 2D context.
 * No external dependencies.
 */

export interface TCOBarData {
  label: string;
  value: number;     // total cost in RUB
  color: string;
  breakdown: {
    purchase: number;
    fuel: number;
    maintenance: number;
  };
}

export function drawTCOChart(
  ctx: CanvasRenderingContext2D,
  data: TCOBarData[],
  width: number,
  height: number
): void {
  // Clear
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(0, 0, width, height);

  if (data.length === 0) return;

  const maxValue = Math.max(...data.map((d) => d.value));
  const paddingLeft = 70;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 50;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;
  const barW = Math.floor((chartW / data.length) * 0.55);
  const barGap = chartW / data.length;

  // Y-axis gridlines and labels
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const y = paddingTop + chartH - (i / ySteps) * chartH;
    const val = (maxValue * i) / ySteps;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();
    ctx.fillText(formatMillions(val), paddingLeft - 5, y + 4);
  }

  // Bars
  data.forEach((bar, i) => {
    const barH = (bar.value / maxValue) * chartH;
    const x = paddingLeft + i * barGap + (barGap - barW) / 2;
    const y = paddingTop + chartH - barH;

    // Bar shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 3, y + 3, barW, barH);

    // Main bar
    ctx.fillStyle = bar.color;
    ctx.fillRect(x, y, barW, barH);

    // Stacked breakdown overlay (lighter lines)
    const purchaseH = (bar.breakdown.purchase / maxValue) * chartH;

    // Dashed line showing purchase vs operating split
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    const purchaseY = paddingTop + chartH - purchaseH;
    ctx.beginPath();
    ctx.moveTo(x, purchaseY);
    ctx.lineTo(x + barW, purchaseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Value label above bar
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(formatMillions(bar.value), x + barW / 2, y - 8);

    // Label below bar
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '10px monospace';
    ctx.fillText(bar.label, x + barW / 2, paddingTop + chartH + 18);

    // Sub-label (purchase cost)
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '9px monospace';
    ctx.fillText(`покупка ${formatMillions(bar.breakdown.purchase)}`, x + barW / 2, paddingTop + chartH + 32);
  });

  // Y-axis label
  ctx.save();
  ctx.translate(12, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('СТОИМОСТЬ ВЛАДЕНИЯ (млн руб.)', 0, 0);
  ctx.restore();

  // Chart title
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('TCO — СРАВНЕНИЕ ЗА ПЕРИОД ВЛАДЕНИЯ', paddingLeft, 18);
}

function formatMillions(value: number): string {
  return `${(value / 1_000_000).toFixed(2)}M`;
}
