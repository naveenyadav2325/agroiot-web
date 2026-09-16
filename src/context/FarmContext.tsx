import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AIInferenceResult,
  AlertItem,
  CropProfile,
  DemoScenario,
  FarmAdvisory,
  HardwareProtocol,
  HardwareStatus,
  IrrigationDecision,
  RiskAssessment,
  SensorData,
  ThresholdConfig,
} from '../types';
import { EdgeModelSpecs } from '../services/adapters/AIInferenceAdapter';
import { MockEdgeAIAdapter } from '../services/adapters/MockEdgeAIAdapter';
import { MockSensorAdapter } from '../services/adapters/MockSensorAdapter';
import { DecisionEngine } from '../services/engine/DecisionEngine';

interface FarmContextType {
  sensorData: SensorData;
  hardwareStatus: HardwareStatus;
  hardwareProtocol: HardwareProtocol;
  mode: 'LIVE' | 'DEMO';
  scenario: DemoScenario;
  crop: CropProfile;
  thresholds: ThresholdConfig;
  riskAssessment: RiskAssessment;
  irrigationDecision: IrrigationDecision;
  advisory: FarmAdvisory;
  alerts: AlertItem[];
  unreadAlertsCount: number;
  latestScan: AIInferenceResult | null;
  scanHistory: AIInferenceResult[];
  isScanning: boolean;
  edgeSpecs: EdgeModelSpecs;
  pingMs: number;
  isOfflineSimulated: boolean;

  // Actions
  setMode: (mode: 'LIVE' | 'DEMO') => void;
  setScenario: (scenario: DemoScenario) => void;
  setHardwareStatus: (status: HardwareStatus) => void;
  setProtocol: (protocol: HardwareProtocol) => void;
  toggleOfflineSimulated: () => void;
  reconnectHardware: () => Promise<void>;
  disconnectHardware: () => Promise<void>;
  updateThresholds: (partial: Partial<ThresholdConfig>) => void;
  updateCropProfile: (partial: Partial<CropProfile>) => void;
  runCropScan: (imageSource: string | File, presetKey?: string) => Promise<AIInferenceResult>;
  markAlertAsRead: (id: string) => void;
  markAllAlertsAsRead: () => void;
  dismissAlert: (id: string) => void;
  toggleValve: (valve: 1 | 2) => void;
}

const defaultCrop: CropProfile = {
  name: 'Tomato (Roma Hybrid)',
  field: 'Demo Farm — Plot Alpha',
  growthStage: 'Flowering',
  plantedDate: '62 days ago',
  optimalMoistureMin: 50,
  optimalMoistureMax: 70,
  maxTempThreshold: 34,
  minTempThreshold: 14,
  criticalHeatTemp: 36,
};

const defaultThresholds: ThresholdConfig = {
  minSoilMoisture: 42,
  targetSoilMoisture: 60,
  maxSoilMoisture: 85,
  maxTemperature: 35,
  minTemperature: 15,
  maxHumidity: 80,
  rainThreshold: 50,
  waterLevelWarning: 80,
};

const sensorAdapter = new MockSensorAdapter();
const edgeAdapter = new MockEdgeAIAdapter();

