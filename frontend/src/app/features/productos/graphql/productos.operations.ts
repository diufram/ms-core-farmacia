import { gql } from 'apollo-angular';

const PRODUCTO_FIELDS = `
    id
    codigo
    nombre
    stock_actual
    precio_venta
    categoria_id
    sucursal_id
`;

export const PRODUCTOS_QUERY = gql`
    query Productos($sucursalId: Int, $categoriaId: Int) {
        productos(sucursalId: $sucursalId, categoriaId: $categoriaId) {
            ${PRODUCTO_FIELDS}
        }
    }
`;

export const PRODUCTO_QUERY = gql`
    query Producto($id: Int!) {
        producto(id: $id) {
            ${PRODUCTO_FIELDS}
        }
    }
`;

export const CREATE_PRODUCTO_MUTATION = gql`
    mutation CreateProducto($input: CreateProductoDto!) {
        createProducto(input: $input) {
            message
            producto {
                ${PRODUCTO_FIELDS}
            }
        }
    }
`;

export const UPDATE_PRODUCTO_MUTATION = gql`
    mutation UpdateProducto($id: Int!, $input: UpdateProductoDto!) {
        updateProducto(id: $id, input: $input) {
            ${PRODUCTO_FIELDS}
        }
    }
`;

export const DELETE_PRODUCTO_MUTATION = gql`
    mutation DeleteProducto($id: Int!) {
        deleteProducto(id: $id) {
            message
            producto {
                id
                nombre
            }
        }
    }
`;
