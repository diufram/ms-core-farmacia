import { gql } from 'apollo-angular';

const PERSONA_FIELDS = `
    id
    nombre
    apellido
    celular
`;

const CLIENTE_FIELDS = `
    id
    codigo_cliente
    sucursal_id
    persona {
        ${PERSONA_FIELDS}
    }
`;

export const CLIENTES_QUERY = gql`
    query Clientes($sucursalId: Int) {
        clientes(sucursalId: $sucursalId) {
            ${CLIENTE_FIELDS}
        }
    }
`;

export const CLIENTE_QUERY = gql`
    query Cliente($id: Int!) {
        cliente(id: $id) {
            ${CLIENTE_FIELDS}
        }
    }
`;

export const CREATE_CLIENTE_MUTATION = gql`
    mutation CreateCliente($input: CreateClienteDto!) {
        createCliente(input: $input) {
            message
            cliente {
                ${CLIENTE_FIELDS}
            }
        }
    }
`;

export const UPDATE_CLIENTE_MUTATION = gql`
    mutation UpdateCliente($id: Int!, $input: UpdateClienteDto!) {
        updateCliente(id: $id, input: $input) {
            ${CLIENTE_FIELDS}
        }
    }
`;

export const DELETE_CLIENTE_MUTATION = gql`
    mutation DeleteCliente($id: Int!) {
        deleteCliente(id: $id) {
            message
            cliente {
                id
                codigo_cliente
            }
        }
    }
`;
