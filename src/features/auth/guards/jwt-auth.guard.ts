import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext<{
      req?: unknown;
    }>();
    return gqlContext.req ?? context.switchToHttp().getRequest();
  }
}
