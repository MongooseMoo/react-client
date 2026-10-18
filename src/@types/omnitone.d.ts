declare module "omnitone/build/omnitone.min.esm.js" {
  export interface FOARenderer {
    readonly input: AudioNode;
    readonly output: AudioNode;
    initialize(): Promise<void>;
    setRenderingMode(mode: "ambisonic" | "bypass" | "off"): void;
    setRotationMatrix3(matrix: Float32Array): void;
    setRotationMatrix4(matrix: Float32Array): void;
  }

  export interface FOARendererConfig {
    hrirPathList?: string[];
    renderingMode?: "ambisonic" | "bypass" | "off";
  }

  export interface OmnitoneModule {
    createFOARenderer(context: BaseAudioContext, config?: FOARendererConfig): FOARenderer;
  }

  const Omnitone: OmnitoneModule;
  export default Omnitone;
}
