import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiUploadFile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Upload a file' }),
    ApiResponse({ status: 201, description: 'File uploaded successfully' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
