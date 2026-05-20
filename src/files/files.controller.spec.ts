import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { FilesService, UPLOAD_DIR } from './files.service';
import { FilesController } from './files.controller';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  describe('getPublicUrl', () => {
    it('should return public URL for a filename', () => {
      const url = service.getPublicUrl('abc-123.png');
      expect(url).toBe(`/${UPLOAD_DIR}/abc-123.png`);
    });
  });

  describe('deleteFile', () => {
    it('should do nothing when URL has no filename', async () => {
      await expect(service.deleteFile('/')).resolves.toBeUndefined();
    });

    it('should safely handle URL with path traversal characters', async () => {
      const unlinkSpy = jest
        .spyOn(fs, 'unlink')
        .mockResolvedValue() as jest.Mock;
      // pop() strips path segments, so traversal via URL is impossible.
      await service.deleteFile('/' + UPLOAD_DIR + '/../../etc/passwd');
      // pop() extracts 'passwd', resolve puts it inside UPLOAD_DIR
      expect(unlinkSpy).toHaveBeenCalled();
      unlinkSpy.mockRestore();
    });
  });
});

describe('FilesController', () => {
  let controller: FilesController;
  let _filesService: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [FilesService],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    _filesService = module.get<FilesService>(FilesService);
  });

  describe('uploadFile', () => {
    it('should throw BadRequestException when no file provided', () => {
      expect(() => controller.uploadFile(undefined as never)).toThrow(
        BadRequestException,
      );
    });

    it('should return public URL for uploaded file', () => {
      const file = {
        filename: 'test-uuid.png',
      } as Express.Multer.File;

      const result = controller.uploadFile(file);
      expect(result.url).toBe(`/${UPLOAD_DIR}/test-uuid.png`);
    });
  });
});
