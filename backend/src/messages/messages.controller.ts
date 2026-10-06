import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  @Get('conversations') conversations(@CurrentUser() user: any) { return this.service.conversations(user.id); }
  @Get('unread') unread(@CurrentUser() user: any) { return this.service.unreadTotal(user.id); }
  @Post('direct') startDirect(@Body() body: { targetUserId: string; body?: string }, @CurrentUser() user: any) { return this.service.startDirect(user.id, body.targetUserId, body.body); }
  @Get(':conversationId') messages(@Param('conversationId') conversationId: string, @CurrentUser() user: any) { return this.service.messages(conversationId, user.id); }
  @Post(':conversationId') send(@Param('conversationId') conversationId: string, @Body('body') body: string, @CurrentUser() user: any) { return this.service.send(conversationId, user.id, body); }
}
