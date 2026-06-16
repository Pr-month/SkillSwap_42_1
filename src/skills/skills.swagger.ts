import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Skill } from './entities/skill.entity';

export function ApiCreateSkill() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a new skill' }),
    ApiResponse({ status: 201, description: 'Skill created', type: Skill }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
  );
}

export function ApiGetAllSkills() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all skills' }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Items per page',
      example: 20,
    }),
    ApiResponse({ status: 200, description: 'List of skills' }),
  );
}

export function ApiGetSkillById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get skill by id' }),
    ApiParam({ name: 'id', description: 'Skill ID' }),
    ApiResponse({ status: 200, description: 'Skill found', type: Skill }),
    ApiResponse({ status: 404, description: 'Skill not found' }),
  );
}

export function ApiUpdateSkill() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update skill (owner only)' }),
    ApiParam({ name: 'id', description: 'Skill ID' }),
    ApiResponse({ status: 200, description: 'Skill updated', type: Skill }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Skill not found' }),
  );
}

export function ApiDeleteSkill() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete skill (owner only)' }),
    ApiParam({ name: 'id', description: 'Skill ID' }),
    ApiResponse({ status: 200, description: 'Skill deleted' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Skill not found' }),
  );
}

export function ApiAddFavorite() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Add skill to favorites' }),
    ApiParam({ name: 'id', description: 'Skill ID' }),
    ApiResponse({ status: 200, description: 'Skill added to favorites' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Skill not found' }),
  );
}

export function ApiRemoveFavorite() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Remove skill from favorites' }),
    ApiParam({ name: 'id', description: 'Skill ID' }),
    ApiResponse({ status: 200, description: 'Skill removed from favorites' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Skill not found' }),
  );
}
