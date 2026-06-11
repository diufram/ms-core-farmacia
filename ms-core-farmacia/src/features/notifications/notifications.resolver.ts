import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { RegistrarTokenDispositivoInput } from './dto/registrar-token-dispositivo.input';
import { TokenDispositivoType } from './graphql/notifications.types';
import { NotificationsService } from './notifications.service';

@Resolver()
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Mutation(() => TokenDispositivoType)
  @UseGuards(JwtAuthGuard)
  async registrarTokenDispositivo(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: RegistrarTokenDispositivoInput,
  ): Promise<TokenDispositivoType> {
    const guardado = await this.notificationsService.registrarToken(user.sub, input.token);
    return {
      id: guardado.id,
      token: guardado.token,
      usuarioId: guardado.usuario.id,
      createdAt: guardado.createdAt,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async eliminarTodosMisTokens(@CurrentUser() user: JwtPayload): Promise<boolean> {
    await this.notificationsService.desregistrarTodosTokens(user.sub);
    return true;
  }

  @Query(() => [TokenDispositivoType])
  @UseGuards(JwtAuthGuard)
  async misDispositivos(@CurrentUser() user: JwtPayload): Promise<TokenDispositivoType[]> {
    const tokens = await this.notificationsService.obtenerTokens(user.sub);
    return tokens.map((t) => ({
      id: t.id,
      token: t.token,
      usuarioId: t.usuario.id,
      createdAt: t.createdAt,
    }));
  }
}
