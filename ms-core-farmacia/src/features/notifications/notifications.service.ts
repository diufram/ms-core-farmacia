import { Injectable, Logger } from '@nestjs/common';
import { TokenDispositivo } from '../../database/entities/token-dispositivo.entity';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  /**
   * Registra (o reasigna) un token de dispositivo para un usuario.
   * Si el token ya existe con el mismo usuario, no hace nada.
   * Si existe con otro usuario, lo reasigna.
   * Si no existe, lo crea.
   */
  async registrarToken(
    usuarioId: number,
    token: string,
  ): Promise<TokenDispositivo> {
    const guardado = await this.notificationsRepository.registrar(
      usuarioId,
      token,
    );
    this.logger.log(
      `Token registrado para usuario ${usuarioId}: ${guardado.id}`,
    );
    return guardado;
  }

  /**
   * Elimina TODOS los tokens de dispositivo de un usuario.
   * Útil para logout forzado o limpieza de cuenta.
   */
  async desregistrarTodosTokens(usuarioId: number): Promise<void> {
    await this.notificationsRepository.eliminarTodosDeUsuario(usuarioId);
    this.logger.log(`Todos los tokens eliminados para usuario ${usuarioId}`);
  }

  /**
   * Devuelve todos los tokens registrados de un usuario.
   */
  async obtenerTokens(usuarioId: number): Promise<TokenDispositivo[]> {
    return this.notificationsRepository.obtenerTokensDeUsuario(usuarioId);
  }

  /**
   * Envía un push a todos los dispositivos registrados de un usuario.
   */
  async sendPushToUser(
    usuarioId: number,
    title: string,
    body: string,
    data: any = {},
  ): Promise<{ enviados: number; fallidos: number }> {
    const tokens = await this.notificationsRepository.obtenerTokensDeUsuario(
      usuarioId,
    );
    if (tokens.length === 0) {
      this.logger.warn(`No hay tokens registrados para usuario ${usuarioId}`);
      return { enviados: 0, fallidos: 0 };
    }
    let enviados = 0;
    let fallidos = 0;
    for (const t of tokens) {
      const ok = await this.sendPushNotification(t.token, title, body, data);
      if (ok) enviados++;
      else fallidos++;
    }
    return { enviados, fallidos };
  }

  /**
   * Sends a push notification to an Expo app.
   * @param token The Expo Push Token (e.g. ExponentPushToken[...])
   * @param title The title of the notification
   * @param body The main text body of the notification
   * @param data Optional JSON payload to send with the notification
   */
  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data: any = {},
  ) {
    this.logger.log(`Sending push notification to ${token}`);

    if (!token || !token.startsWith('ExponentPushToken')) {
      this.logger.warn('Invalid Expo Push Token provided.');
      return false;
    }

    const message = {
      to: token,
      sound: 'default',
      title,
      body,
      data,
    };

    try {
      const response = await fetch(this.EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const responseData = await response.json();

      if (!response.ok) {
        this.logger.error(
          `Failed to send notification: ${JSON.stringify(responseData)}`,
        );
        return false;
      }

      this.logger.log(
        `Successfully pushed notification: ${JSON.stringify(responseData)}`,
      );
      return true;
    } catch (error: any) {
      this.logger.error(`Network error sending notification: ${error.message}`);
      return false;
    }
  }
}

