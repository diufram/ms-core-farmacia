import { gql } from 'apollo-angular';

const VENTA_DETALLE_FIELDS = `
    id
    producto_id
    producto_nombre
    cantidad
    precio_unitario
    subtotal
`;

const VENTA_FIELDS = `
    id
    numero_venta
    fecha_venta
    total
    estado
    sucursal_id
    usuario_id
    cliente_walk_in
    cliente_walk_in
    cliente_nombre
    cliente_celular
    cliente_codigo
    detalles {
        ${VENTA_DETALLE_FIELDS}
    }
`;

export const VENTAS_QUERY = gql`
    query Ventas($sucursalId: Int, $fechaDesde: String, $fechaHasta: String) {
        ventas(sucursalId: $sucursalId, fechaDesde: $fechaDesde, fechaHasta: $fechaHasta) {
            ${VENTA_FIELDS}
        }
    }
`;

export const VENTA_QUERY = gql`
    query Venta($id: Int!) {
        venta(id: $id) {
            ${VENTA_FIELDS}
        }
    }
`;

export const CREATE_VENTA_MUTATION = gql`
    mutation CreateVenta($input: CreateVentaDto!) {
        createVenta(input: $input) {
            message
            venta {
                ${VENTA_FIELDS}
            }
        }
    }
`;

export const CAMBIAR_ESTADO_VENTA_MUTATION = gql`
    mutation CambiarEstadoVenta($id: Int!, $nuevoEstado: String!) {
        cambiarEstadoVenta(id: $id, nuevoEstado: $nuevoEstado) {
            message
            venta {
                ${VENTA_FIELDS}
            }
        }
    }
`;

export const DELETE_VENTA_MUTATION = gql`
    mutation DeleteVenta($id: Int!) {
        deleteVenta(id: $id) {
            message
            venta {
                id
                numero_venta
            }
        }
    }
`;
