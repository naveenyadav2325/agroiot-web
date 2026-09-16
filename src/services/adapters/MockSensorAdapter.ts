import { DemoScenario, HardwareProtocol, HardwareStatus, SensorData } from '../../types';
import { SensorAdapter } from './SensorAdapter';

export class MockSensorAdapter implements SensorAdapter {
  private currentScenario: DemoScenario = 'NORMAL';
  private connectionStatus: HardwareStatus = 'connected';
  private protocol: HardwareProtocol = 'wifi';
  private listeners: Set<(data: SensorData) => void> = new Set();
  private intervalId: number | null = null;
  private currentData: SensorData;

  // Baseline values per scenario
  private scenarioBaselines: Record<DemoScenario, Omit<SensorData, 'timestamp' | 'batteryLevel' | 'signalStrengthDbm'>> = {
    NORMAL: {
      soilMoisture: 58.4,
      temperature: 26.8,
      humidity: 64.2,
      rainProbability: 15,
      waterLevel: 42.0,
      lightIntensity: 48500,
    },
    LOW_MOISTURE: {
      soilMoisture: 28.5,
      temperature: 30.2,
      humidity: 42.0,
      rainProbability: 5,
      waterLevel: 28.0,
      lightIntensity: 56000,
    },
    HEAT_STRESS: {
      soilMoisture: 35.8,
      temperature: 37.6,
      humidity: 29.5,
      rainProbability: 2,
      waterLevel: 22.0,
      lightIntensity: 74000,
    },
    DISEASE_ALERT: {
      soilMoisture: 73.5,
      temperature: 24.5,
      humidity: 88.5,
      rainProbability: 65,
      waterLevel: 68.0,
      lightIntensity: 26000,
    },
    PEST_ALERT: {
      soilMoisture: 51.0,
      temperature: 31.8,
      humidity: 47.5,
      rainProbability: 8,
      waterLevel: 38.0,
      lightIntensity: 51000,
    },
    FLOOD: {
      soilMoisture: 94.8,
      temperature: 21.8,
      humidity: 93.0,
      rainProbability: 90,
      waterLevel: 95.5,
      lightIntensity: 18000,
    },
  };

  constructor() {
    this.currentData = this.generateDataPoint(this.currentScenario);
  }

  public async init(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Tick every 3.5 seconds to simulate real sensor sampling cycles
    this.intervalId = window.setInterval(() => {
      if (this.connectionStatus === 'connected') {
        this.currentData = this.generateDataPoint(this.currentScenario);
        this.notifyListeners();
      }
    }, 3500);
  }

  private generateDataPoint(scenario: DemoScenario): SensorData {
    const base = this.scenarioBaselines[scenario];
    // Gentle micro-jitter simulating real ADC noise and analog drift
    const jitter = (range: number) => (Math.random() - 0.5) * range;

    const soilMoisture = Math.min(100, Math.max(0, Number((base.soilMoisture + jitter(0.6)).toFixed(1))));
    const temperature = Number((base.temperature + jitter(0.4)).toFixed(1));
    const humidity = Math.min(100, Math.max(10, Number((base.humidity + jitter(0.8)).toFixed(1))));
    const rainProbability = Math.min(100, Math.max(0, Math.round(base.rainProbability + jitter(2))));
    const waterLevel = Math.min(100, Math.max(0, Number((base.waterLevel + jitter(0.5)).toFixed(1))));
    const lightIntensity = Math.max(0, Math.round(base.lightIntensity + jitter(800)));

    // Hardware signal & battery
    const batteryLevel = 94; // %
    const signalStrengthDbm = this.protocol === 'bluetooth' ? -62 : -58; // dBm

    return {
      soilMoisture,
      temperature,
      humidity,
      rainProbability,
      waterLevel,
      lightIntensity,
      batteryLevel,
      signalStrengthDbm,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };
  }

  public getLatestData(): SensorData {
    return this.currentData;
  }

  public subscribe(callback: (data: SensorData) => void): () => void {
    this.listeners.add(callback);
    // Immediately emit current data
    callback(this.currentData);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentData);
    }
  }

  public setScenario(scenario: DemoScenario): void {
    this.currentScenario = scenario;
    this.currentData = this.generateDataPoint(scenario);
    this.notifyListeners();
  }

  public getScenario(): DemoScenario {
    return this.currentScenario;
  }

  public setConnectionStatus(status: HardwareStatus): void {
    this.connectionStatus = status;
    this.notifyListeners();
  }

  public getConnectionStatus(): HardwareStatus {
    return this.connectionStatus;
  }

  public setProtocol(protocol: HardwareProtocol): void {
    this.protocol = protocol;
    this.notifyListeners();
  }

  public getProtocol(): HardwareProtocol {
    return this.protocol;
  }

  public async simulatePing(): Promise<number> {
    if (this.connectionStatus === 'disconnected') {
      throw new Error('Hardware is disconnected. Check gateway power.');
    }
    // Realistic ping latency based on protocol
    const latencyMap: Record<HardwareProtocol, number> = {
      wifi: 24 + Math.round(Math.random() * 12),
      bluetooth: 48 + Math.round(Math.random() * 20),
      serial: 6 + Math.round(Math.random() * 4),
      mqtt: 38 + Math.round(Math.random() * 15),
    };
    return latencyMap[this.protocol];
  }

  public async connect(): Promise<boolean> {
    this.connectionStatus = 'connecting';
    this.notifyListeners();
    await new Promise((res) => setTimeout(res, 800));
    this.connectionStatus = 'connected';
    this.currentData = this.generateDataPoint(this.currentScenario);
    this.notifyListeners();
    return true;
  }

  public async disconnect(): Promise<boolean> {
    this.connectionStatus = 'disconnected';
    this.notifyListeners();
    return true;
  }
}
