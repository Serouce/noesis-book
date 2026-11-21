export type ActId = 'act-1' | 'act-2' | 'act-3' | 'act-4' | 'act-5';

export const VALID_ACTS: readonly ActId[] = ['act-1', 'act-2', 'act-3', 'act-4', 'act-5'] as const;

export interface HashRoute {
  act: ActId;
  section: string | null;
}

/**
 * Static-hosting-safe Hash Router:
 * Supports `#/act-1` ... `#/act-5` and deep chapter links `#/act-2?section=ch-1`.
 * Works identically on `python -m http.server`, GitHub Pages, and Vercel without 404 on F5.
 */
export function parseHashRoute(rawHash: string): HashRoute {
  const cleaned = (rawHash || '').replace(/^#/, '').trim();
  if (!cleaned) {
    return { act: 'act-1', section: null };
  }

  const [pathPart, queryPart] = cleaned.split('?');
  const normalizedPath = pathPart.replace(/^\/+|\/+$/g, '').toLowerCase();

  const act: ActId = (VALID_ACTS as readonly string[]).includes(normalizedPath)
    ? (normalizedPath as ActId)
    : 'act-1';

  let section: string | null = null;
  if (queryPart) {
    try {
      const params = new URLSearchParams(queryPart);
      const sec = params.get('section');
      if (sec && /^[a-z0-9_-]+$/i.test(sec)) {
        section = sec;
      }
    } catch {
      section = null;
    }
  }

  return { act, section };
}

export function buildHashUrl(act: ActId, section?: string | null): string {
  if (section) {
    return `#/${act}?section=${encodeURIComponent(section)}`;
  }
  return `#/${act}`;
}

export function getNextAct(act: ActId): ActId | null {
  const idx = VALID_ACTS.indexOf(act);
  if (idx < 0 || idx >= VALID_ACTS.length - 1) return null;
  return VALID_ACTS[idx + 1];
}

export function getPrevAct(act: ActId): ActId | null {
  const idx = VALID_ACTS.indexOf(act);
  if (idx <= 0) return null;
  return VALID_ACTS[idx - 1];
}
