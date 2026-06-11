import { gql } from 'apollo-angular';

const PERSONA_FIELDS = `
    id
    nombre
    apellido
    celular
`;

const SUCURSAL_SIMPLE_FIELDS = `
    id
    nombre
`;

const ASIGNACION_FIELDS = `
    id
    sucursal {
        ${SUCURSAL_SIMPLE_FIELDS}
    }
    activo
`;

const USUARIO_FIELDS = `
    id
    nombre_usuario
    correo_electronico
    rol
    persona {
        ${PERSONA_FIELDS}
    }
    asignaciones {
        ${ASIGNACION_FIELDS}
    }
`;

export const USUARIOS_QUERY = gql`
    query Usuarios($sucursalId: Int, $rol: String) {
        usuarios(sucursalId: $sucursalId, rol: $rol) {
            ${USUARIO_FIELDS}
        }
    }
`;

export const USUARIO_QUERY = gql`
    query Usuario($id: Int!) {
        usuario(id: $id) {
            ${USUARIO_FIELDS}
        }
    }
`;

export const CREATE_USUARIO_MUTATION = gql`
    mutation CreateUsuario($input: CreateUsuarioDto!) {
        createUsuario(input: $input) {
            message
            usuario {
                ${USUARIO_FIELDS}
            }
        }
    }
`;

export const UPDATE_USUARIO_MUTATION = gql`
    mutation UpdateUsuario($id: Int!, $input: UpdateUsuarioDto!) {
        updateUsuario(id: $id, input: $input) {
            message
            usuario {
                ${USUARIO_FIELDS}
            }
        }
    }
`;

export const DELETE_USUARIO_MUTATION = gql`
  mutation DeleteUsuario($id: Int!) {
    deleteUsuario(id: $id) {
      message
    }
  }
`;

export const ASSIGN_USUARIO_SUCURSAL_MUTATION = gql`
    mutation AssignUsuarioSucursal(
        $usuarioId: Int!
        $input: AssignSucursalDto!
    ) {
        assignUsuarioSucursal(usuarioId: $usuarioId, input: $input) {
            message
            usuario {
                ${USUARIO_FIELDS}
            }
        }
    }
`;

export const UNASSIGN_USUARIO_SUCURSAL_MUTATION = gql`
    mutation UnassignUsuarioSucursal($usuarioId: Int!, $sucursalId: Int!) {
        unassignUsuarioSucursal(
            usuarioId: $usuarioId
            sucursalId: $sucursalId
        ) {
            message
            usuario {
                ${USUARIO_FIELDS}
            }
        }
    }
`;

export const ADMIN_RESET_PASSWORD_MUTATION = gql`
  mutation AdminResetUsuarioPassword($id: Int!, $input: AdminResetPasswordDto!) {
    adminResetUsuarioPassword(id: $id, input: $input) {
      message
    }
  }
`;
