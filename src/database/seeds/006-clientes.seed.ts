import { Cliente, EstadoCliente } from '../entities/cliente.entity';
import { Persona } from '../entities/persona.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const CLIENTES = [
  {
    codigo: 'CLI-0001',
    nombre: 'Carlos',
    apellido: 'Rojas',
    documento: '7845123',
    correo: 'carlos.rojas@clientes.local',
    celular: '76000001',
  },
  {
    codigo: 'CLI-0002',
    nombre: 'Maria',
    apellido: 'Luna',
    documento: '8451236',
    correo: 'maria.luna@clientes.local',
    celular: '76000002',
  },
];

export const clientesSeed: Seed = {
  order: 6,
  name: '006-clientes',
  run: async () => {
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const personaRepository = seedDataSource.getRepository(Persona);
    const clienteRepository = seedDataSource.getRepository(Cliente);

    const sucursal = await sucursalRepository.findOne({ where: { slug: 'sucursal-central' } });
    if (!sucursal) {
      console.log('- No existe sucursal-central, seed de clientes omitido.');
      return;
    }

    for (const item of CLIENTES) {
      const existing = await clienteRepository.findOne({
        where: { sucursal: { id: sucursal.id }, codigo_cliente: item.codigo },
      });
      if (existing) {
        continue;
      }

      const persona = personaRepository.create({
        nombre: item.nombre,
        apellido: item.apellido,
        celular: item.celular,
      });
      const personaGuardada = await personaRepository.save(persona);

      await clienteRepository.save(
        clienteRepository.create({
          sucursal,
          persona: personaGuardada,
          codigo_cliente: item.codigo,
          telefono_secundario: null,
          observaciones: null,
          estado: EstadoCliente.ACTIVO,
        }),
      );
    }

    console.log('- Clientes registrados en sucursal-central.');
  },
};
