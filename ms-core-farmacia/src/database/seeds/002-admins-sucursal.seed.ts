import { hash } from 'bcryptjs';
import { Persona } from '../entities/persona.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Rol, Usuario } from '../entities/usuario.entity';
import { UsuarioSucursal } from '../entities/usuario-sucursal.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const ADMIN_POR_SUCURSAL: Array<{
  sucursalSlug: string;
  nombre: string;
  apellido: string;
  username: string;
  correo: string;
  celular: string;
}> = [
  {
    sucursalSlug: 'sucursal-central',
    nombre: 'Admin',
    apellido: 'Sucursal 1',
    username: 'admin.suc.1',
    correo: 'admin.suc.1@gmail.com',
    celular: '71111111',
  },
  {
    sucursalSlug: 'sucursal-norte',
    nombre: 'Admin',
    apellido: 'Sucursal 2',
    username: 'admin.suc.2',
    correo: 'admin.suc.2@gmail.com',
    celular: '72222222',
  },
  {
    sucursalSlug: 'sucursal-sur',
    nombre: 'Admin',
    apellido: 'Sucursal 3',
    username: 'admin.suc.3',
    correo: 'admin.suc.3@gmail.com',
    celular: '73333333',
  },
];

export const adminsSucursalSeed: Seed = {
  order: 2,
  name: '002-admins-sucursal',
  run: async () => {
    const usuarioRepository = seedDataSource.getRepository(Usuario);
    const personaRepository = seedDataSource.getRepository(Persona);
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const usuarioSucursalRepository = seedDataSource.getRepository(UsuarioSucursal);
    const password = process.env.SEED_ADMIN_SUCURSAL_PASSWORD || '123123';

    for (const item of ADMIN_POR_SUCURSAL) {
      const sucursal = await sucursalRepository.findOne({
        where: { slug: item.sucursalSlug },
      });
      if (!sucursal) {
        console.log(`- Sucursal ${item.sucursalSlug} no encontrada, omitido.`);
        continue;
      }

      let usuario = await usuarioRepository.findOne({
        where: [{ correo_electronico: item.correo }, { nombre_usuario: item.username }],
      });

      if (!usuario) {
        const persona = personaRepository.create({
          nombre: item.nombre,
          apellido: item.apellido,
          celular: item.celular,
        });
        const personaGuardada = await personaRepository.save(persona);

        usuario = usuarioRepository.create({
          nombre_usuario: item.username,
          correo_electronico: item.correo,
          contrasena: await hash(password, 10),
          rol: Rol.ADMIN,
          persona: personaGuardada,
        });
        usuario = await usuarioRepository.save(usuario);
        console.log(`- Admin de sucursal creado: ${item.correo} -> ${item.sucursalSlug}.`);
      }

      const relacion = await usuarioSucursalRepository.findOne({
        where: { usuario: { id: usuario.id }, sucursal: { id: sucursal.id } },
      });

      if (relacion) {
        console.log(
          `- Relacion admin-sucursal ya existe (${item.correo} -> ${item.sucursalSlug}).`,
        );
        continue;
      }

      await usuarioSucursalRepository.save(
        usuarioSucursalRepository.create({
          usuario,
          sucursal,
          activo: true,
        }),
      );

      console.log(`- Relacion admin-sucursal creada (${item.correo} -> ${item.sucursalSlug}).`);
    }
  },
};
