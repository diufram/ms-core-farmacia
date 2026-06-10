import { gql } from 'apollo-angular';

const USUARIO_FIELDS = `
    id
    nombre_usuario
    correo_electronico
    rol
    sucursal {
        id
        nombre
        slug
    }
    sucursal_id
`;

const AUTH_PAYLOAD_FIELDS = `
    access_token
    refresh_token
    message
    usuario {
        ${USUARIO_FIELDS}
    }
`;

export const LOGIN_MUTATION = gql`
    mutation Login($input: LoginDto!) {
        login(input: $input) {
            ${AUTH_PAYLOAD_FIELDS}
        }
    }
`;

export const REFRESH_MUTATION = gql`
    mutation Refresh($input: RefreshTokenDto!) {
        refresh(input: $input) {
            ${AUTH_PAYLOAD_FIELDS}
        }
    }
`;

export const LOGOUT_MUTATION = gql`
    mutation Logout($input: LogoutDto!) {
        logout(input: $input) {
            message
        }
    }
`;

export const ME_QUERY = gql`
    query Me {
        me {
            usuario {
                ${USUARIO_FIELDS}
            }
        }
    }
`;
