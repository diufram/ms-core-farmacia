import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../../database/entities/cliente.entity';
import { Producto } from '../../database/entities/producto.entity';
import { Sucursal } from '../../database/entities/sucursal.entity';
import { Venta } from '../../database/entities/venta.entity';
import { VentaDetalle } from '../../database/entities/venta-detalle.entity';
import { DashboardRepository } from './dashboard.repository';
import { DashboardResolver } from './dashboard.resolver';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta,
      VentaDetalle,
      Producto,
      Cliente,
      Sucursal,
    ]),
  ],
  providers: [DashboardService, DashboardRepository, DashboardResolver],
})
export class DashboardModule {}
