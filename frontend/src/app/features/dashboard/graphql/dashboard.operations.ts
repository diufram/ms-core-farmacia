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
            topClientes {
                cliente_nombre
                cliente_codigo
                cantidad_ventas
                total_comprado
            }
            productosSinMovimiento {
                id
                codigo
                nombre
                stock_actual
                categoria_nombre
                dias_sin_venta
            }
            riesgoPorCategoria {
                categoria_id
                categoria_nombre
                total_productos
                productos_stock_bajo
                ventas_periodo
                score_riesgo
            }
        }
    }
`;
