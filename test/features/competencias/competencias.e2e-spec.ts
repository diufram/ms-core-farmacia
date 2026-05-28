import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { crearAdminYObtenerToken } from '../../setup/auth.helper';
import { createTestApp } from '../../setup/test-app.factory';

describe('Competencias feature (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  it('/competencias (POST) sin token responde fail', () => {
    return request(app.getHttpServer())
      .post('/competencias')
      .send({
        nombre: `Competencia ${Date.now()}`,
        descripcion: 'Competencia para pruebas e2e',
        fecha_inicio: '2026-07-01T10:00:00.000Z',
        fecha_fin: '2026-07-10T18:00:00.000Z',
        nivel_dificultad: 'Intermedio',
        estado: 'Abierta',
        tipo: 'Individual',
        max_participantes: 50,
      })
      .expect(401)
      .expect((res) => {
        expect(res.body.status).toBe('fail');
      });
  });

  it('/competencias (POST) crea una competencia con admin', async () => {
    const accessToken = await crearAdminYObtenerToken(app);

    return request(app.getHttpServer())
      .post('/competencias')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nombre: `Competencia ${Date.now()}`,
        descripcion: 'Competencia para pruebas e2e',
        fecha_inicio: '2026-07-01T10:00:00.000Z',
        fecha_fin: '2026-07-10T18:00:00.000Z',
        nivel_dificultad: 'Intermedio',
        estado: 'Abierta',
        tipo: 'Individual',
        max_participantes: 50,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe('success');
        expect(res.body.data.competencia).toBeDefined();
        expect(res.body.data.competencia.id).toBeDefined();
      });
  });

  it('/competencias CRUD completo con admin para escritura', async () => {
    const accessToken = await crearAdminYObtenerToken(app);

    const createResponse = await request(app.getHttpServer())
      .post('/competencias')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nombre: `Competencia CRUD ${Date.now()}`,
        descripcion: 'Competencia para flujo CRUD',
        fecha_inicio: '2026-08-01T10:00:00.000Z',
        fecha_fin: '2026-08-03T18:00:00.000Z',
        nivel_dificultad: 'Principiante',
        estado: 'Abierta',
        tipo: 'Individual',
        max_participantes: 30,
      })
      .expect(201);

    const competenciaId = createResponse.body.data.competencia.id;

    await request(app.getHttpServer())
      .get(`/competencias/${competenciaId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('success');
        expect(res.body.data.competencia.id).toBe(competenciaId);
      });

    await request(app.getHttpServer())
      .patch(`/competencias/${competenciaId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        estado: 'En curso',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('success');
        expect(res.body.data.competencia.estado).toBe('En curso');
      });

    await request(app.getHttpServer())
      .delete(`/competencias/${competenciaId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('success');
      });

    await request(app.getHttpServer()).get(`/competencias/${competenciaId}`).expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});
