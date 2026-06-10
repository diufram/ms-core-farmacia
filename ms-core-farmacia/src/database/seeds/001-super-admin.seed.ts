import { hash } from 'bcryptjs';
import { Persona } from '../entities/persona.entity';
import { Rol, Usuario } from '../entities/usuario.entity';
import { Seed } from './base.seed';
import { seedDataSource } from './seed-data-source';

export const superAdminSeed: Seed = {
  order: 1,
  name: '001-super-admin',
  run: async () => {
    const usuarioRepository = seedDataSource.getRepository(Usuario);
    const personaRepository = seedDataSource.getRepository(Persona);

    const correo = (
      process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@multifarmacia.local'
    ).toLowerCase();
    const username = process.env.SEED_SUPER_ADMIN_USERNAME || 'superadmin';
    const password = process.env.SEED_SUPER_ADMIN_PASSWORD || 'Admin12345';

    const existing = await usuarioRepository.findOne({
      where: [{ correo_electronico: correo }, { nombre_usuario: username }],
    });

    if (existing) {
      console.log(`- Super admin ya existe (${correo}), omitido.`);
      return;
    }

    const persona = personaRepository.create({
      nombre: process.env.SEED_SUPER_ADMIN_NOMBRE || 'Super',
      apellido: process.env.SEED_SUPER_ADMIN_APELLIDO || 'Admin',
      celular: process.env.SEED_SUPER_ADMIN_CELULAR || null,
    });
    const personaGuardada = await personaRepository.save(persona);

    const usuario = usuarioRepository.create({
      nombre_usuario: username,
      correo_electronico: correo,
      contrasena: await hash(password, 10),
      rol: Rol.SUPER_ADMIN,
      persona: personaGuardada,
    });

    await usuarioRepository.save(usuario);
    console.log(`- Super admin creado (${correo}).`);
  },
};
