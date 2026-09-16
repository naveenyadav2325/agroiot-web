import { AIInferenceResult } from '../../types';
import { AIInferenceAdapter, EdgeModelSpecs } from './AIInferenceAdapter';

export interface SampleLeafProfile {
  id: string;
  name: string;
  category: 'Healthy' | 'Disease' | 'Pest' | 'Nutrient';
  result: AIInferenceResult;
  thumbnailSvg: string;
}

export class MockEdgeAIAdapter implements AIInferenceAdapter {
  private ready: boolean = true;
  private readonly specs: EdgeModelSpecs = {
    name: 'Edge AI Crop Health Model',
    architecture: 'MobileNetV3-Small-Agronomy (Custom Head)',
    inputShape: '224 × 224 × 3 (RGB)',
    quantization: 'INT8 Post-Training Quantization',
    inferenceEngine: 'Edge ONNX Runtime / TFLite Embedded',
    averageLatencyMs: 84,
    memoryFootprintMb: 4.6,
    status: 'ACTIVE',
  };

  public readonly sampleLeaves: SampleLeafProfile[] = [
    {
      id: 'tomato_early_blight',
      name: 'Tomato — Early Blight',
      category: 'Disease',
      result: {
        id: 'scan-eb-01',
        cropDetected: 'Tomato (Solanum lycopersicum)',
        healthStatus: 'Early Disease',
        possibleDisease: 'Early Blight (Alternaria solani)',
        pestIndication: null,
        nutrientStress: null,
        confidence: 91,
        inferenceTimeMs: 84,
        modelName: 'Edge AI Crop Health Model (INT8)',
        recommendation: 'Apply organic copper hydroxide bio-fungicide. Prune infected bottom leaves and avoid overhead canopy irrigation.',
        timestamp: new Date().toLocaleTimeString(),
        diagnosticDetails: {
          symptomsObserved: ['Target-like concentric ring spots', 'Yellow halo chlorosis', 'Lower foliar senescence'],
          pathogenType: 'Fungal (Alternaria solani)',
          preventativeMeasures: ['Drip irrigation instead of overhead spray', 'Stake plants to promote air circulation', 'Rotate nightshade crops on a 3-year cycle'],
          curativeMeasures: ['Apply copper-based fungicide spray at 7-day intervals', 'Safely burn or bury diseased trimmings'],
        },
      },
      thumbnailSvg: 'early_blight',
    },
    {
      id: 'tomato_healthy',
      name: 'Tomato — Healthy Foliage',
      category: 'Healthy',
      result: {
        id: 'scan-h-01',
        cropDetected: 'Tomato (Solanum lycopersicum)',
        healthStatus: 'Healthy',
        possibleDisease: null,
        pestIndication: null,
        nutrientStress: null,
        confidence: 96,
        inferenceTimeMs: 79,
        modelName: 'Edge AI Crop Health Model (INT8)',
        recommendation: 'Crop foliage displays excellent turgor and uniform chlorophyll distribution. Continue standard drip fertigation schedule.',
        timestamp: new Date().toLocaleTimeString(),
        diagnosticDetails: {
          symptomsObserved: ['Deep emerald pigment', 'Uniform laminar margins', 'Strong petiole structural integrity'],
          pathogenType: 'None detected',
          preventativeMeasures: ['Maintain scheduled micronutrient foliar spray', 'Weekly pest scout monitoring'],
          curativeMeasures: ['None required. Plant in peak metabolic condition.'],
        },
      },
      thumbnailSvg: 'healthy',
    },
    {
      id: 'tomato_spider_mites',
      name: 'Tomato — Spider Mite Damage',
      category: 'Pest',
      result: {
        id: 'scan-sm-01',
        cropDetected: 'Tomato (Solanum lycopersicum)',
        healthStatus: 'Pest Infestation',
        possibleDisease: null,
        pestIndication: 'Two-Spotted Spider Mite (Tetranychus urticae)',
        nutrientStress: null,
        confidence: 89,
        inferenceTimeMs: 86,
        modelName: 'Edge AI Crop Health Model (INT8)',
        recommendation: 'Release predatory mites (Phytoseiulus persimilis) and spray cold-pressed neem oil emulsion (5ml/L) under foliage.',
        timestamp: new Date().toLocaleTimeString(),
        diagnosticDetails: {
          symptomsObserved: ['Stippled yellow-white chlorotic dots', 'Micro-webbing beneath leaflet veins', 'Desiccation of leaf edges'],
          pathogenType: 'Arachnid Arthropod (Tetranychus urticae)',
          preventativeMeasures: ['Avoid dusty field perimeters', 'Maintain relative humidity above 50% around root zone'],
          curativeMeasures: ['Apply biological neem extract or horticultural oil', 'Spot-introduce Phytoseiulus beneficial predatory mites'],
        },
      },
      thumbnailSvg: 'spider_mites',
    },
    {
      id: 'tomato_late_blight',
      name: 'Tomato — Late Blight Alert',
      category: 'Disease',
      result: {
        id: 'scan-lb-01',
        cropDetected: 'Tomato (Solanum lycopersicum)',
        healthStatus: 'Advanced Disease',
        possibleDisease: 'Late Blight (Phytophthora infestans)',
        pestIndication: null,
        nutrientStress: null,
        confidence: 94,
        inferenceTimeMs: 82,
        modelName: 'Edge AI Crop Health Model (INT8)',
        recommendation: 'URGENT: Highly contagious water mold. Quarantine affected row. Apply cymoxanil/mancozeb bio-protectant immediately.',
        timestamp: new Date().toLocaleTimeString(),
        diagnosticDetails: {
          symptomsObserved: ['Dark water-soaked necrotic lesions', 'Cottony white spore mold on leaf undersides in humid mornings', 'Stem canker formation'],
          pathogenType: 'Oomycete (Phytophthora infestans)',
          preventativeMeasures: ['Plant resistant cultivars', 'Space rows at minimum 60cm for maximum airflow'],
          curativeMeasures: ['Spray contact bio-fungicide within 24 hours', 'Severely infected plants must be destroyed'],
        },
      },
      thumbnailSvg: 'late_blight',
    },
    {
      id: 'tomato_nitrogen_deficiency',
      name: 'Tomato — Nitrogen Chlorosis',
      category: 'Nutrient',
      result: {
        id: 'scan-nd-01',
        cropDetected: 'Tomato (Solanum lycopersicum)',
        healthStatus: 'Nutrient Stress',
        possibleDisease: null,
        pestIndication: null,
        nutrientStress: 'Nitrogen (N) Deficiency',
        confidence: 90,
        inferenceTimeMs: 81,
        modelName: 'Edge AI Crop Health Model (INT8)',
        recommendation: 'Soil nitrogen is depleted. Apply organic amino acid foliar booster or organic compost tea fertigation.',
        timestamp: new Date().toLocaleTimeString(),
        diagnosticDetails: {
          symptomsObserved: ['Generalized chlorosis starting from older basal leaves', 'Spindly stem growth', 'Pale green to yellow blade discoloration'],
          pathogenType: 'Abiotic / Nutritional',
          preventativeMeasures: ['Regular soil organic matter replenishment', 'Split nitrogen dosing across crop phenology'],
          curativeMeasures: ['Dose 1% urea or seaweed liquid fertilizer via drip line', 'Test soil EC and pH'],
        },
      },
      thumbnailSvg: 'nitrogen',
    },
  ];

