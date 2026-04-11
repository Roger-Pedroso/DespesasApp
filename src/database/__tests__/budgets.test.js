import {
  buscarOrcamentos,
  buscarSugestoesDeDesvio,
  criarOrcamento,
  deletarOrcamento,
} from '../budgets';

// Mock database module
jest.mock('../database', () => ({
  getDatabase: jest.fn(),
}));

// Mock error handler to avoid side effects
jest.mock('../../utils/errorHandler', () => ({
  handleError: jest.fn((err) => err),
  logError: jest.fn(),
}));

const { getDatabase } = require('../database');

function makeMockDb(overrides = {}) {
  return {
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    execAsync: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('buscarOrcamentos', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna array vazio quando não há orçamentos', async () => {
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue([]) });
    getDatabase.mockResolvedValue(db);

    const result = await buscarOrcamentos('2024-04');
    expect(result).toEqual([]);
  });

  it('limite === 0 → percentualUsado === 0 (sem divisão por zero)', async () => {
    const db = makeMockDb({
      getAllAsync: jest.fn().mockResolvedValue([
        { id: 1, categoria: 'alimentacao', limite: 0, gasto_atual: 150 },
      ]),
    });
    getDatabase.mockResolvedValue(db);

    const [budget] = await buscarOrcamentos('2024-04');
    expect(budget.percentualUsado).toBe(0);
    expect(isFinite(budget.percentualUsado)).toBe(true);
  });

  it('percentualUsado calculado corretamente quando limite > 0', async () => {
    const db = makeMockDb({
      getAllAsync: jest.fn().mockResolvedValue([
        { id: 1, categoria: 'alimentacao', limite: 500, gasto_atual: 250 },
      ]),
    });
    getDatabase.mockResolvedValue(db);

    const [budget] = await buscarOrcamentos('2024-04');
    expect(budget.percentualUsado).toBeCloseTo(50);
  });

  it('status OK quando percentual < 80', async () => {
    const db = makeMockDb({
      getAllAsync: jest.fn().mockResolvedValue([
        { id: 1, categoria: 'alimentacao', limite: 500, gasto_atual: 300 },
      ]),
    });
    getDatabase.mockResolvedValue(db);

    const [budget] = await buscarOrcamentos('2024-04');
    expect(budget.status).toBe('OK');
  });

  it('status AVISO quando percentual entre 80 e 100', async () => {
    const db = makeMockDb({
      getAllAsync: jest.fn().mockResolvedValue([
        { id: 1, categoria: 'alimentacao', limite: 500, gasto_atual: 430 },
      ]),
    });
    getDatabase.mockResolvedValue(db);

    const [budget] = await buscarOrcamentos('2024-04');
    expect(budget.percentualUsado).toBeGreaterThanOrEqual(80);
    expect(budget.percentualUsado).toBeLessThanOrEqual(100);
    expect(budget.status).toBe('AVISO');
  });

  it('status EXCEDIDO quando percentual > 100', async () => {
    const db = makeMockDb({
      getAllAsync: jest.fn().mockResolvedValue([
        { id: 1, categoria: 'alimentacao', limite: 500, gasto_atual: 600 },
      ]),
    });
    getDatabase.mockResolvedValue(db);

    const [budget] = await buscarOrcamentos('2024-04');
    expect(budget.percentualUsado).toBeGreaterThan(100);
    expect(budget.status).toBe('EXCEDIDO');
  });

  it('disponivel = limite - gasto_atual', async () => {
    const db = makeMockDb({
      getAllAsync: jest.fn().mockResolvedValue([
        { id: 1, categoria: 'transporte', limite: 300, gasto_atual: 120 },
      ]),
    });
    getDatabase.mockResolvedValue(db);

    const [budget] = await buscarOrcamentos('2024-04');
    expect(budget.disponivel).toBe(180);
  });

  it('passa mes e ano corretos para a query', async () => {
    const db = makeMockDb();
    getDatabase.mockResolvedValue(db);

    await buscarOrcamentos('2024-04');
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.any(String),
      [4, 2024, '2024-04']
    );
  });
});

describe('buscarSugestoesDeDesvio', () => {
  beforeEach(() => jest.clearAllMocks());

  it('limite === 0 → percentualDesvio === 0 (sem Infinity)', async () => {
    const db = makeMockDb({
      getAllAsync: jest.fn()
        .mockResolvedValueOnce([
          { categoria: 'alimentacao', total: 200 },
        ])
        .mockResolvedValueOnce([
          { categoria: 'alimentacao', limite: 0 },
        ]),
    });
    getDatabase.mockResolvedValue(db);

    const result = await buscarSugestoesDeDesvio('2024-04');
    // desvio = 200 - 0 = 200, but percentualDesvio should be 0, not Infinity
    if (result.length > 0) {
      expect(isFinite(result[0].percentualDesvio)).toBe(true);
      expect(result[0].percentualDesvio).toBe(0);
    }
  });

  it('retorna apenas categorias com desvio positivo', async () => {
    const db = makeMockDb({
      getAllAsync: jest.fn()
        .mockResolvedValueOnce([
          { categoria: 'alimentacao', total: 600 },
          { categoria: 'transporte', total: 100 },
        ])
        .mockResolvedValueOnce([
          { categoria: 'alimentacao', limite: 500 },
          { categoria: 'transporte', limite: 200 },
        ]),
    });
    getDatabase.mockResolvedValue(db);

    const result = await buscarSugestoesDeDesvio('2024-04');
    // alimentacao excedeu (600 > 500), transporte não (100 < 200)
    expect(result).toHaveLength(1);
    expect(result[0].categoria).toBe('alimentacao');
    expect(result[0].desvio).toBe(100);
  });

  it('retorna array vazio quando nenhum orçamento excedido', async () => {
    const db = makeMockDb({
      getAllAsync: jest.fn()
        .mockResolvedValueOnce([
          { categoria: 'alimentacao', total: 200 },
        ])
        .mockResolvedValueOnce([
          { categoria: 'alimentacao', limite: 500 },
        ]),
    });
    getDatabase.mockResolvedValue(db);

    const result = await buscarSugestoesDeDesvio('2024-04');
    expect(result).toEqual([]);
  });

  it('retorna array vazio quando não há orçamentos cadastrados', async () => {
    const db = makeMockDb({
      getAllAsync: jest.fn()
        .mockResolvedValueOnce([{ categoria: 'alimentacao', total: 100 }])
        .mockResolvedValueOnce([]),
    });
    getDatabase.mockResolvedValue(db);

    const result = await buscarSugestoesDeDesvio('2024-04');
    expect(result).toEqual([]);
  });
});
