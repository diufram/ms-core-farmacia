import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LogoutDto } from './dto/logout.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  AuthPayloadType,
  LogoutPayloadType,
  MePayloadType,
} from './graphql/auth.types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayloadType)
  login(@Args('input') input: LoginDto) {
    return this.authService.login(input);
  }

  @Mutation(() => AuthPayloadType)
  refresh(@Args('input') input: RefreshTokenDto) {
    return this.authService.refresh(input);
  }

  @Mutation(() => LogoutPayloadType)
  logout(@Args('input') input: LogoutDto) {
    return this.authService.logout(input);
  }

  @Query(() => MePayloadType)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user);
  }
}
