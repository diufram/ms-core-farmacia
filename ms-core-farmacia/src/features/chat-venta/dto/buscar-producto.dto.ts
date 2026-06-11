import { IsString, MinLength } from 'class-validator';

export class BuscarProductoDto {
  @IsString()
  @MinLength(1)
  q!: string;
}
