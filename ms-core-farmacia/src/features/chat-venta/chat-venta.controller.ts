import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BotApiKeyGuard } from '../../common/guards/bot-api-key.guard';
import { ChatVentaService } from './chat-venta.service';
import { BuscarProductoDto } from './dto/buscar-producto.dto';
import { CrearChatVentaDto } from './dto/crear-chat-venta.dto';
import { EnviarEmailVentaDto } from './dto/enviar-email-venta.dto';

@Controller('chat-venta')
@UseGuards(BotApiKeyGuard)
export class ChatVentaController {
  constructor(private readonly chatVentaService: ChatVentaService) {}

  @Get('buscar')
  async buscarProductos(@Query() query: BuscarProductoDto) {
    return this.chatVentaService.buscarProductos(query.q);
  }

  @Post('venta')
  async crearVenta(@Body() dto: CrearChatVentaDto) {
    return this.chatVentaService.crearVenta(dto);
  }

  @Post('email')
  async enviarEmailVenta(@Body() dto: EnviarEmailVentaDto) {
    return this.chatVentaService.enviarEmailVenta(dto.ventaId);
  }
}
