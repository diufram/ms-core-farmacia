import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProfileType {
  @Field(() => Int)
  person_id!: number;

  @Field()
  first_name!: string;

  @Field()
  last_name!: string;

  @Field({ nullable: true })
  photo!: string | null;

  @Field(() => Int)
  user_id!: number;

  @Field()
  email!: string;

  @Field()
  username!: string;

  @Field(() => Int, { nullable: true })
  branch_id!: number | null;

  @Field({ nullable: true })
  branch_name!: string | null;

  @Field()
  is_verified!: boolean;
}

@ObjectType()
export class CheckUsernameResultType {
  @Field()
  available!: boolean;

  @Field({ nullable: true })
  message?: string;
}

@ObjectType()
export class MessageResultType {
  @Field()
  message!: string;
}
