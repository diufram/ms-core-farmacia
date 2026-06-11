import { Injectable, inject } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { DASHBOARD_KPIS_QUERY } from '../graphql/dashboard.operations';
import { DashboardKpis } from '../models/dashboard.interface';

export interface DashboardKpisFilters {
  sucursalId?: number | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  stockBajoUmbral?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apollo = inject(Apollo);

  getKpis(filters: DashboardKpisFilters = {}): Observable<DashboardKpis> {
    return this.apollo
      .watchQuery<{ dashboardKpis: DashboardKpis }>({
        query: DASHBOARD_KPIS_QUERY,
        variables: {
          sucursalId: filters.sucursalId ?? null,
          fechaDesde: filters.fechaDesde ?? null,
          fechaHasta: filters.fechaHasta ?? null,
          stockBajoUmbral: filters.stockBajoUmbral ?? null
        },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map((res) => {
          if (res.errors && res.errors.length) {
            throw new Error(res.errors[0].message);
          }

          return res.data!.dashboardKpis;
        })
      );
  }

  refetch(
    filters: DashboardKpisFilters
  ): QueryRef<{ dashboardKpis: DashboardKpis }, DashboardKpisFilters> {
    return this.apollo.watchQuery<{ dashboardKpis: DashboardKpis }, DashboardKpisFilters>({
      query: DASHBOARD_KPIS_QUERY,
      variables: {
        sucursalId: filters.sucursalId ?? null,
        fechaDesde: filters.fechaDesde ?? null,
        fechaHasta: filters.fechaHasta ?? null,
        stockBajoUmbral: filters.stockBajoUmbral ?? null
      },
      fetchPolicy: 'network-only'
    });
  }
}
