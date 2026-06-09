export interface Persona {
    id: number;
    nombre: string;
    apellido: string;
    celular: string | null;
}

export interface Cliente {
    id: number;
    codigo_cliente: string;
    sucursal_id: number;
    persona: Persona;
}

export interface ClientePayload {
    cliente: Cliente;
    message: string;
}

export interface PersonaInput {
    nombre: string;
    apellido: string;
    celular?: string | null;
}

export interface CreateClienteInput {
    codigo_cliente: string;
    sucursalId: number;
    persona: PersonaInput;
}

export interface UpdateClienteInput {
    codigo_cliente?: string;
    persona?: PersonaInput;
}

export interface ClientesFilters {
    sucursalId?: number | null;
}
