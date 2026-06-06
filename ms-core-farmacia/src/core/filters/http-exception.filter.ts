import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

type ValidationErrorItem = {
  campo: string;
  codigo: string;
  mensaje: string;
};

type ExceptionResponseShape = {
  message?: unknown;
  error?: string;
  statusCode?: number;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Determinar el código de estado HTTP
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extraer la respuesta original de NestJS (útil para validaciones)
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    // 1. Manejo de Errores del Cliente (4XX) -> "fail"
    if (status >= 400 && status < 500) {
      const parsedException =
        typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as ExceptionResponseShape)
          : null;

      const erroresValidacion = this.mapValidationErrors(
        parsedException?.message,
        status,
      );

      const data =
        erroresValidacion.length > 0
          ? { errores_validacion: erroresValidacion }
          : this.buildClientErrorData(parsedException);

      const message =
        status === HttpStatus.UNPROCESSABLE_ENTITY
          ? 'Fallo en la validacion de la solicitud.'
          : parsedException?.error || 'Fallo en la peticion del cliente.';

      return response.status(status).json({
        status: 'fail',
        data,
        message,
      });
    }

    // 2. Manejo de Errores del Servidor (5XX) -> "error" [cite: 54, 58]
    // Generamos un ID de correlación único para buscar en logs [cite: 61, 65]
    const traceId = `T${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    console.error(`[${traceId}] Error Interno:`, exception);

    return response.status(status).json({
      status: 'error',
      code: `E${status}`,
      message:
        'Ha ocurrido un error inesperado. Por favor, contacte a soporte con el codigo de traza.',
      trace_id: traceId,
    });
  }

  private mapValidationErrors(
    rawMessage: unknown,
    status: number,
  ): ValidationErrorItem[] {
    if (!Array.isArray(rawMessage)) {
      return [];
    }

    return rawMessage.map((item, index) => {
      if (typeof item === 'string') {
        const firstToken = item.trim().split(' ')[0] || 'general';
        return {
          campo: firstToken,
          codigo: `E${status}-${index + 1}`,
          mensaje: item,
        };
      }

      if (typeof item === 'object' && item !== null) {
        const validationItem = item as {
          property?: string;
          constraints?: Record<string, string>;
        };

        const constraintMessage = validationItem.constraints
          ? Object.values(validationItem.constraints)[0]
          : 'Error de validacion.';

        return {
          campo: validationItem.property || 'general',
          codigo: `E${status}-${index + 1}`,
          mensaje: constraintMessage,
        };
      }

      return {
        campo: 'general',
        codigo: `E${status}-${index + 1}`,
        mensaje: 'Error de validacion.',
      };
    });
  }

  private buildClientErrorData(
    parsedException: ExceptionResponseShape | null,
  ): Record<string, unknown> {
    if (!parsedException) {
      return {};
    }

    if (typeof parsedException.message === 'string') {
      return {
        detalle: parsedException.message,
      };
    }

    return {};
  }
}
