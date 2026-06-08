import EventEmitter from 'eventemitter3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHapticsRuntime } from './runtime';
import type {
  HapticsActuator,
  HapticsActuatorType,
  HapticsBackend,
  HapticsBackendEvents,
  HapticsDeviceClass,
  HapticsSensor,
} from './types';

class FakeBackend extends EventEmitter<HapticsBackendEvents> implements HapticsBackend {
  readonly name: string;
  readonly deviceClass: HapticsDeviceClass;
  connect = vi.fn(async () => {});
  disconnect = vi.fn(async () => {});
  isConnected = vi.fn(() => true);
  scan = vi.fn(async () => {});
  stopScan = vi.fn(async () => {});
  getActuators = vi.fn((): HapticsActuator[] => []);
  getSensors = vi.fn((): HapticsSensor[] => []);
  actuate = vi.fn(
    async (
      _actuatorId: number,
      _type: HapticsActuatorType,
      _intensity: number,
      _options?: { duration?: number; clockwise?: boolean },
    ) => {},
  );
  stop = vi.fn(async (_actuatorId?: number) => {});
  subscribeSensor = vi.fn((_sensorId: number, _rateHz: number) => {});
  unsubscribeSensor = vi.fn((_sensorId: number) => {});
  emergencyStop = vi.fn(async () => {});

  constructor(name: string, deviceClass: HapticsDeviceClass) {
    super();
    this.name = name;
    this.deviceClass = deviceClass;
  }
}

describe('createHapticsRuntime', () => {
  const service = {
    emergencyStop: vi.fn(),
    registerBackend: vi.fn(),
    unregisterBackend: vi.fn(async (_backend: HapticsBackend) => {}),
  };
  const logger = {
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers and connects the gamepad backend immediately', () => {
    const gamepadBackend = new FakeBackend('gamepad', 'gaming');

    createHapticsRuntime({
      service,
      createGamepadBackend: () => gamepadBackend,
      logger,
    });

    expect(service.registerBackend).toHaveBeenCalledWith(gamepadBackend);
    expect(gamepadBackend.connect).toHaveBeenCalledOnce();
  });

  it('loads and registers the WASM backend only when haptics are enabled', async () => {
    const gamepadBackend = new FakeBackend('gamepad', 'gaming');
    const wasmBackend = new FakeBackend('buttplug-wasm', 'intimate');
    const createWasmBackend = vi.fn(async () => wasmBackend);
    const runtime = createHapticsRuntime({
      service,
      createGamepadBackend: () => gamepadBackend,
      createWasmBackend,
      logger,
    });

    runtime.setEnabled(false);
    await Promise.resolve();

    expect(createWasmBackend).not.toHaveBeenCalled();

    runtime.setEnabled(true);

    expect(createWasmBackend).toHaveBeenCalledOnce();
    await vi.waitFor(() => {
      expect(service.registerBackend).toHaveBeenCalledWith(wasmBackend);
    });

    runtime.setEnabled(true);
    await Promise.resolve();

    expect(createWasmBackend).toHaveBeenCalledOnce();
  });

  it('retries WASM loading after a failed load', async () => {
    const gamepadBackend = new FakeBackend('gamepad', 'gaming');
    const wasmBackend = new FakeBackend('buttplug-wasm', 'intimate');
    const createWasmBackend = vi
      .fn<[], Promise<HapticsBackend>>()
      .mockRejectedValueOnce(new Error('no wasm'))
      .mockResolvedValueOnce(wasmBackend);
    const runtime = createHapticsRuntime({
      service,
      createGamepadBackend: () => gamepadBackend,
      createWasmBackend,
      logger,
    });

    runtime.setEnabled(true);

    await vi.waitFor(() => {
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to load buttplug WASM backend:',
        expect.any(Error),
      );
    });

    runtime.setEnabled(true);

    await vi.waitFor(() => {
      expect(createWasmBackend).toHaveBeenCalledTimes(2);
      expect(service.registerBackend).toHaveBeenCalledWith(wasmBackend);
    });
  });

  it('unregisters registered backends on dispose', async () => {
    const gamepadBackend = new FakeBackend('gamepad', 'gaming');
    const wasmBackend = new FakeBackend('buttplug-wasm', 'intimate');
    const runtime = createHapticsRuntime({
      service,
      createGamepadBackend: () => gamepadBackend,
      createWasmBackend: async () => wasmBackend,
      logger,
    });

    runtime.setEnabled(true);
    await Promise.resolve();
    await runtime.dispose();

    expect(service.unregisterBackend).toHaveBeenCalledWith(wasmBackend);
    expect(service.unregisterBackend).toHaveBeenCalledWith(gamepadBackend);
  });

  it('delegates emergency stop to the haptics service', () => {
    const gamepadBackend = new FakeBackend('gamepad', 'gaming');
    const runtime = createHapticsRuntime({
      service,
      createGamepadBackend: () => gamepadBackend,
      logger,
    });

    runtime.emergencyStop();

    expect(service.emergencyStop).toHaveBeenCalledOnce();
  });
});
