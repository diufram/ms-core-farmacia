import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MlModelStatusType {
  @Field()
  cargado!: boolean;

  @Field(() => Int)
  categoriasEntrenadas!: number;

  @Field(() => Float, { nullable: true })
  oobAccuracy!: number | null;

  @Field(() => String, { nullable: true })
  fechaEntrenamiento!: string | null;
}
