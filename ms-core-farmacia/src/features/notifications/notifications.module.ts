import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenDispositivo } from '../../database/entities/token-dispositivo.entity';

import { NotificationsRepository } from './notifications.repository';
import { NotificationsResolver } from './notifications.resolver';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenDispositivo]),
  ],
  providers: [NotificationsService, NotificationsRepository, NotificationsResolver],
  exports: [NotificationsService],
})
export class NotificationsModule {}
