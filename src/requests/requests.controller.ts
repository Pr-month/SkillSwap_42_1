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
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/auth.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from './enums/request-status.enum';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.create(createRequestDto, req.user.sub);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  findIncoming(@Req() req: AuthenticatedRequest) {
    return this.requestsService.findIncoming(req.user.sub);
  }

  @Get('outgoing')
  @UseGuards(AccessTokenGuard)
  findOutgoing(@Req() req: AuthenticatedRequest) {
    return this.requestsService.findOutgoing(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(+id);
  }
  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: RequestStatus,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.updateStatus(+id, req.user.sub, status);
  }
  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  async removeRequest(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.removeRequest(+id, req.user.sub, req.user.role);
  }
}
