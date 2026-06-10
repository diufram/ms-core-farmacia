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

export interface TopCliente {
    cliente_nombre: string | null;
    cliente_codigo: string | null;
    cantidad_ventas: number;
    total_comprado: number;
}

export interface ProductoSinMovimiento {
    id: number;
    codigo: string;
    nombre: string;
    stock_actual: number;
    categoria_nombre: string;
    dias_sin_venta: number;
}

export interface RiesgoCategoria {
    categoria_id: number;
    categoria_nombre: string;
    total_productos: number;
    productos_stock_bajo: number;
    ventas_periodo: number;
    score_riesgo: number;
}

export interface DashboardKpis {
    totalVentas: number;
    cantidadVentas: number;
    totalProductos: number;
    productosStockBajo: number;
    totalSucursales: number;
    ventasPorSucursal: VentasPorSucursal[];
    topProductos: TopProducto[];
    ventasPorDia: VentasPorDia[];
    productosStockBajoList: ProductoStockBajo[];
    topClientes: TopCliente[];
    productosSinMovimiento: ProductoSinMovimiento[];
    riesgoPorCategoria: RiesgoCategoria[];
}
