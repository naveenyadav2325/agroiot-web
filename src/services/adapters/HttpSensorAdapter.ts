import { DemoScenario, HardwareProtocol, HardwareStatus, SensorData } from '../../types';
import { SensorAdapter } from './SensorAdapter';

export interface BackendConnectionInfo {
  backendConnected: boolean;
  hardwareConnected: boolean;
  hasTelemetry: boolean;
  message: string;
  lastChecked: string;
}

export class HttpSensorAdapter implements SensorAdapter {
  private connectionStatus: HardwareStatus = 'disconnected';
  private backendAvailable: boolean = false;
  private hasTelemetryReceived: boolean = false;
  private protocol: HardwareProtocol = 'wifi';
  private listeners: Set<(data: SensorData) => void> = new Set();
  private pollIntervalId: number | null = null;
  private scenario: DemoScenario = 'NORMAL';
  private baseUrl: string;

  // Safe fallback representation when hardware is disconnected (no fabricated values)
  private currentData: SensorData = {
    soilMoisture: 0,
    temperature: 0,
    humidity: 0,
    rainProbability: 0,
    waterLevel: 0,
    lightIntensity: 0,
    batteryLevel: 0,
    signalStrengthDbm: 0,
    timestamp: 'No telemetry',
  };

  constructor(customBaseUrl?: string) {
    const envUrl = typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '')
      : '';
    this.baseUrl = (customBaseUrl || envUrl || '').replace(/\/$/, '');
  }

  public async init(): Promise<void> {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }

    // Immediate initial check (non-blocking)
    this.fetchLatestTelemetry().catch((err) => {
      console.warn('AGRO-IOT initial backend telemetry check:', err?.message || err);
    });

    // Poll every 5 seconds for telemetry updates
    this.pollIntervalId = window.setInterval(() => {
      this.fetchLatestTelemetry().catch(() => {
        // Suppress recurring network noise in console while disconnected
      });
    }, 5000);
  }

  public async fetchLatestTelemetry(): Promise<SensorData | null> {
    try {
      const url = `${this.baseUrl}/api/sensors/latest`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      // Backend returns 503 when backend is online but no sensor hardware has posted telemetry yet
      if (res.status === 503) {
        this.backendAvailable = true;
        this.connectionStatus = 'disconnected';
        this.hasTelemetryReceived = false;
        return null;
      }

      // Check if response is JSON (prevent HTML SPA redirect page from being parsed as JSON)
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        this.backendAvailable = false;
        this.connectionStatus = 'disconnected';
        this.hasTelemetryReceived = false;
        return null;
      }

      if (!res.ok) {
        this.connectionStatus = 'disconnected';
        return null;
      }

      const json = await res.json();
      if (json && json.success && json.data) {
        const d = json.data;
        this.backendAvailable = true;
        this.hasTelemetryReceived = true;
        this.connectionStatus = 'connected';

        this.currentData = {
          soilMoisture: Number(d.soilMoisture ?? 0),
          temperature: Number(d.temperature ?? 0),
          humidity: Number(d.humidity ?? 0),
          rainProbability: Number(d.rainProbability ?? 0),
          waterLevel: Number(d.waterLevel ?? 0),
          lightIntensity: Number(d.lightIntensity ?? 0),
          batteryLevel: Number(d.battery ?? d.batteryLevel ?? 100),
          signalStrengthDbm: Number(d.signalStrengthDbm ?? -55),
          timestamp: d.timestamp
            ? new Date(d.timestamp).toLocaleTimeString([], { hour12: false })
            : new Date().toLocaleTimeString([], { hour12: false }),
        };

        this.notifyListeners();
        return this.currentData;
      } else {
        this.connectionStatus = 'disconnected';
        return null;
      }
    } catch {
      // Backend is offline / unreachable
      this.backendAvailable = false;
      this.connectionStatus = 'disconnected';
      this.hasTelemetryReceived = false;
      return null;
    }
  }

  public getLatestData(): SensorData {
    return this.currentData;
  }

  public hasTelemetry(): boolean {
    return this.hasTelemetryReceived;
  }

  public isBackendOnline(): boolean {
    return this.backendAvailable;
  }

  public subscribe(callback: (data: SensorData) => void): () => void {
    this.listeners.add(callback);
    if (this.hasTelemetryReceived) {
      callback(this.currentData);
    }
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentData);
      } catch (err) {
        console.error('Error invoking telemetry listener:', err);
      }
    });
  }

  public setScenario(scenario: DemoScenario): void {
    this.scenario = scenario;
  }

  public getScenario(): DemoScenario {
    return this.scenario;
  }

  public setConnectionStatus(status: HardwareStatus): void {
    this.connectionStatus = status;
  }

  public getConnectionStatus(): HardwareStatus {
    return this.connectionStatus;
  }

  public setProtocol(protocol: HardwareProtocol): void {
    this.protocol = protocol;
  }

  public getProtocol(): HardwareProtocol {
    return this.protocol;
  }

  public async simulatePing(): Promise<number> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        this.backendAvailable = true;
        return Math.max(1, Date.now() - start);
      }
      return 0;
    } catch {
      this.backendAvailable = false;
      return 0;
    }
  }

  public async connect(): Promise<boolean> {
    const data = await this.fetchLatestTelemetry();
    return data !== null;
  }

  public async disconnect(): Promise<boolean> {
    this.connectionStatus = 'disconnected';
    return true;
  }

  public destroy(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
    this.listeners.clear();
  }
}