  public async init(): Promise<void> {
    this.ready = true;
  }

  public getModelSpecs(): EdgeModelSpecs {
    return this.specs;
  }

  public isModelReady(): boolean {
    return this.ready;
  }

  public async classifyCropHealth(
    imageSource: string | File,
    presetKey?: string
  ): Promise<AIInferenceResult> {
    // Simulate real edge-inference latency on embedded NPU/CPU (e.g. 600ms - 850ms total pipeline)
    await new Promise((resolve) => setTimeout(resolve, 750));

    if (presetKey) {
      const match = this.sampleLeaves.find((l) => l.id === presetKey);
      if (match) {
        return {
          ...match.result,
          id: `scan-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          imageUrl: typeof imageSource === 'string' ? imageSource : undefined,
        };
      }
    }

    // If a custom image was uploaded, perform deterministic agronomic inference simulation
    return {
      id: `scan-${Date.now()}`,
      cropDetected: 'Tomato (Solanum lycopersicum)',
      healthStatus: 'Early Disease',
      possibleDisease: 'Early Blight (Alternaria solani)',
      pestIndication: null,
      nutrientStress: 'Slight Potassium (K) marginal chlorosis',
      confidence: 91,
      inferenceTimeMs: 84,
      modelName: 'Edge AI Crop Health Model (INT8)',
      recommendation: 'Targeted spot treatment with biological copper soap. Ensure drip emitters are not creating stagnant pools around stems.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      diagnosticDetails: {
        symptomsObserved: ['Scattered brown circular lesions on upper leaflets', 'Early stages of concentric ring development'],
        pathogenType: 'Fungal spore germination',
        preventativeMeasures: ['Mulch soil surface to prevent spore splashback during rainfall', 'Maintain canopy pruning'],
        curativeMeasures: ['Apply protective bio-fungicide spray', 'Monitor daily via AGRO-IOT scanner'],
      },
    };
  }
}
