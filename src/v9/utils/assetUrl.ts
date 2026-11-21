/**
 * Resolves static public/ assets safely against Vite's BASE_URL (works on 127.0.0.1:4173,
 * GitHub Pages subpaths /noesis-book/, and relative './' builds — zero root-slash 404s!).
 */
export function assetUrl(relPath: string): string {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanRel = relPath.replace(/^\/+/, '');
  return `${cleanBase}${cleanRel}`;
}
