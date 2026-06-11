export interface Categoria {
  id: number;
  nombre: string;
  codigo: string;
  sucursal_id?: number | null;
}

export interface CategoriaPayload {
  categoria: Categoria;
  message: string;
}

export interface CreateCategoriaInput {
  nombre: string;
  codigo: string;
  sucursalId: number;
}

export interface UpdateCategoriaInput {
  nombre?: string;
  codigo?: string;
}
