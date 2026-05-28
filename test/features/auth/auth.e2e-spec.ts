import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../../setup/test-app.factory';

describe('Auth feature (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  it('/auth/register (POST) valida body con formato fail', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ correo_electronico: 'invalido' })
      .expect(422)
      .expect((res) => {
        expect(res.body.status).toBe('fail');
        expect(Array.isArray(res.body.data.errores_validacion)).toBe(true);
        expect(res.body.data.errores_validacion.length).toBeGreaterThan(0);
      });
  });

  it('/auth/register (POST) registra usuario y devuelve tokens', () => {
    const email = `user_${Date.now()}@correo.com`;

    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nombre_usuario: 'nuevo_usuario',
        correo_electronico: email,
        contrasena: 'Password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe('success');
        expect(res.body.data.usuario).toBeDefined();
        expect(res.body.data.usuario.correo_electronico).toBe(email);
        expect(typeof res.body.data.access_token).toBe('string');
        expect(typeof res.body.data.refresh_token).toBe('string');
      });
  });

  it('/auth/register (POST) no permite correo duplicado', async () => {
    const email = `dup_${Date.now()}@correo.com`;

    await request(app.getHttpServer()).post('/auth/register').send({
      nombre_usuario: 'usuario_duplicado',
      correo_electronico: email,
      contrasena: 'Password123',
    });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nombre_usuario: 'usuario_duplicado_2',
        correo_electronico: email,
        contrasena: 'Password123',
      })
      .expect(409)
      .expect((res) => {
        expect(res.body.status).toBe('fail');
        expect(res.body.data).toEqual({
          detalle: 'El correo electronico ya esta registrado.',
        });
      });
  });

  it('/auth/me (GET) sin token responde fail', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .expect(401)
      .expect((res) => {
        expect(res.body.status).toBe('fail');
        expect(res.body.data).toEqual({ detalle: 'Unauthorized' });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
