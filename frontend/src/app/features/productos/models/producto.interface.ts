export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  stock_actual: number;
  precio_venta: number;
  categoria_id: number;
  sucursal_id: number;
}

export interface ProductoPayload {
  producto: Producto;
  message: string;
}

export interface CreateProductoInput {
  codigo: string;
  nombre: string;
  stock_actual?: number;
  precio_venta: number;
  categoriaId: number;
}

export interface UpdateProductoInput {
  nombre?: string;
  stock_actual?: number;
  precio_venta?: number;
  categoriaId?: number;
}
