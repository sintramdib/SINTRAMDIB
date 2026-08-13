export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';
export const PUBLIC_BASE_URL =
  import.meta.env.VITE_PUBLIC_BASE_URL ?? 'http://localhost:5173';

/** Resolve caminhos de arquivo servidos pela API (ex.: /files/news/x.png). */
export function fileUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `${API_URL}${path}`;
}