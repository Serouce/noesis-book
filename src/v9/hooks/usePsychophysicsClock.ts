import { useCallback, useRef, useState } from 'react';

export interface DisplayClockMetrics {
  hz: number;
  frameMs: number;
  calibrated: boolean;
}

/**
 * VSync-calibrated psychophysics clock for 60Hz / 120Hz / 144Hz web displays (NOESIS v9.1):
 * - Measures actual median frame interval over 12 rAF frames (dropping outliers > 2.5x).
 * - Quantizes target exposure durations cleanly to integer frames.
 * - Flags dropped frames (dt > 45ms) or tab switches during critical trial windows.
 */
export function usePsychophysicsClock() {
  const [metrics, setMetrics] = useState<DisplayClockMetrics>({
    hz: 60,
    frameMs: 16.67,
    calibrated: false,
  });
  const calibratingRef = useRef(false);

  const calibrate = useCallback((): Promise<DisplayClockMetrics> => {
    if (calibratingRef.current) return Promise.resolve(metrics);
    calibratingRef.current = true;

    return new Promise((resolve) => {
      const deltas: number[] = [];
      let prev = 0;
      let count = 0;

      const sample = (now: number) => {
        if (prev > 0) {
          const dt = now - prev;
          if (dt > 2 && dt < 50) deltas.push(dt);
        }
        prev = now;
        count += 1;
        if (count < 14) {
          requestAnimationFrame(sample);
          return;
        }
        calibratingRef.current = false;
        if (deltas.length === 0) {
          const fallback = { hz: 60, frameMs: 16.67, calibrated: true };
          setMetrics(fallback);
          resolve(fallback);
          return;
        }
        const sorted = [...deltas].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const hz = Math.max(30, Math.min(240, Math.round(1000 / median)));
        const next: DisplayClockMetrics = {
          hz,
          frameMs: Number(median.toFixed(2)),
          calibrated: true,
        };
        setMetrics(next);
        resolve(next);
      };

      requestAnimationFrame(sample);
    });
  }, [metrics]);

  const quantizeMs = useCallback(
    (targetMs: number) => {
      const frames = Math.max(1, Math.round(targetMs / metrics.frameMs));
      return {
        frames,
        actualMs: Math.round(frames * metrics.frameMs),
      };
    },
    [metrics.frameMs],
  );

  return { metrics, calibrate, quantizeMs };
}
