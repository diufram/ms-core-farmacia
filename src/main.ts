import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/http-exception.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  const swaggerEnabled =
    configService.get<string>('SWAGGER_ENABLED') === 'true' ||
    configService.get<string>('NODE_ENV') !== 'production';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Proyecto Taller API')
      .setDescription('Documentacion de endpoints del backend')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el access token en formato Bearer',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableCors({
    origin:
      configService.get<string>('ALLOWED_ORIGIN') || 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  console.log(`Backend iniciado en: http://localhost:${port}`);
  if (swaggerEnabled) {
    console.log(`Swagger disponible en: http://localhost:${port}/docs`);
  }
}
void bootstrap();
