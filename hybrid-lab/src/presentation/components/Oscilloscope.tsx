import React, { useRef, useEffect, useCallback } from 'react';

interface OscilloscopeProps {
  data: number[];
  timebase?: number;
  voltsPerDiv?: number;
  connectedPoint?: string | null;
  sampleRate?: number;
}

/**
 * Canvas Oscilloscope Component
 * High DPI support. Uses dataRef pattern so RAF loop never restarts on data updates.
 */
const CanvasOscilloscope: React.FC<OscilloscopeProps> = ({
  data = [],
  timebase = 1,
  voltsPerDiv = 20,
  connectedPoint = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDrawTimeRef = useRef(0);

  // Keep a ref to latest data so RAF always reads current values without restarting
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const drawOscilloscope = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const currentData = dataRef.current;

    // Background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#2d5f6f';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= width; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i <= height; i += 20) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#3a7a8a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width / 4, 0); ctx.lineTo(width / 4, height); ctx.stroke();

    // Waveform
    if (currentData.length > 1) {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const pointsToShow = Math.min(currentData.length, width);
      const scale = height / (voltsPerDiv * 8);
      const centerY = height / 2;

      for (let i = 0; i < pointsToShow; i++) {
        const value = currentData[currentData.length - pointsToShow + i] || 0;
        const x = (i / pointsToShow) * width;
        const y = centerY - value * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Voltage scale
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const voltage = (4 - i) * voltsPerDiv;
      const y = (i / 4) * height;
      ctx.fillText(`${voltage}V`, width - 5, y + 3);
    }

    // Time scale
    ctx.textAlign = 'center';
    ctx.font = '9px monospace';
    for (let i = 0; i <= 4; i++) {
      ctx.fillText(`${i * timebase}мс`, (i / 4) * width, height - 5);
    }

    // Info overlay
    ctx.fillStyle = '#0ea5e9';
    ctx.textAlign = 'left';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`База: ${timebase}мс/дел`, 5, 15);

    if (connectedPoint) {
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(`✓ Подключен: ${connectedPoint.toUpperCase()}`, 5, 30);
    } else {
      ctx.fillStyle = '#6b7280';
      ctx.fillText('✗ Щуп отключен', 5, 30);
    }

    ctx.font = '9px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Сэмплы: ${currentData.length}`, width - 100, height - 10);
  }, [timebase, voltsPerDiv, connectedPoint]); // data intentionally excluded — read via dataRef

  // RAF loop — starts once, never restarts due to data changes
  useEffect(() => {
    let frameId: number;

    const animate = () => {
      const now = performance.now();
      if (now - lastDrawTimeRef.current >= 1000 / 60) {
        drawOscilloscope();
        lastDrawTimeRef.current = now;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [drawOscilloscope]);

  useEffect(() => {
    window.addEventListener('resize', drawOscilloscope);
    return () => window.removeEventListener('resize', drawOscilloscope);
  }, [drawOscilloscope]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full h-80 block bg-slate-900 rounded-md border border-gray-800"
      />
    </div>
  );
};

export default CanvasOscilloscope;
