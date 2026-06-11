import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenDispositivo } from '../../database/entities/token-dispositivo.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsResolver } from './notifications.resolver';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenDispositivo]),
    AuthModule,
  ],
  providers: [NotificationsService, NotificationsRepository, NotificationsResolver],
  exports: [NotificationsService],
})
export class NotificationsModule {}
