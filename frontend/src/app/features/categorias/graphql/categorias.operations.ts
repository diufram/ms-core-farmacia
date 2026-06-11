import { gql } from 'apollo-angular';

const CATEGORIA_FIELDS = `
    id
    nombre
    codigo
    sucursal_id
`;

export const CATEGORIAS_QUERY = gql`
    query Categorias($sucursalId: Int) {
        categorias(sucursalId: $sucursalId) {
            ${CATEGORIA_FIELDS}
        }
    }
`;

export const CATEGORIA_QUERY = gql`
    query Categoria($id: Int!) {
        categoria(id: $id) {
            ${CATEGORIA_FIELDS}
        }
    }
`;

export const CREATE_CATEGORIA_MUTATION = gql`
    mutation CreateCategoria($input: CreateCategoriaDto!) {
        createCategoria(input: $input) {
            message
            categoria {
                ${CATEGORIA_FIELDS}
            }
        }
    }
`;

export const UPDATE_CATEGORIA_MUTATION = gql`
    mutation UpdateCategoria($id: Int!, $input: UpdateCategoriaDto!) {
        updateCategoria(id: $id, input: $input) {
            ${CATEGORIA_FIELDS}
        }
    }
`;

export const DELETE_CATEGORIA_MUTATION = gql`
  mutation DeleteCategoria($id: Int!) {
    deleteCategoria(id: $id) {
      message
      categoria {
        id
        nombre
      }
    }
  }
`;
