export interface VentasPorSucursal {
    sucursal_id: number;
    sucursal_nombre: string;
    total: number;
    cantidad: number;
}

export interface TopProducto {
    producto_id: number;
    nombre: string;
    codigo: string;
    cantidad_vendida: number;
    total_vendido: number;
}

export interface VentasPorDia {
    fecha: string;
    cantidad: number;
    total: number;
}

export interface ProductoStockBajo {
    id: number;
    codigo: string;
    nombre: string;
    stock_actual: number;
    sucursal_id: number;
    sucursal_nombre: string;
}

export interface DashboardKpis {
    totalVentas: number;
    cantidadVentas: number;
    totalProductos: number;
    productosStockBajo: number;
    totalClientes: number;
    totalSucursales: number;
    ventasPorSucursal: VentasPorSucursal[];
    topProductos: TopProducto[];
    ventasPorDia: VentasPorDia[];
    productosStockBajoList: ProductoStockBajo[];
}
