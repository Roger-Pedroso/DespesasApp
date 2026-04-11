/**
 * Jest Setup File
 */

// Mock para componentes React Native que podem não estar disponíveis
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock para expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
  }),
}));
