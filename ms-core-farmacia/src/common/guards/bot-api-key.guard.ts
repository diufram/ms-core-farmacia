import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BotApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-bot-api-key'];
    const expectedApiKey = process.env.BOT_API_KEY;

    if (!expectedApiKey) {
      throw new UnauthorizedException('BOT_API_KEY no está configurado en el servidor.');
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      throw new UnauthorizedException('API Key inválida o no proporcionada.');
    }

    return true;
  }
}
