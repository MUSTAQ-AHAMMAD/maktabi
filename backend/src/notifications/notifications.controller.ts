import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get() getAll(@CurrentUser() user: any) { return this.service.getUserNotifications(user.id); }
  @Put(':id/read') markRead(@Param('id') id: string) { return this.service.markAsRead(id); }
  @Put('read-all') markAllRead(@CurrentUser() user: any) { return this.service.markAllAsRead(user.id); }
}
