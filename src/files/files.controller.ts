import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { FilesService } from './files.service';
import { imageUploadOptions } from './image-upload.options';

@ApiTags('files')
@Controller()
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  uploadFile(@UploadedFile() file: Express.Multer.File): { url: string } {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return { url: this.filesService.getPublicUrl(file.filename) };
  }
}
