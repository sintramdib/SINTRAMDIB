import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env';
import { badRequest } from '../../lib/errors';

export class Storage {
  static root(): string {
    const dir = path.resolve(process.cwd(), env.STORAGE_DIR);
    return dir;
  }

  /** Garante que o diretório raiz e subpastas existam (usado no bootstrap). */
  static async init(): Promise<void> {
    const root = this.root();
    for (const sub of ['photo', 'signature', 'news', 'banner']) {
      await mkdir(path.join(root, sub), { recursive: true });
    }
  }

  /** Salva bytes em disco e devolve o caminho relativo público (ex.: /files/x.png). */
  static async write(kind: string, ext: string, data: Buffer): Promise<string> {
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext.toLowerCase()) ? ext : '.png';
    const name = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
    const dir = path.join(this.root(), kind);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), data);
    return `/files/${kind}/${name}`;
  }

  /** Decodifica um data URL (ex.: data:image/png;base64,...) validando MIME. */
  static decodeDataUrl(dataUrl: string, allowed: string[]): { ext: string; buffer: Buffer } {
    const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i.exec(dataUrl);
    if (!match) throw badRequest('Arquivo em formato inválido. Envie um data URL de imagem.');
    const mime = match[1].toLowerCase();
    if (!allowed.includes(mime)) throw badRequest(`Tipo de imagem não permitido: ${mime}`);
    const buffer = Buffer.from(match[2], 'base64');
    return { ext: mime.split('/')[1], buffer };
  }
}

export const storage = Storage;