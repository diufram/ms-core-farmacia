import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { hash } from 'bcryptjs';
import request from 'supertest';
import { Rol, Usuario } from '../../src/database/entities/usuario.entity';

export async function crearAdminYObtenerToken(
  app: INestApplication,
): Promise<string> {
  const dataSource = app.get(DataSource);
  const usuarioRepository = dataSource.getRepository(Usuario);
  const email = `admin_${Date.now()}_${Math.floor(Math.random() * 1000)}@correo.com`;
  const contrasena = 'Password123';

  const admin = usuarioRepository.create({
    nombre_usuario: 'admin_test',
    correo_electronico: email,
    contrasena: await hash(contrasena, 10),
    rol: Rol.ADMIN,
  });
  await usuarioRepository.save(admin);

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      correo_electronico: email,
      contrasena,
    });

  return loginResponse.body.data.access_token as string;
}
