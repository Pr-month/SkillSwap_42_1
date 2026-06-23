import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from './entities/request.entity';

export function ApiCreateRequest() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a new request' }),
    ApiResponse({ status: 201, description: 'Request created', type: Request }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
  );
}

export function ApiGetIncomingRequests() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get incoming requests' }),
    ApiResponse({ status: 200, description: 'List of incoming requests' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function ApiGetOutgoingRequests() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get outgoing requests' }),
    ApiResponse({ status: 200, description: 'List of outgoing requests' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function ApiGetRequestById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get request by id' }),
    ApiParam({ name: 'id', description: 'Request ID' }),
    ApiResponse({ status: 200, description: 'Request found', type: Request }),
    ApiResponse({ status: 404, description: 'Request not found' }),
  );
}

export function ApiUpdateRequestStatus() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update request status (incoming only)' }),
    ApiParam({ name: 'id', description: 'Request ID' }),
    ApiResponse({ status: 200, description: 'Status updated', type: Request }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Request not found' }),
  );
}

export function ApiDeleteRequest() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete request (sent only or admin)' }),
    ApiParam({ name: 'id', description: 'Request ID' }),
    ApiResponse({ status: 200, description: 'Request deleted' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Request not found' }),
  );
}
