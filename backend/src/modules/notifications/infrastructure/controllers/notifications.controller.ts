import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthenticatedUser } from '../../../auth/jwt.strategy';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { JwtGuard } from '../../../auth/jwt.guard';
import { NotificationsService } from '../../application/services/notifications.service';
import { NotificationMapper } from '../mappers/notification.mapper';

@UseGuards(JwtGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const notifications = await this.notifications.findMany(user.id);
    return notifications.map(NotificationMapper.toResponse);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const notification = await this.notifications.markAsRead(id, user.id);
    return NotificationMapper.toResponse(notification);
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    await this.notifications.markAllAsRead(user.id);
    return { message: 'Notifications marked as read.' };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.notifications.delete(id, user.id);
    return { message: 'Notification deleted successfully.' };
  }
}
