import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: string;
  data: T;
  message?: string;
}

type ResponseWithMessage = {
  message?: string;
  [key: string]: unknown;
};

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        let message: string | undefined;
        let payload = data;

        if (data && typeof data === 'object' && 'message' in data) {
          const responseData = data as ResponseWithMessage;
          if (typeof responseData.message === 'string') {
            message = responseData.message;
          }

          const { message: _message, ...rest } = responseData;
          payload = rest as T;
        }

        return {
          status: 'success',
          data: (payload ?? {}) as T,
          ...(message ? { message } : {}),
        };
      }),
    );
  }
}
