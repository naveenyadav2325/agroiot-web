export type DemoScenario = 
  | 'NORMAL'
  | 'LOW_MOISTURE'
  | 'HEAT_STRESS'
  | 'DISEASE_ALERT'
  | 'PEST_ALERT'
  | 'FLOOD';

export type HardwareStatus = 'connected' | 'disconnected' | 'connecting';
export type HardwareProtocol = 'wifi' | 'bluetooth' | 'serial' | 'mqtt';

export interface SensorData {
  soilMoisture: number; // in %
  temperature: number; // in °C
  humidity: number; // in %
  rainProbability: number; // in %
  waterLevel: number; // in % or cm
  lightIntensity: number; // in Lux
  batteryLevel: number; // in %
  signalStrengthDbm: number; // in dBm
  timestamp: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskAssessment {
  heatStress: RiskLevel;
  heatStressExplanation: string;
  waterStress: RiskLevel;
  waterStressExplanation: string;
  floodRisk: RiskLevel;
  floodRiskExplanation: string;
  diseaseRisk: RiskLevel;
  diseaseRiskExplanation: string;
  pestRisk: RiskLevel;
  pestRiskExplanation: string;
  overallCropHealth: number; // 0 - 100
  healthStatusLabel: 'Optimal' | 'Caution' | 'Action Needed' | 'Critical';
}

export type IrrigationDecisionState = 'Optimal' | 'Not Required' | 'Monitor' | 'Recommended';

export interface IrrigationDecision {
  decision: IrrigationDecisionState;
  why: string;
  recommendedDurationMinutes: number;
  recommendedLitersPerSqM: number;
  soilMoistureDeficit: number;
  lastIrrigationTime: string;
  nextScheduledCheck: string;
  valve1Status: 'OPEN' | 'CLOSED';
  valve2Status: 'OPEN' | 'CLOSED';
  autoMode: boolean;
}

export interface FarmAdvisory {
  id: string;
  title: string;
  summary: string;
  whyThisAlert: string;
  whatShouldIDo: string[];
  whatNotToDo: string[];
  next24To48Hours: string;
  priority: 'Urgent' | 'Moderate' | 'Informational';
  category: 'irrigation' | 'disease' | 'pest' | 'climate' | 'soil';
  timestamp: string;
  expectedImpact: string;
  translations?: {
    hi?: {
      title: string;
      summary: string;
      whyThisAlert: string;
      whatShouldIDo: string[];
    };
    es?: {
      title: string;
      summary: string;
      whyThisAlert: string;
      whatShouldIDo: string[];
    };
  };
}

export interface CropProfile {
  name: string;
  field: string;
  growthStage: 'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvesting';
  plantedDate: string;
  optimalMoistureMin: number;
  optimalMoistureMax: number;
  maxTempThreshold: number;
  minTempThreshold: number;
  criticalHeatTemp: number;
}

export interface AIInferenceResult {
  id: string;
  cropDetected: string;
  healthStatus: 'Healthy' | 'Early Disease' | 'Advanced Disease' | 'Pest Infestation' | 'Nutrient Stress';
  possibleDisease: string | null;
  pestIndication: string | null;
  nutrientStress: string | null;
  confidence: number; // Percentage e.g. 91
  inferenceTimeMs: number; // e.g. 84
  modelName: string;
  recommendation: string;
  timestamp: string;
  imageUrl?: string;
  diagnosticDetails?: {
    symptomsObserved: string[];
    pathogenType?: string;
    preventativeMeasures: string[];
    curativeMeasures: string[];
  };
}

export interface FarmAlert {
  id: string;
  type: 'disease' | 'pest' | 'moisture' | 'heat' | 'flood' | 'hardware';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  source: 'Sensor' | 'Edge AI' | 'Environmental Model';
  title: string;
  message: string;
  actionRecommended: string;
  timestamp: string;
  isRead: boolean;
}

export type AlertItem = FarmAlert;

export interface ThresholdConfig {
  minSoilMoisture: number; // % below which irrigation triggers
  targetSoilMoisture: number; // % desired level
  maxSoilMoisture: number; // % above which waterlogging warning occurs
  maxTemperature: number; // °C heat stress threshold
  minTemperature: number; // °C frost / cold stress
  maxHumidity: number; // % high humidity disease risk
  rainThreshold: number; // % rain probability above which irrigation is deferred
  waterLevelWarning: number; // % or cm
}

export interface TelemetryHistoryPoint {
  time: string;
  timestamp: number;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  irrigationEvent: number; // Liters or minutes
  cropHealth: number;
  diseaseRiskScore: number; // 0-100
  pestRiskScore: number; // 0-100
}
