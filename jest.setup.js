/**
 * Jest Setup File
 */

// Mock para componentes React Native que podem não estar disponíveis
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock para expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
  }),
}));
