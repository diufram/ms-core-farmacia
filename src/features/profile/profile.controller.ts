import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CheckUsernameDto } from './dto/check-username.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.profileService.getProfile(user.sub);
  }

  @Put('username')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar nombre de usuario' })
  @ApiResponse({ status: 200, description: 'Username actualizado correctamente' })
  @ApiResponse({ status: 401, description: 'Contraseña incorrecta' })
  @ApiResponse({ status: 409, description: 'Nombre de usuario ya en uso' })
  updateUsername(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUsernameDto,
  ) {
    return this.profileService.updateUsername(user.sub, dto);
  }

  @Put('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente' })
  @ApiResponse({ status: 401, description: 'Contraseña actual incorrecta' })
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(user.sub, dto);
  }

  @Get('check-username')
  @ApiOperation({ summary: 'Verificar disponibilidad de nombre de usuario' })
  @ApiResponse({ status: 200, description: 'Disponibilidad verificada' })
  checkUsername(@Query() dto: CheckUsernameDto) {
    return this.profileService.checkUsername(dto);
  }
}