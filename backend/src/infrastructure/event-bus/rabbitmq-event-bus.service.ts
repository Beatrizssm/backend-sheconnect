import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMqService } from '../messaging/rabbitmq.service';

@Injectable()
export class RabbitMqEventBusService extends RabbitMqService {
  constructor(configService: ConfigService) {
    super(configService);
  }
}
