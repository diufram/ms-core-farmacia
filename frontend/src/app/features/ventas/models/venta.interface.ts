export interface VentaDetalle {
    id: number;
    producto_id: number | null;
    producto_nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface Venta {
    id: number;
    numero_venta: string;
    fecha_venta: string;
    total: number;
    estado: string;
    sucursal_id: number | null;
    usuario_id: number | null;
    cliente_id: number | null;
    detalles: VentaDetalle[];
}

export interface VentaPayload {
    venta: Venta;
    message: string;
}

export interface VentaDetalleInput {
    productoId: number;
    cantidad: number;
    precioUnitario?: number | null;
}

export interface CreateVentaInput {
    sucursalId: number;
    clienteId?: number | null;
    detalles: VentaDetalleInput[];
}

export interface VentasFilters {
    sucursalId?: number | null;
    fechaDesde?: string | null;
    fechaHasta?: string | null;
}
