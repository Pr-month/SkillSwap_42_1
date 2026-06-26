import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { FilesService } from './files.service';
import { imageUploadOptions } from './image-upload.options';
import { ApiUploadFile } from './files.swagger';

@Controller()
@UseGuards(AccessTokenGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  @ApiUploadFile()
  uploadFile(@UploadedFile() file: Express.Multer.File): { url: string } {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return { url: this.filesService.getPublicUrl(file.filename) };
  }
}
