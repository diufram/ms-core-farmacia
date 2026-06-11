import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import { CategoryRiskModel } from '../category-risk.model';
import { FeatureBuilderService } from '../feature-builder.service';

async function main(): Promise<void> {
  const logger = new Logger('MlTrain');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const featureBuilder = app.get(FeatureBuilderService);
    const result = await featureBuilder.trainCategoryRiskModel({});
    logger.log(
      `Entrenamiento exitoso: ${result.categoriasEntrenadas} categorías, OOB accuracy = ${result.oobAccuracy?.toFixed(4) ?? 'N/A'}`,
    );

    const model = app.get(CategoryRiskModel);
    model.loadFromFile();
    logger.log('Modelo recargado en memoria para validación.');
  } catch (err) {
    logger.error(`Error durante el entrenamiento: ${(err as Error).message}`);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void main();
