import { preverGastoAteFinaldoMes } from '../insights';

jest.mock('../database', () => ({
  getDatabase: jest.fn(),
}));

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

describe('preverGastoAteFinaldoMes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calcula previsão corretamente para mês normal', async () => {
    // Simular: total até hoje = 300, diaAtual = 15, ultimoDia = 30
    // mediaPorDia = 300/15 = 20, previsaoTotal = 20 * 30 = 600
    const db = makeMockDb({
      getFirstAsync: jest.fn().mockResolvedValue({ total: 300 }),
    });
    getDatabase.mockResolvedValue(db);

    const hoje = new Date();
    const result = await preverGastoAteFinaldoMes(hoje.getMonth() + 1, hoje.getFullYear());

    expect(result.totalAteHoje).toBe(300);
    expect(result.diaAtual).toBeGreaterThan(0);
    expect(result.ultimoDia).toBeGreaterThan(0);
    expect(result.mediaPorDia).toBeGreaterThan(0);
    expect(result.previsaoTotal).toBeGreaterThan(0);
    expect(isFinite(result.mediaPorDia)).toBe(true);
    expect(isFinite(result.previsaoTotal)).toBe(true);
    expect(isFinite(result.percentualDoMes)).toBe(true);
  });

  it('total === 0 → todos campos numéricos são 0 ou finitos, sem Infinity', async () => {
    const db = makeMockDb({
      getFirstAsync: jest.fn().mockResolvedValue({ total: 0 }),
    });
    getDatabase.mockResolvedValue(db);

    const hoje = new Date();
    const result = await preverGastoAteFinaldoMes(hoje.getMonth() + 1, hoje.getFullYear());

    expect(result.totalAteHoje).toBe(0);
    expect(result.mediaPorDia).toBe(0);
    expect(result.previsaoTotal).toBe(0);
    expect(isFinite(result.percentualDoMes)).toBe(true);
    expect(result.percentualDoMes).toBeGreaterThanOrEqual(0);
    expect(result.percentualDoMes).toBeLessThanOrEqual(100);
  });

  it('resultado null do banco → tratado como 0', async () => {
    const db = makeMockDb({
      getFirstAsync: jest.fn().mockResolvedValue(null),
    });
    getDatabase.mockResolvedValue(db);

    const result = await preverGastoAteFinaldoMes(4, 2024);

    expect(result.totalAteHoje).toBe(0);
    expect(isFinite(result.mediaPorDia)).toBe(true);
    expect(isFinite(result.previsaoTotal)).toBe(true);
  });

  it('retorna diasRestantes = ultimoDia - diaAtual', async () => {
    const db = makeMockDb({
      getFirstAsync: jest.fn().mockResolvedValue({ total: 100 }),
    });
    getDatabase.mockResolvedValue(db);

    const hoje = new Date();
    const result = await preverGastoAteFinaldoMes(hoje.getMonth() + 1, hoje.getFullYear());

    expect(result.diasRestantes).toBe(result.ultimoDia - result.diaAtual);
  });

  it('percentualDoMes está entre 0 e 100', async () => {
    const db = makeMockDb({
      getFirstAsync: jest.fn().mockResolvedValue({ total: 500 }),
    });
    getDatabase.mockResolvedValue(db);

    const result = await preverGastoAteFinaldoMes(4, 2024);

    expect(result.percentualDoMes).toBeGreaterThanOrEqual(0);
    expect(result.percentualDoMes).toBeLessThanOrEqual(100);
  });
});
