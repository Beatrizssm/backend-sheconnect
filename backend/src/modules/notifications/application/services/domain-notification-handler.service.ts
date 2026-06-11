import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { DomainEventMessage, EVENT_BUS, EventBusPort } from '../../../../application/ports/event-bus.port';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { NotificationsService } from './notifications.service';

type NotificationCommand = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
};

@Injectable()
export class DomainNotificationHandlerService implements OnModuleInit {
  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.eventBus.registerConsumer((event) => this.handle(event));
  }

  private async handle(event: DomainEventMessage): Promise<void> {
    const commands = await this.toNotificationCommands(event);
    await Promise.all(commands.map((command) => this.notifications.create(command)));
  }

  private async toNotificationCommands(event: DomainEventMessage): Promise<NotificationCommand[]> {
    switch (event.eventType) {
      case 'USER_REGISTERED':
        return this.forUser(event.userId, {
          title: 'Bem-vinda ao SheConnect!',
          message: 'Seu cadastro foi criado com sucesso. Explore mentorias, startups e conexões.',
          type: NotificationType.SUCCESS,
        });
      case 'STARTUP_CREATED':
      case 'startup_created':
        return this.forUser(event.userId, {
          title: 'Startup cadastrada',
          message: 'Sua startup foi cadastrada com sucesso.',
          type: NotificationType.SUCCESS,
        });
      case 'MENTORSHIP_REQUESTED':
      case 'mentorship_requested':
      case 'MENTORSHIP_CREATED':
        return this.forUser(this.getString(event.payload.mentorId), {
          title: 'Nova solicitação de mentoria',
          message: 'Você recebeu uma nova solicitação de mentoria.',
          type: NotificationType.INFO,
        });
      case 'MENTORSHIP_ACCEPTED':
        return this.forUser(this.getString(event.payload.entrepreneurId), {
          title: 'Mentoria aceita',
          message: 'Sua solicitação de mentoria foi aceita.',
          type: NotificationType.SUCCESS,
        });
      case 'MENTORSHIP_REJECTED':
        return this.forUser(this.getString(event.payload.entrepreneurId), {
          title: 'Mentoria rejeitada',
          message: 'Sua solicitação de mentoria foi rejeitada.',
          type: NotificationType.WARNING,
        });
      case 'MENTORSHIP_COMPLETED':
        return [
          ...this.forUser(this.getString(event.payload.entrepreneurId), {
            title: 'Mentoria concluída',
            message: 'Sua mentoria foi concluída com sucesso.',
            type: NotificationType.SUCCESS,
          }),
          ...this.forUser(this.getString(event.payload.mentorId), {
            title: 'Mentoria concluída',
            message: 'A mentoria foi concluída com sucesso.',
            type: NotificationType.SUCCESS,
          }),
        ];
      case 'EVENT_CREATED':
        return this.forAllUsers({
          title: 'Novo evento disponível',
          message: `${this.getString(event.payload.title) ?? 'Um novo evento'} foi publicado no SheConnect.`,
          type: NotificationType.INFO,
        });
      case 'EVENT_REGISTERED':
        return this.forUser(this.getString(event.payload.organizerId), {
          title: 'Nova inscrição no evento',
          message: `Uma usuária se inscreveu em ${this.getString(event.payload.eventTitle) ?? 'seu evento'}.`,
          type: NotificationType.INFO,
        });
      case 'USER_CONNECTED':
        return [
          ...this.forUser(this.getString(event.payload.requesterId), {
            title: 'Conexão criada',
            message: 'Sua rede SheConnect ganhou uma nova conexão.',
            type: NotificationType.SUCCESS,
          }),
          ...this.forUser(this.getString(event.payload.receiverId), {
            title: 'Nova conexão',
            message: 'Você tem uma nova conexão na SheConnect.',
            type: NotificationType.SUCCESS,
          }),
        ];
      case 'EVENT_UNREGISTERED':
        return this.forUser(this.getString(event.payload.organizerId), {
          title: 'Inscrição cancelada',
          message: `Uma usuária cancelou a inscrição em ${this.getString(event.payload.eventTitle) ?? 'seu evento'}.`,
          type: NotificationType.SUCCESS,
        });
      case 'NEW_MESSAGE':
        return this.forUser(this.getString(event.payload.receiverId), {
          title: 'Nova mensagem',
          message: 'Você recebeu uma nova mensagem no chat.',
          type: NotificationType.INFO,
        });
      default:
        return [];
    }
  }

  private forUser(
    userId: string | undefined,
    notification: Omit<NotificationCommand, 'userId'>,
  ): NotificationCommand[] {
    if (!userId) {
      return [];
    }

    return [{ userId, ...notification }];
  }

  private async forAllUsers(notification: Omit<NotificationCommand, 'userId'>): Promise<NotificationCommand[]> {
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    return users.map((user) => ({ userId: user.id, ...notification }));
  }

  private getString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }
}
