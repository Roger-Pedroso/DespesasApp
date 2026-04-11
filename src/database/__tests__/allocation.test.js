import { calcularAlocacao50_30_20 } from '../allocation';

jest.mock('../database', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('../../utils/errorHandler', () => ({
  handleError: jest.fn((err) => err),
  logError: jest.fn(),
}));

const { getDatabase } = require('../database');

function makeMockDb(schemaRows, despesaRows) {
  return {
    getAllAsync: jest.fn()
      .mockResolvedValueOnce(schemaRows)   // PRAGMA table_info
      .mockResolvedValueOnce(despesaRows), // SELECT tipo_gasto...
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    execAsync: jest.fn().mockResolvedValue(undefined),
  };
}

// Schema with tipo_gasto column present
const schemaComTipoGasto = [
  { name: 'id' },
  { name: 'valor' },
  { name: 'categoria' },
  { name: 'tipo_gasto' },
];

describe('calcularAlocacao50_30_20', () => {
  beforeEach(() => jest.clearAllMocks());

  it('totalMes === 0 → todos os percentuais são 0 (sem divisão por zero)', async () => {
    const db = makeMockDb(schemaComTipoGasto, []);
    getDatabase.mockResolvedValue(db);

    const result = await calcularAlocacao50_30_20(4, 2024);

    expect(result.totalMes).toBe(0);
    expect(result.essencial.percentReal).toBe(0);
    expect(result.desejo.percentReal).toBe(0);
    expect(result.poupar.percentReal).toBe(0);
    expect(isFinite(result.essencial.percentReal)).toBe(true);
    expect(isFinite(result.desejo.percentReal)).toBe(true);
    expect(isFinite(result.poupar.percentReal)).toBe(true);
  });

  it('alvo sempre reflete regra 50/30/20', async () => {
    const db = makeMockDb(schemaComTipoGasto, []);
    getDatabase.mockResolvedValue(db);

    const result = await calcularAlocacao50_30_20(4, 2024);

    expect(result.essencial.percentAlvo).toBe(50);
    expect(result.desejo.percentAlvo).toBe(30);
    expect(result.poupar.percentAlvo).toBe(20);
  });

  it('distribui corretamente entre essencial, desejo e poupar', async () => {
    const db = makeMockDb(schemaComTipoGasto, [
      { tipo_gasto: 'essencial', total: 500, quantidade: 5 },
      { tipo_gasto: 'desejo', total: 300, quantidade: 3 },
      { tipo_gasto: 'poupar', total: 200, quantidade: 2 },
    ]);
    getDatabase.mockResolvedValue(db);

    const result = await calcularAlocacao50_30_20(4, 2024);

    expect(result.totalMes).toBe(1000);
    expect(result.essencial.valor).toBe(500);
    expect(result.desejo.valor).toBe(300);
    expect(result.poupar.valor).toBe(200);
    expect(result.essencial.percentReal).toBeCloseTo(50);
    expect(result.desejo.percentReal).toBeCloseTo(30);
    expect(result.poupar.percentReal).toBeCloseTo(20);
  });

  it('status OK quando distribuição está dentro de 2% do alvo', async () => {
    // Exatamente 50/30/20 → status OK
    const db = makeMockDb(schemaComTipoGasto, [
      { tipo_gasto: 'essencial', total: 500, quantidade: 5 },
      { tipo_gasto: 'desejo', total: 300, quantidade: 3 },
      { tipo_gasto: 'poupar', total: 200, quantidade: 2 },
    ]);
    getDatabase.mockResolvedValue(db);

    const result = await calcularAlocacao50_30_20(4, 2024);

    expect(result.essencial.status).toBe('OK');
    expect(result.desejo.status).toBe('OK');
    expect(result.poupar.status).toBe('OK');
  });

  it('status EXCEDIDO quando distribuição excede alvo em mais de 5%', async () => {
    // Tudo em essencial → 100% vs alvo 50% → diferença 50% → EXCEDIDO
    const db = makeMockDb(schemaComTipoGasto, [
      { tipo_gasto: 'essencial', total: 1000, quantidade: 10 },
    ]);
    getDatabase.mockResolvedValue(db);

    const result = await calcularAlocacao50_30_20(4, 2024);

    expect(result.essencial.status).toBe('EXCEDIDO');
  });

  it('retorna dados vazios quando coluna tipo_gasto não existe', async () => {
    const dbSemColuna = {
      getAllAsync: jest.fn().mockResolvedValueOnce([
        { name: 'id' }, { name: 'valor' }, { name: 'categoria' },
        // sem tipo_gasto
      ]),
      getFirstAsync: jest.fn().mockResolvedValue(null),
    };
    getDatabase.mockResolvedValue(dbSemColuna);

    const result = await calcularAlocacao50_30_20(4, 2024);

    expect(result.totalMes).toBe(0);
    expect(result.status).toBe('sem-dados');
  });
});
