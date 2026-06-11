import { join } from 'path';

export const ML_MODELS_DIR = join(process.cwd(), 'src', 'features', 'ml', 'models');

export const CATEGORY_RISK_MODEL_FILENAME = 'category-risk.model.json';

export const CATEGORY_RISK_MODEL_PATH = join(ML_MODELS_DIR, CATEGORY_RISK_MODEL_FILENAME);

export const FEATURE_NAMES = [
  'total_productos',
  'productos_stock_bajo',
  'ratio_stock_bajo',
  'ventas_periodo',
  'ventas_por_producto',
  'tendencia_ventas',
  'dias_promedio_sin_venta',
] as const;

export const FEATURE_COUNT = FEATURE_NAMES.length;

export const RISK_CLASS_THRESHOLD = 0.5;

export const RF_OPTIONS = {
  seed: 42,
  nEstimators: 50,
  maxFeatures: 0.8,
  replacement: true,
  useSampleBagging: false,
  isClassifier: true,
  treeOptions: { gainFunction: 'gini' },
  noOOB: true,
} as const;

export const MIN_CATEGORIES_TO_TRAIN = 5;
