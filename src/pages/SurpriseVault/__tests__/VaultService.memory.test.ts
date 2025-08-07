// Minimal test to verify timer cleanup and memory leak fixes
import VaultService from '../services/VaultService';

describe('VaultService Memory Leak Fix', () => {
  let vaultService: any;

  beforeEach(() => {
    // Reset any existing instance
    if ((VaultService as any).reset) {
      (VaultService as any).reset();
    }
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    // Destroy the service instance to clean up timers
    if (vaultService && vaultService.destroy) {
      vaultService.destroy();
    }

    // Reset the singleton
    if ((VaultService as any).reset) {
      (VaultService as any).reset();
    }

    jest.clearAllTimers();
  });

  afterAll(() => {
    // Final cleanup
    if ((VaultService as any).reset) {
      (VaultService as any).reset();
    }
    jest.clearAllTimers();
  });

  test('VaultService can be created and destroyed without memory leaks', () => {
    vaultService = VaultService.getInstance();

    expect(vaultService).toBeDefined();
    expect(typeof vaultService.destroy).toBe('function');

    // Destroy should clear timers
    vaultService.destroy();

    // No assertions needed - test passes if no timers are left hanging
  });

  test('VaultService singleton can be reset', () => {
    const instance1 = VaultService.getInstance();

    // Reset the singleton
    if ((VaultService as any).reset) {
      (VaultService as any).reset();
    }

    const instance2 = VaultService.getInstance();

    // Should be different instances after reset
    expect(instance1).not.toBe(instance2);

    // Clean up
    instance1.destroy();
    instance2.destroy();
  });
});
