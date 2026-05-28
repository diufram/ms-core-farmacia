import { hash } from 'bcryptjs';
import { Persona } from '../entities/persona.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { RolGlobal, Usuario } from '../entities/usuario.entity';
import { RolSucursal, UsuarioSucursal } from '../entities/usuario-sucursal.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

const ADMINISTRADORES = [
  {
    sucursalSlug: 'sucursal-central',
    nombre: 'Admin',
    apellido: 'Central',
    username: 'admin.central',
    correo: 'admin.central@multifarmacia.local',
    celular: '71111111',
  },
  {
    sucursalSlug: 'sucursal-norte',
    nombre: 'Admin',
    apellido: 'Norte',
    username: 'admin.norte',
    correo: 'admin.norte@multifarmacia.local',
    celular: '72222222',
  },
];

export const usuariosAdministradoresSeed: Seed = {
  order: 3,
  name: '003-usuarios-administradores',
  run: async () => {
    const usuarioRepository = seedDataSource.getRepository(Usuario);
    const personaRepository = seedDataSource.getRepository(Persona);
    const sucursalRepository = seedDataSource.getRepository(Sucursal);
    const usuarioSucursalRepository = seedDataSource.getRepository(UsuarioSucursal);
    const password = process.env.SEED_ADMIN_SUCURSAL_PASSWORD || 'Admin12345';

    for (const item of ADMINISTRADORES) {
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
          correo_electronico: item.correo,
          celular: item.celular,
        });
        const personaGuardada = await personaRepository.save(persona);

        usuario = usuarioRepository.create({
          nombre_usuario: item.username,
          correo_electronico: item.correo,
          contrasena: await hash(password, 10),
          rol_global: RolGlobal.USER,
          persona: personaGuardada,
          activo: true,
          esta_verificado: true,
        });
        usuario = await usuarioRepository.save(usuario);
        console.log(`- Usuario administrador creado (${item.correo}).`);
      }

      const relacion = await usuarioSucursalRepository.findOne({
        where: { usuario: { id: usuario.id }, sucursal: { id: sucursal.id } },
      });

      if (relacion) {
        console.log(`- Relacion usuario-sucursal ya existe (${item.correo} -> ${item.sucursalSlug}).`);
        continue;
      }

      await usuarioSucursalRepository.save(
        usuarioSucursalRepository.create({
          usuario,
          sucursal,
          rol: RolSucursal.ADMIN,
          activo: true,
        }),
      );

      console.log(`- Relacion usuario-sucursal creada (${item.correo} -> ${item.sucursalSlug}).`);
    }
  },
};
