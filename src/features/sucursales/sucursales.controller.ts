import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolGlobal } from '../../database/entities/usuario.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { SucursalesService } from './sucursales.service';

@ApiTags('Sucursales')
@Controller('sucursales')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class SucursalesController {
  constructor(private readonly sucursalesService: SucursalesService) {}

  @Get()
  @Roles(RolGlobal.SUPER_ADMIN)
  @ApiOperation({ summary: 'Listar sucursales del sistema' })
  @ApiResponse({ status: 200, description: 'Sucursales obtenidas correctamente' })
  findAll() {
    return this.sucursalesService.findAll();
  }

  @Get(':id')
  @Roles(RolGlobal.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener una sucursal por id' })
  @ApiResponse({ status: 200, description: 'Sucursal obtenida correctamente' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sucursalesService.findOne(id);
  }

  @Post()
  @Roles(RolGlobal.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crear sucursal y su admin inicial' })
  @ApiResponse({ status: 201, description: 'Sucursal creada correctamente' })
  @ApiResponse({ status: 409, description: 'Conflicto de datos unicos' })
  create(@Body() dto: CreateSucursalDto) {
    return this.sucursalesService.create(dto);
  }
}
