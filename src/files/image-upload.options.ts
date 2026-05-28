import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { UPLOAD_DIR } from './files.service';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

function createImageStorage() {
  return diskStorage({
    destination: `./${UPLOAD_DIR}`,
    filename: (_req, file, cb) => {
      cb(null, randomUUID() + extname(file.originalname));
    },
  });
}

/**
 * Общий конфиг Multer для загрузки изображений.
 * Используется в `FileInterceptor('field', imageUploadOptions)`.
 *
 * - Хранилище: `public/uploads`, случайное UUID-имя.
 * - Лимит: 2 МБ.
 * - Форматы: png, jpeg, webp.
 */
export const imageUploadOptions: MulterOptions = {
  storage: createImageStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(
        new BadRequestException(
          `Allowed file types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        ),
        false,
      );
      return;
    }
    cb(null, true);
  },
};
