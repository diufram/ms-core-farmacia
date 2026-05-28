import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const gqlRequest = GqlExecutionContext.create(ctx).getContext<{ req?: { user: JwtPayload } }>()
      .req;
    const request = gqlRequest ?? ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
