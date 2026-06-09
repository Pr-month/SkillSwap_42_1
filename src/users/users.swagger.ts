import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';

export function ApiFindMe() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get current user' }),
    ApiResponse({ status: 200, description: 'User found', type: User }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiUpdateMe() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update current user' }),
    ApiResponse({ status: 200, description: 'User updated', type: User }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiUpdatePassword() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update current user password' }),
    ApiResponse({ status: 200, description: 'Password updated successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiGetAllUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all users' }),
    ApiResponse({ status: 200, description: 'List of users' }),
  );
}

export function ApiGetUserById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by id' }),
    ApiParam({ name: 'id', description: 'User ID' }),
    ApiResponse({ status: 200, description: 'User found', type: User }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiUpdateUserById() {
  return applyDecorators(
    ApiOperation({ summary: 'Update user by id' }),
    ApiParam({ name: 'id', description: 'User ID' }),
    ApiResponse({ status: 200, description: 'User updated', type: User }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiDeleteUserById() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete user by id' }),
    ApiParam({ name: 'id', description: 'User ID' }),
    ApiResponse({ status: 200, description: 'User deleted' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}
