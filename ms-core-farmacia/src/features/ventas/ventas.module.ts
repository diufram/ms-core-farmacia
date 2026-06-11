import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../../database/entities/producto.entity';
import { Venta } from '../../database/entities/venta.entity';
import { VentasRepository } from './ventas.repository';
import { VentasResolver } from './ventas.resolver';
import { VentasService } from './ventas.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, Producto]),
    NotificationsModule,
  ],
  providers: [VentasService, VentasRepository, VentasResolver],
})
export class VentasModule {}
