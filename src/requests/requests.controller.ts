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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/auth/auth.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from './enums/request-status.enum';
import { Request } from './entities/request.entity';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new request' })
  @ApiResponse({ status: 201, description: 'Request created', type: Request })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.create(createRequestDto, req.user.sub);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get incoming requests' })
  @ApiResponse({ status: 200, description: 'List of incoming requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findIncoming(@Req() req: AuthenticatedRequest) {
    return this.requestsService.findIncoming(req.user.sub);
  }

  @Get('outgoing')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get outgoing requests' })
  @ApiResponse({ status: 200, description: 'List of outgoing requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOutgoing(@Req() req: AuthenticatedRequest) {
    return this.requestsService.findOutgoing(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get request by id' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request found', type: Request })
  @ApiResponse({ status: 404, description: 'Request not found' })
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update request status (incoming only)' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Status updated', type: Request })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: RequestStatus,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.updateStatus(+id, req.user.sub, status);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete request (sent only or admin)' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async removeRequest(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.removeRequest(+id, req.user.sub, req.user.role);
  }
}
