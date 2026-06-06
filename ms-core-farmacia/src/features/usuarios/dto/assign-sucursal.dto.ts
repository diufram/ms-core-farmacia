import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { RolSucursal } from '../../../database/entities/usuario-sucursal.entity';

@InputType()
export class AssignSucursalDto {
  @ApiProperty({ example: 1 })
  @Field(() => Int)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  sucursalId!: number;

  @ApiProperty({ enum: RolSucursal, example: RolSucursal.ADMIN })
  @Field(() => String)
  @IsEnum(RolSucursal)
  rol!: RolSucursal;
}
