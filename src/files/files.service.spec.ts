import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs/promises';
import { FilesService, UPLOAD_DIR } from './files.service';

jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
    jest.clearAllMocks();
  });

  describe('getPublicUrl', () => {
    it('должен вернуть правильный URL для имени файла', () => {
      const url = service.getPublicUrl('test-image.png');
      expect(url).toBe(`/${UPLOAD_DIR}/test-image.png`);
    });
  });

  describe('deleteFile', () => {
    it('не должен ничего делать, если у URL нет имени файла', async () => {
      await service.deleteFile('/');
      expect(mockedFs.unlink).not.toHaveBeenCalled();
    });

    it('должен удалить файл при корректном URL', async () => {
      mockedFs.unlink.mockResolvedValue(undefined);

      await service.deleteFile(`/${UPLOAD_DIR}/test-file.txt`);

      expect(mockedFs.unlink).toHaveBeenCalledTimes(1);
      expect(mockedFs.unlink.mock.calls[0][0]).toContain('test-file.txt');
    });

    it('должен корректно обработать ошибку ENOENT (файл не найден)', async () => {
      const error = new Error('File not found');
      (error as NodeJS.ErrnoException).code = 'ENOENT';
      mockedFs.unlink.mockRejectedValue(error);

      await expect(
        service.deleteFile(`/${UPLOAD_DIR}/missing.txt`),
      ).resolves.toBeUndefined();
    });

    it('должен предотвращать path traversal атаки', async () => {
      await service.deleteFile(`/${UPLOAD_DIR}/../../etc/passwd`);
      expect(mockedFs.unlink).toHaveBeenCalled();
    });
  });
});
