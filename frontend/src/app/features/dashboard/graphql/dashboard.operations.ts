import { gql } from 'apollo-angular';

export const DASHBOARD_KPIS_QUERY = gql`
    query DashboardKpis(
        $sucursalId: Int
        $fechaDesde: String
        $fechaHasta: String
        $stockBajoUmbral: Int
    ) {
        dashboardKpis(
            sucursalId: $sucursalId
            fechaDesde: $fechaDesde
            fechaHasta: $fechaHasta
            stockBajoUmbral: $stockBajoUmbral
        ) {
            totalVentas
            cantidadVentas
            totalProductos
            productosStockBajo
            totalClientes
            totalSucursales
            ventasPorSucursal {
                sucursal_id
                sucursal_nombre
                total
                cantidad
            }
            topProductos {
                producto_id
                nombre
                codigo
                cantidad_vendida
                total_vendido
            }
            ventasPorDia {
                fecha
                cantidad
                total
            }
            productosStockBajoList {
                id
                codigo
                nombre
                stock_actual
                sucursal_id
                sucursal_nombre
            }
        }
    }
`;
