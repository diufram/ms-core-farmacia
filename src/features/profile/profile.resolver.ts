import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CheckUsernameDto } from './dto/check-username.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import {
  CheckUsernameResultType,
  MessageResultType,
  ProfileType,
} from './graphql/profile.types';
import { ProfileService } from './profile.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => ProfileType)
  profile(@CurrentUser() user: JwtPayload) {
    return this.profileService.getProfile(user.sub);
  }

  @Mutation(() => ProfileType)
  updateUsername(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: UpdateUsernameDto,
  ) {
    return this.profileService.updateUsername(user.sub, input);
  }

  @Mutation(() => MessageResultType)
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(user.sub, input);
  }

  @Query(() => CheckUsernameResultType)
  checkUsername(@Args('input') input: CheckUsernameDto) {
    return this.profileService.checkUsername(input);
  }
}
