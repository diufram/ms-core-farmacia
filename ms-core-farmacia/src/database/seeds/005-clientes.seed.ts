import { hash } from 'bcryptjs';
import { Persona } from '../entities/persona.entity';
import { Rol, Usuario } from '../entities/usuario.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const PRIMER_NOMBRE = [
  'Carlos', 'Maria', 'Luis', 'Sofia', 'Diego',
  'Ana', 'Jose', 'Laura', 'Pedro', 'Marta',
  'Jorge', 'Elena',
];

const PRIMER_APELLIDO = [
  'Rojas', 'Luna', 'Mendoza', 'Castro', 'Vargas',
  'Suarez', 'Perez', 'Gomez', 'Diaz', 'Torres',
  'Romero', 'Alvarez',
];

const CLIENTES = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  return {
    nombre: PRIMER_NOMBRE[i] ?? 'Cliente',
    apellido: PRIMER_APELLIDO[i] ?? 'Generico',
    username: `cliente${n}`,
    correo: `cliente${n}@gmail.com`,
    celular: `7600${String(n).padStart(4, '0')}`,
  };
});

export const clientesSeed: Seed = {
  order: 5,
  name: '005-clientes',
  run: async () => {
    const usuarioRepository = seedDataSource.getRepository(Usuario);
    const personaRepository = seedDataSource.getRepository(Persona);
    const password = process.env.SEED_CLIENTE_PASSWORD || '123123';

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
