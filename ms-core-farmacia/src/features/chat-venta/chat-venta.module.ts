import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../../database/entities/producto.entity';
import { Sucursal } from '../../database/entities/sucursal.entity';
import { Usuario } from '../../database/entities/usuario.entity';
import { UsuarioSucursal } from '../../database/entities/usuario-sucursal.entity';
import { Venta } from '../../database/entities/venta.entity';
import { VentaDetalle } from '../../database/entities/venta-detalle.entity';
import { EmailModule } from '../email/email.module';
import { ChatVentaController } from './chat-venta.controller';
import { ChatVentaService } from './chat-venta.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Sucursal, Usuario, UsuarioSucursal, Venta, VentaDetalle]),
    EmailModule,
  ],
  controllers: [ChatVentaController],
  providers: [ChatVentaService],
})
export class ChatVentaModule {}
