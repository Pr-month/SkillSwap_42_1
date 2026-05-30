import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AuthenticatedRequest } from 'src/auth/auth.types';
import { PaginationDto } from './dto/pagination.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AuthenticatedRequest } from 'src/auth/auth.types';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createSkillDto: CreateSkillDto,
  ) {
    return this.skillsService.create(req.user.sub, createSkillDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.skillsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(+id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.update(+id, req.user.sub, updateSkillDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.skillsService.remove(+id, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/favorite')
  addFavorite(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.skillsService.addFavorite(+id, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id/favorite')
  removeFavorite(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.skillsService.removeFavorite(+id, req.user.sub);
  }
}
