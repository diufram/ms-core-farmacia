import { Injectable, Logger } from '@nestjs/common';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { RandomForestClassifier } from 'ml-random-forest';
import {
  CATEGORY_RISK_MODEL_PATH,
  MIN_CATEGORIES_TO_TRAIN,
  ML_MODELS_DIR,
  RF_OPTIONS,
} from './ml.constants';

interface RandomForestBaseModel {
  baseModel: {
    n: number;
    indexes: number[][];
    estimators: unknown[];
    maxFeatures: number;
    replacement: boolean;
    nEstimators: number;
    seed: number;
    useSampleBagging: boolean;
    treeOptions: object;
    noOOB: boolean;
    isClassifier: boolean;
  };
  name: 'RFClassifier';
}

export interface CategoryRiskFeatures {
  total_productos: number;
  productos_stock_bajo: number;
  ratio_stock_bajo: number;
  ventas_periodo: number;
  ventas_por_producto: number;
  tendencia_ventas: number;
  dias_promedio_sin_venta: number;
}

export interface CategoryRiskPrediction {
  label: 0 | 1;
  probability: number;
}

export interface CategoryRiskTrainingResult {
  categoriasEntrenadas: number;
  oobAccuracy: number | null;
  fechaEntrenamiento: string;
}

@Injectable()
export class CategoryRiskModel {
  private readonly logger = new Logger(CategoryRiskModel.name);
  private model: RandomForestClassifier | null = null;
  private lastTraining: CategoryRiskTrainingResult | null = null;

  isLoaded(): boolean {
    if (this.model !== null) {
      return true;
    }
    this.loadFromFile();
    return this.model !== null;
  }

  loadFromFile(): boolean {
    try {
      if (!existsSync(CATEGORY_RISK_MODEL_PATH)) {
        return false;
      }
      const raw = readFileSync(CATEGORY_RISK_MODEL_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as {
        model: RandomForestBaseModel;
        metadata?: CategoryRiskTrainingResult;
      };
      const modelJson = parsed.model;

      this.model = RandomForestClassifier.load(modelJson);
      this.lastTraining = parsed.metadata ?? null;
      this.logger.log(`Modelo cargado desde ${CATEGORY_RISK_MODEL_PATH}`);
      return true;
    } catch (err) {
      this.logger.warn(
        `No se pudo cargar el modelo ML: ${(err as Error).message}. Se usará heurística.`,
      );
      this.model = null;
      return false;
    }
  }

  train(X: number[][], y: number[]): CategoryRiskTrainingResult {
    if (X.length < MIN_CATEGORIES_TO_TRAIN) {
      throw new Error(
        `Se requieren al menos ${MIN_CATEGORIES_TO_TRAIN} categorías para entrenar. Se encontraron ${X.length}.`,
      );
    }

    const positiveCount = y.filter((v) => v === 1).length;
    if (positiveCount === 0 || positiveCount === y.length) {
      throw new Error(
        `El dataset no es apto para entrenar: clases desbalanceadas (positivos=${positiveCount}/${y.length}).`,
      );
    }

    const classifier = new RandomForestClassifier(RF_OPTIONS);
    classifier.train(X, y);

    let oobAccuracy: number | null = null;
    try {
      const oob = classifier.predictOOB();
      if (Array.isArray(oob) && oob.length === y.length && oob.length > 0) {
        let correct = 0;
        for (let i = 0; i < y.length; i++) {
          if (oob[i] === y[i]) correct++;
        }
        oobAccuracy = correct / y.length;
      }
    } catch {
      oobAccuracy = null;
    }

    this.model = classifier;
    const result: CategoryRiskTrainingResult = {
      categoriasEntrenadas: X.length,
      oobAccuracy,
      fechaEntrenamiento: new Date().toISOString(),
    };
    this.lastTraining = result;
    this.saveToFile();
    this.logger.log(
      `Modelo entrenado con ${result.categoriasEntrenadas} categorías. OOB accuracy=${oobAccuracy?.toFixed(3) ?? 'N/A'}`,
    );
    return result;
  }

  predict(features: CategoryRiskFeatures | number[]): CategoryRiskPrediction {
    if (!this.model) {
      throw new Error('El modelo no está cargado. Llame a isLoaded() o train() primero.');
    }
    const arr = Array.isArray(features) ? features : this.featuresToArray(features);
    const label = this.model.predict([arr])[0];
    const probabilityForOne = this.model.predictProbability([arr], 1)[0] ?? 0;
    return {
      label: label === 1 ? 1 : 0,
      probability: Number(probabilityForOne.toFixed(4)),
    };
  }

  featuresToArray(f: CategoryRiskFeatures): number[] {
    return [
      f.total_productos,
      f.productos_stock_bajo,
      f.ratio_stock_bajo,
      f.ventas_periodo,
      f.ventas_por_producto,
      f.tendencia_ventas,
      f.dias_promedio_sin_venta,
    ];
  }

  getLastTraining(): CategoryRiskTrainingResult | null {
    return this.lastTraining;
  }

  private saveToFile(): void {
    if (!this.model || !this.lastTraining) return;
    if (!existsSync(ML_MODELS_DIR)) {
      mkdirSync(dirname(CATEGORY_RISK_MODEL_PATH), { recursive: true });
    }
    const payload = {
      model: this.model.toJSON(),
      metadata: this.lastTraining,
    };
    writeFileSync(CATEGORY_RISK_MODEL_PATH, JSON.stringify(payload), 'utf-8');
    this.logger.log(`Modelo persistido en ${CATEGORY_RISK_MODEL_PATH}`);
  }
}
