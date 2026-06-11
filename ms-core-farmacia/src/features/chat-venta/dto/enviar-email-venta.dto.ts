import { IsInt, Min } from 'class-validator';

export class EnviarEmailVentaDto {
  @IsInt()
  @Min(1)
  ventaId!: number;
}
