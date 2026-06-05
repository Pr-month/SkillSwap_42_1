import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AuthenticatedRequest } from 'src/auth/auth.types';
import { PaginationDto } from './dto/pagination.dto';
import { Skill } from './entities/skill.entity';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new skill' })
  @ApiResponse({ status: 201, description: 'Skill created', type: Skill })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createSkillDto: CreateSkillDto,
  ) {
    return this.skillsService.create(req.user.sub, createSkillDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all skills' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 20,
  })
  @ApiResponse({ status: 200, description: 'List of skills' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.skillsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get skill by id' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill found', type: Skill })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(+id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update skill (owner only)' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill updated', type: Skill })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.update(+id, req.user.sub, updateSkillDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete skill (owner only)' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.skillsService.remove(+id, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add skill to favorites' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill added to favorites' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  addFavorite(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.skillsService.addFavorite(+id, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id/favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove skill from favorites' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill removed from favorites' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  removeFavorite(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.skillsService.removeFavorite(+id, req.user.sub);
  }
}
