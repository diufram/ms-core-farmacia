import { hash } from 'bcryptjs';
import { Persona } from '../entities/persona.entity';
import { Rol, Usuario } from '../entities/usuario.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const CLIENTES: Array<{
  nombre: string;
  apellido: string;
  username: string;
  correo: string;
  celular: string;
}> = [
  {
    nombre: 'Carlos',
    apellido: 'Rojas',
    username: 'carlos.rojas',
    correo: 'carlos.rojas@clientes.local',
    celular: '76000001',
  },
  {
    nombre: 'Maria',
    apellido: 'Luna',
    username: 'maria.luna',
    correo: 'maria.luna@clientes.local',
    celular: '76000002',
  },
  {
    nombre: 'Luis',
    apellido: 'Mendoza',
    username: 'luis.mendoza',
    correo: 'luis.mendoza@clientes.local',
    celular: '76001001',
  },
  {
    nombre: 'Sofia',
    apellido: 'Castro',
    username: 'sofia.castro',
    correo: 'sofia.castro@clientes.local',
    celular: '76001002',
  },
  {
    nombre: 'Diego',
    apellido: 'Vargas',
    username: 'diego.vargas',
    correo: 'diego.vargas@clientes.local',
    celular: '76001003',
  },
];

export const clientesSeed: Seed = {
  order: 5,
  name: '005-clientes',
  run: async () => {
    const usuarioRepository = seedDataSource.getRepository(Usuario);
    const personaRepository = seedDataSource.getRepository(Persona);
    const password = process.env.SEED_CLIENTE_PASSWORD || 'Cliente123';

    for (const item of CLIENTES) {
      const existing = await usuarioRepository.findOne({
        where: [
          { correo_electronico: item.correo },
          { nombre_usuario: item.username },
        ],
      });
      if (existing) {
        console.log(`- Cliente ya existe (${item.correo}), omitido.`);
        continue;
      }

      const persona = personaRepository.create({
        nombre: item.nombre,
        apellido: item.apellido,
        celular: item.celular,
      });
      const personaGuardada = await personaRepository.save(persona);

      const usuario = usuarioRepository.create({
        nombre_usuario: item.username,
        correo_electronico: item.correo,
        contrasena: await hash(password, 10),
        rol: Rol.CLIENTE,
        persona: personaGuardada,
      });
      await usuarioRepository.save(usuario);
      console.log(`- Cliente creado: ${item.correo} (contrasena: ${password}).`);
    }
  },
};
