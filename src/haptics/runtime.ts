import { type HapticsService, hapticsService } from '../HapticsService';
import { ButtplugWasmBackend, createRealWasmDeps } from './ButtplugWasmBackend';
import { GamepadBackend } from './GamepadBackend';
import type { HapticsBackend } from './types';

type HapticsRuntimeService = Pick<
  HapticsService,
  'emergencyStop' | 'registerBackend' | 'unregisterBackend'
>;

interface HapticsRuntimeOptions {
  service?: HapticsRuntimeService;
  createGamepadBackend?: () => HapticsBackend;
  createWasmBackend?: () => Promise<HapticsBackend>;
  logger?: Pick<Console, 'error' | 'log' | 'warn'>;
}

export interface HapticsRuntime {
  setEnabled(enabled: boolean): void;
  emergencyStop(): void;
  dispose(): Promise<void>;
}

async function createWasmBackend(): Promise<HapticsBackend> {
  const deps = await createRealWasmDeps();
  return new ButtplugWasmBackend(deps);
}

export function createHapticsRuntime(options: HapticsRuntimeOptions = {}): HapticsRuntime {
  const service = options.service ?? hapticsService;
  const logger = options.logger ?? console;
  const gamepadBackend = (options.createGamepadBackend ?? (() => new GamepadBackend()))();
  const buildWasmBackend = options.createWasmBackend ?? createWasmBackend;
  const registeredBackends = new Set<HapticsBackend>();

  let disposed = false;
  let wasmBackend: HapticsBackend | null = null;
  let wasmLoadStarted = false;
  let wasmLoadVersion = 0;

  const registerBackend = (backend: HapticsBackend): void => {
    if (disposed || registeredBackends.has(backend)) return;
    service.registerBackend(backend);
    registeredBackends.add(backend);
  };

  const unregisterRegisteredBackends = async (): Promise<void> => {
    const backends = [...registeredBackends].reverse();
    registeredBackends.clear();
    await Promise.all(
      backends.map((backend) =>
        service.unregisterBackend(backend).catch((error) => {
          logger.error('Failed to unregister haptics backend:', error);
        }),
      ),
    );
  };

  const loadWasmBackend = (): void => {
    if (disposed || wasmBackend || wasmLoadStarted) return;

    wasmLoadStarted = true;
    const loadVersion = ++wasmLoadVersion;

    buildWasmBackend()
      .then((backend) => {
        if (disposed || loadVersion !== wasmLoadVersion) {
          return backend.disconnect().catch((error) => {
            logger.error('Failed to disconnect unused haptics backend:', error);
          });
        }

        wasmBackend = backend;
        registerBackend(backend);
        logger.log('ButtplugWasmBackend registered (WASM loaded)');
      })
      .catch((error) => {
        if (disposed || loadVersion !== wasmLoadVersion) return;
        wasmLoadStarted = false;
        logger.warn('Failed to load buttplug WASM backend:', error);
      });
  };

  registerBackend(gamepadBackend);
  gamepadBackend.connect().catch((error) => {
    logger.error('Failed to connect gamepad haptics backend:', error);
  });

  return {
    setEnabled(enabled: boolean): void {
      if (!enabled) return;
      loadWasmBackend();
    },

    emergencyStop(): void {
      service.emergencyStop();
    },

    async dispose(): Promise<void> {
      if (disposed) return;
      disposed = true;
      wasmLoadVersion++;
      await unregisterRegisteredBackends();
    },
  };
}
