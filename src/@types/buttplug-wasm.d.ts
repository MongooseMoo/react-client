declare module "buttplug-wasm/dist/buttplug-wasm.mjs" {
  export class ButtplugWasmClientConnector {
    Connected: boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    static activateLogging(): Promise<void>;
  }
}