const FarmContext = createContext<FarmContextType | null>(null);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sensorData, setSensorData] = useState<SensorData>(sensorAdapter.getLatestData());
  const [hardwareStatus, setHardwareStatusState] = useState<HardwareStatus>(sensorAdapter.getConnectionStatus());
  const [hardwareProtocol, setHardwareProtocolState] = useState<HardwareProtocol>(sensorAdapter.getProtocol());
  const [mode, setMode] = useState<'LIVE' | 'DEMO'>('DEMO');
  const [scenario, setScenarioState] = useState<DemoScenario>('NORMAL');
  const [crop, setCrop] = useState<CropProfile>(defaultCrop);
  const [thresholds, setThresholds] = useState<ThresholdConfig>(defaultThresholds);
  const [latestScan, setLatestScan] = useState<AIInferenceResult | null>(null);
  const [scanHistory, setScanHistory] = useState<AIInferenceResult[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [pingMs, setPingMs] = useState<number>(24);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [valve1Manual, setValve1Manual] = useState<'OPEN' | 'CLOSED' | null>(null);
  const [valve2Manual, setValve2Manual] = useState<'OPEN' | 'CLOSED' | null>(null);

  // Initialize sensor adapter
  useEffect(() => {
    sensorAdapter.init();
    edgeAdapter.init();

    const unsubscribe = sensorAdapter.subscribe((data) => {
      setSensorData(data);
      setHardwareStatusState(sensorAdapter.getConnectionStatus());
    });

    // Initial ping simulation check
    sensorAdapter.simulatePing().then((ms) => setPingMs(ms)).catch(() => setPingMs(0));

    // Pre-populate with initial healthy scan history item
    const initialScan = edgeAdapter.sampleLeaves[1].result;
    setScanHistory([initialScan]);

    return () => {
      unsubscribe();
    };
  }, []);

  // Update scenario
  const setScenario = (newScenario: DemoScenario) => {
    setScenarioState(newScenario);
    sensorAdapter.setScenario(newScenario);

    // If switching to disease scenario, pre-link scan context if not already scanned
    if (newScenario === 'DISEASE_ALERT') {
      const diseaseScan = edgeAdapter.sampleLeaves[0].result;
      setLatestScan(diseaseScan);
      setScanHistory((prev) => [diseaseScan, ...prev.filter((item) => item.id !== diseaseScan.id)]);
    } else if (newScenario === 'PEST_ALERT') {
      const pestScan = edgeAdapter.sampleLeaves[2].result;
      setLatestScan(pestScan);
      setScanHistory((prev) => [pestScan, ...prev.filter((item) => item.id !== pestScan.id)]);
    }
  };

  const setHardwareStatus = (status: HardwareStatus) => {
    setHardwareStatusState(status);
    sensorAdapter.setConnectionStatus(status);
    if (status === 'connected') {
      sensorAdapter.simulatePing().then((ms) => setPingMs(ms)).catch(() => setPingMs(0));
    } else {
      setPingMs(0);
    }
  };

  const setProtocol = (protocol: HardwareProtocol) => {
    setHardwareProtocolState(protocol);
    sensorAdapter.setProtocol(protocol);
    sensorAdapter.simulatePing().then((ms) => setPingMs(ms)).catch(() => setPingMs(0));
  };

  const reconnectHardware = async () => {
    await sensorAdapter.connect();
    setHardwareStatusState('connected');
    const ms = await sensorAdapter.simulatePing();
    setPingMs(ms);
  };

  const disconnectHardware = async () => {
    await sensorAdapter.disconnect();
    setHardwareStatusState('disconnected');
    setPingMs(0);
  };

  const toggleOfflineSimulated = () => {
    setIsOfflineSimulated((prev) => !prev);
  };

  const updateThresholds = (partial: Partial<ThresholdConfig>) => {
    setThresholds((prev) => ({ ...prev, ...partial }));
  };

  const updateCropProfile = (partial: Partial<CropProfile>) => {
    setCrop((prev) => ({ ...prev, ...partial }));
  };

  // Evaluate dynamic decisions via DecisionEngine
  const riskAssessment = useMemo(() => {
    return DecisionEngine.evaluateRisks(sensorData, crop, thresholds, latestScan);
  }, [sensorData, crop, thresholds, latestScan]);

  const irrigationDecision = useMemo(() => {
    const base = DecisionEngine.evaluateIrrigation(sensorData, crop, thresholds);
    return {
      ...base,
      valve1Status: valve1Manual ?? base.valve1Status,
      valve2Status: valve2Manual ?? base.valve2Status,
    };
  }, [sensorData, crop, thresholds, valve1Manual, valve2Manual]);

  const advisory = useMemo(() => {
    return DecisionEngine.generateAdvisory(sensorData, riskAssessment, irrigationDecision, crop, latestScan);
  }, [sensorData, riskAssessment, irrigationDecision, crop, latestScan]);

  // Recalculate systemic alerts whenever conditions change
  useEffect(() => {
    const generated = DecisionEngine.generateAlerts(
      sensorData,
      riskAssessment,
      irrigationDecision,
      hardwareStatus === 'connected',
      latestScan
    );

    setAlerts((prevAlerts) => {
      const existingMap = new Map(prevAlerts.map((a) => [a.id, a]));
      return generated.map((gen) => {
        const existing = existingMap.get(gen.id);
        return existing ? { ...gen, read: existing.read } : gen;
      });
    });
  }, [sensorData, riskAssessment, irrigationDecision, hardwareStatus, latestScan]);

  const runCropScan = async (imageSource: string | File, presetKey?: string): Promise<AIInferenceResult> => {
    setIsScanning(true);
    try {
      const result = await edgeAdapter.classifyCropHealth(imageSource, presetKey);
      setLatestScan(result);
      setScanHistory((prev) => [result, ...prev]);
      return result;
    } finally {
      setIsScanning(false);
    }
  };

  const markAlertAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const markAllAlertsAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleValve = (valve: 1 | 2) => {
    if (valve === 1) {
      setValve1Manual((prev) => (prev === 'OPEN' ? 'CLOSED' : 'OPEN'));
    } else {
      setValve2Manual((prev) => (prev === 'OPEN' ? 'CLOSED' : 'OPEN'));
    }
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  return (
    <FarmContext.Provider
      value={{
        sensorData,
        hardwareStatus,
        hardwareProtocol,
        mode,
        scenario,
        crop,
        thresholds,
        riskAssessment,
        irrigationDecision,
        advisory,
        alerts,
        unreadAlertsCount,
        latestScan,
        scanHistory,
        isScanning,
        edgeSpecs: edgeAdapter.getModelSpecs(),
        pingMs,
        isOfflineSimulated,
        setMode,
        setScenario,
        setHardwareStatus,
        setProtocol,
        toggleOfflineSimulated,
        reconnectHardware,
        disconnectHardware,
        updateThresholds,
        updateCropProfile,
        runCropScan,
        markAlertAsRead,
        markAllAlertsAsRead,
        dismissAlert,
        toggleValve,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = (): FarmContextType => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
