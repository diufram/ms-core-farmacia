import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { DashboardService } from './dashboard.service';
import { DashboardKpisType } from './graphql/dashboard.types';

@Resolver()
@UseGuards(JwtAuthGuard)
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => DashboardKpisType)
  dashboardKpis(
    @CurrentUser() user: JwtPayload,
    @Args('sucursalId', { type: () => Int, nullable: true })
    sucursalId: number | null,
    @Args('fechaDesde', { type: () => String, nullable: true })
    fechaDesde: string | null,
    @Args('fechaHasta', { type: () => String, nullable: true })
    fechaHasta: string | null,
    @Args('stockBajoUmbral', { type: () => Int, nullable: true })
    stockBajoUmbral: number | null,
  ) {
    return this.dashboardService.getKpis(user.rol, user.sucursal_id, {
      sucursalId: sucursalId ?? undefined,
      fechaDesde: fechaDesde ?? undefined,
      fechaHasta: fechaHasta ?? undefined,
      stockBajoUmbral: stockBajoUmbral ?? undefined,
    });
  }
}
