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

  /** The rotator inside FOARenderer; it writes its matrix as gain.value. */
  export interface FOARotator {
    readonly input: AudioNode;
    readonly output: AudioNode;
    setRotationMatrix3(matrix: Float32Array): void;
  }

  export interface OmnitoneModule {
    createFOARenderer(context: BaseAudioContext, config?: FOARendererConfig): FOARenderer;
    createFOARotator(context: BaseAudioContext): FOARotator;
  }

  const Omnitone: OmnitoneModule;
  export default Omnitone;
}
