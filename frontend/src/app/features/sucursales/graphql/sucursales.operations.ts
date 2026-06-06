import { gql } from 'apollo-angular';

const SUCURSAL_FIELDS = `
    id
    nombre
    slug
    telefono
    direccion
    ciudad
    latitud
    longitud
    logo
`;

const SUCURSAL_ADMIN_FIELDS = `
    id
    nombre_usuario
    correo_electronico
    rol
`;

export const SUCURSALES_QUERY = gql`
    query Sucursales {
        sucursales {
            ${SUCURSAL_FIELDS}
        }
    }
`;

export const SUCURSAL_QUERY = gql`
    query Sucursal($id: Int!) {
        sucursal(id: $id) {
            ${SUCURSAL_FIELDS}
        }
    }
`;

export const CREATE_SUCURSAL_MUTATION = gql`
    mutation CreateSucursal($input: CreateSucursalDto!) {
        createSucursal(input: $input) {
            message
            sucursal {
                ${SUCURSAL_FIELDS}
            }
            admin {
                ${SUCURSAL_ADMIN_FIELDS}
            }
        }
    }
`;

export const UPDATE_SUCURSAL_MUTATION = gql`
    mutation UpdateSucursal($id: Int!, $input: UpdateSucursalDto!) {
        updateSucursal(id: $id, input: $input) {
            message
            sucursal {
                ${SUCURSAL_FIELDS}
            }
        }
    }
`;

export const DELETE_SUCURSAL_MUTATION = gql`
    mutation DeleteSucursal($id: Int!) {
        deleteSucursal(id: $id) {
            message
            sucursal {
                id
                nombre
            }
        }
    }
`;
