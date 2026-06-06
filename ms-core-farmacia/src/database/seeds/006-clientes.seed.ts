import { Cliente } from '../entities/cliente.entity';
import { Persona } from '../entities/persona.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const CLIENTES_POR_SUCURSAL: Record<string, Array<{
  codigo: string;
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  celular: string;
}>> = {
  'sucursal-central': [
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
  ],
  'sucursal-norte': [
    {
      codigo: 'CLI-1001',
      nombre: 'Luis',
      apellido: 'Mendoza',
      documento: '9123456',
      correo: 'luis.mendoza@clientes.local',
      celular: '76001001',
    },
    {
      codigo: 'CLI-1002',
      nombre: 'Sofia',
      apellido: 'Castro',
      documento: '9988776',
      correo: 'sofia.castro@clientes.local',
      celular: '76001002',
    },
  ],
};

export const clientesSeed: Seed = {
  order: 6,
  name: '006-clientes',
  run: async () => {
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const personaRepository = seedDataSource.getRepository(Persona);
    const clienteRepository = seedDataSource.getRepository(Cliente);

    const sucursales = await sucursalRepository.find();

    for (const sucursal of sucursales) {
      const clientes = CLIENTES_POR_SUCURSAL[sucursal.slug];
      if (!clientes) continue;

      for (const item of clientes) {
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
          }),
        );
      }

      console.log(`- Clientes registrados para ${sucursal.slug}.`);
    }
  },
};
