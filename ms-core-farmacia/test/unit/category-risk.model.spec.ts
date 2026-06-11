import { existsSync, unlinkSync, mkdirSync } from 'fs';
import { CategoryRiskModel } from '../../src/features/ml/category-risk.model';
import { CATEGORY_RISK_MODEL_PATH, ML_MODELS_DIR } from '../../src/features/ml/ml.constants';

describe('CategoryRiskModel', () => {
  let model: CategoryRiskModel;

  beforeEach(() => {
    model = new CategoryRiskModel();
    if (existsSync(CATEGORY_RISK_MODEL_PATH)) {
      unlinkSync(CATEGORY_RISK_MODEL_PATH);
    }
  });

  afterAll(() => {
    if (existsSync(CATEGORY_RISK_MODEL_PATH)) {
      unlinkSync(CATEGORY_RISK_MODEL_PATH);
    }
  });

  it('isLoaded devuelve false si no existe el archivo', () => {
    expect(model.isLoaded()).toBe(false);
  });

  it('train lanza error si hay menos de MIN_CATEGORIES_TO_TRAIN filas', () => {
    expect(() => model.train([[1, 0, 0, 1, 1, 0, 5]], [0])).toThrow(/al menos 5 categor/);
  });

  it('train lanza error si dataset tiene una sola clase', () => {
    expect(() =>
      model.train(
        [
          [1, 0, 0, 1, 1, 0, 5],
          [2, 0, 0, 1, 1, 0, 5],
          [3, 0, 0, 1, 1, 0, 5],
          [4, 0, 0, 1, 1, 0, 5],
          [5, 0, 0, 1, 1, 0, 5],
        ],
        [0, 0, 0, 0, 0],
      ),
    ).toThrow(/desbalanceadas/);
  });

  it('train entrena, persiste JSON y permite recargarlo', () => {
    if (!existsSync(ML_MODELS_DIR)) {
      mkdirSync(ML_MODELS_DIR, { recursive: true });
    }
    const X = [
      [10, 8, 0.8, 0, 0, -0.5, 90],
      [20, 15, 0.75, 2, 0.1, -0.4, 80],
      [30, 25, 0.83, 1, 0.03, -0.6, 100],
      [5, 0, 0, 50, 10, 0.5, 5],
      [8, 1, 0.12, 80, 10, 0.3, 3],
      [6, 0, 0, 90, 15, 0.4, 2],
    ];
    const y = [1, 1, 1, 0, 0, 0];
    const result = model.train(X, y);
    expect(result.categoriasEntrenadas).toBe(6);
    expect(existsSync(CATEGORY_RISK_MODEL_PATH)).toBe(true);

    const fresh = new CategoryRiskModel();
    expect(fresh.isLoaded()).toBe(true);
    const prediction = fresh.predict([10, 8, 0.8, 0, 0, -0.5, 90]);
    expect(prediction.label === 0 || prediction.label === 1).toBe(true);
    expect(prediction.probability).toBeGreaterThanOrEqual(0);
    expect(prediction.probability).toBeLessThanOrEqual(1);
  });
});
