export interface UploadedImage {
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
}

export interface LightingOptions {
  ambientLightColor: string;
  ambientLightIntensity: number;
  directionalLightColor: string;
  directionalLightIntensity: number;
  lightDirection: string;
  shadowIntensity: number;
}

export interface StylePreset {
  name: string;
  prompt: string;
  lighting?: Partial<LightingOptions>;
}
