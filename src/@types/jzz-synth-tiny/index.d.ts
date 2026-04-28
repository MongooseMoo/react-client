import JZZ from "jzz";

declare module "jzz" {
  interface JZZ {
    synth: {
      Tiny: {
        (name?: string): unknown;
        register(name?: string): void;
        version(): string;
      };
    };
  }
}

declare module "jzz-synth-tiny" {
  export function Tiny(jzz: typeof JZZ): void;
}
