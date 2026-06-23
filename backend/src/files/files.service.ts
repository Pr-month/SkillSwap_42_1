import { Injectable, Logger } from '@nestjs/common';
import { resolve } from 'path';
import { unlink } from 'fs/promises';

export const UPLOAD_DIR = 'public/uploads';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  getPublicUrl(filename: string): string {
    return `/${UPLOAD_DIR}/${filename}`;
  }

  async deleteFile(publicUrl: string): Promise<void> {
    const filename = publicUrl.split('/').pop();
    if (!filename) return;

    const resolved = resolve(process.cwd(), UPLOAD_DIR, filename);
    const allowedBase = resolve(process.cwd(), UPLOAD_DIR);
    if (!resolved.startsWith(allowedBase)) {
      this.logger.warn(`Path traversal attempt: ${publicUrl}`);
      return;
    }

    try {
      await unlink(resolved);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.error(`Failed to delete file: ${resolved}`, error);
      }
    }
  }
}
