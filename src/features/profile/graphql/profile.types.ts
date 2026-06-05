import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProfileType {
  @Field(() => Int)
  person_id!: number;

  @Field()
  first_name!: string;

  @Field()
  last_name!: string;

  @Field(() => Int)
  user_id!: number;

  @Field()
  email!: string;

  @Field()
  username!: string;

  @Field(() => Int, { nullable: true })
  branch_id!: number | null;

  @Field(() => String, { nullable: true })
  branch_name!: string | null;
}

@ObjectType()
export class CheckUsernameResultType {
  @Field()
  available!: boolean;

  @Field(() => String, { nullable: true })
  message?: string;
}

@ObjectType()
export class MessageResultType {
  @Field()
  message!: string;
}
