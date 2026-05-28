import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../setup/test-app.factory';

describe('Core response format (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  it('/ (GET) devuelve formato success', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect({
      status: 'success',
      data: 'Hello World!',
    });
  });

  it('/ruta-no-existe (GET) devuelve formato fail', () => {
    return request(app.getHttpServer())
      .get('/ruta-no-existe')
      .expect(404)
      .expect((res) => {
        expect(res.body.status).toBe('fail');
        expect(res.body.data).toEqual({
          detalle: 'Cannot GET /ruta-no-existe',
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
