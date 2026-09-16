import { DemoScenario, HardwareProtocol, HardwareStatus, SensorData } from '../../types';

export interface SensorAdapter {
  init(): Promise<void>;
  getLatestData(): SensorData;
  subscribe(callback: (data: SensorData) => void): () => void;
  setScenario(scenario: DemoScenario): void;
  getScenario(): DemoScenario;
  setConnectionStatus(status: HardwareStatus): void;
  getConnectionStatus(): HardwareStatus;
  setProtocol(protocol: HardwareProtocol): void;
  getProtocol(): HardwareProtocol;
  simulatePing(): Promise<number>; // Latency in ms
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  setManualOverride?(param: Partial<SensorData>): void;
}
