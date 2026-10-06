import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(private usersService: UsersService) {}

  @Get()
  me(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @Patch()
  updateProfile(@CurrentUser() user: any, @Body() body: { firstName?: string; lastName?: string; department?: string }) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Post('password')
  changePassword(@CurrentUser() user: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(user.id, body.currentPassword, body.newPassword);
  }
}
