import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Category } from './entities/category.entity';

export function ApiCreateCategory() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a new category (admin only)' }),
    ApiResponse({
      status: 201,
      description: 'Category created',
      type: Category,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
  );
}

export function ApiGetAllCategories() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all categories (tree structure)' }),
    ApiResponse({ status: 200, description: 'List of categories' }),
  );
}

export function ApiGetCategoryById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get category by id' }),
    ApiParam({ name: 'id', description: 'Category ID' }),
    ApiResponse({ status: 200, description: 'Category found', type: Category }),
    ApiResponse({ status: 404, description: 'Category not found' }),
  );
}

export function ApiUpdateCategory() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update category (admin only)' }),
    ApiParam({ name: 'id', description: 'Category ID' }),
    ApiResponse({
      status: 200,
      description: 'Category updated',
      type: Category,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Category not found' }),
  );
}

export function ApiDeleteCategory() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete category (admin only)' }),
    ApiParam({ name: 'id', description: 'Category ID' }),
    ApiResponse({ status: 200, description: 'Category deleted' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Category not found' }),
  );
}
