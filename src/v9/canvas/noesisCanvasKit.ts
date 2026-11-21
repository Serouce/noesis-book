/**
 * Unified Swiss Optical Canvas Kit (Leica Wetzlar × Braun Kronberg standard for NOESIS v9.1):
 * - Caps DPR at 2 (crisp Retina without 9x pixel burn on 3x phones).
 * - Uses ctx.setTransform() (never cumulative ctx.scale()).
 * - Snaps hairlines to 0.5px for razor-sharp 1px strokes.
 * - Strict 0px ctx.shadowBlur (ZERO AI neon glow!).
 * - Zeroes canvas dimensions on unmount to prevent iOS Safari Canvas OOM.
 */

export const NOESIS_CANVAS_TOKENS = {
  vellumBg: '#F3F1E9',
  paperBg: '#FAF9F5',
  darkroomBg: '#111419',
  ink: '#141413',
  inkMuted: '#5E5D59',
  ivory: '#FAF9F5',
  ivoryMuted: '#9AA3B2',
  cobalt: '#004EDF',
  signal: '#FC4109',
  emerald: '#0D7A5F',
  emeraldBright: '#34D399',
  amber: '#E5C67A',
  monoFont: '"JetBrains Mono Variable", "JetBrains Mono", monospace',
} as const;

export function resizeHiDpiCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
): { ctx: CanvasRenderingContext2D | null; dpr: number; width: number; height: number } {
  const width = Math.max(1, Math.floor(cssWidth));
  const height = Math.max(1, Math.floor(cssHeight));
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);

  if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.shadowBlur = 0;
  }
  return { ctx, dpr, width, height };
}

export function releaseCanvasMemory(canvas: HTMLCanvasElement | null): void {
  if (!canvas) return;
  canvas.width = 0;
  canvas.height = 0;
}

export function snapPx(v: number): number {
  return Math.round(v) + 0.5;
}

export function drawSwissGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step = 24,
  dark = false,
): void {
  ctx.save();
  ctx.strokeStyle = dark ? 'rgba(250, 249, 245, 0.05)' : 'rgba(20, 20, 19, 0.045)';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  for (let x = step; x < width; x += step) {
    const sx = snapPx(x);
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
  }
  for (let y = step; y < height; y += step) {
    const sy = snapPx(y);
    ctx.moveTo(0, sy);
    ctx.lineTo(width, sy);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawOpticalSpikeDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
): void {
  // Concentric 1px Leica ring instead of blurry AI neon shadowBlur!
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, radius + 3.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
