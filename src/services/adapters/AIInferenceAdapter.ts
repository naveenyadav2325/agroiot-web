import { AIInferenceResult } from '../../types';

export interface EdgeModelSpecs {
  name: string;
  architecture: string;
  inputShape: string;
  quantization: string;
  inferenceEngine: string;
  averageLatencyMs: number;
  memoryFootprintMb: number;
  status: 'ACTIVE' | 'INITIALIZING' | 'STANDBY';
}

export interface AIInferenceAdapter {
  init(): Promise<void>;
  classifyCropHealth(imageSource: string | File, presetKey?: string): Promise<AIInferenceResult>;
  getModelSpecs(): EdgeModelSpecs;
  isModelReady(): boolean;
}
