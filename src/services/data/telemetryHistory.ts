import { DemoScenario, TelemetryHistoryPoint } from '../../types';

export function generateTelemetryHistory(
  scenario: DemoScenario,
  range: '24H' | '7D' | '30D'
): TelemetryHistoryPoint[] {
  const points: TelemetryHistoryPoint[] = [];
  const now = Date.now();

  let count = 24; // 24 hours
  let stepMs = 60 * 60 * 1000; // 1 hour step

  if (range === '7D') {
    count = 28; // ~4 points a day for 7 days
    stepMs = 6 * 60 * 60 * 1000;
  } else if (range === '30D') {
    count = 30; // 1 point a day for 30 days
    stepMs = 24 * 60 * 60 * 1000;
  }

  // Base values per scenario
  let baseMoisture = 58;
  let baseTemp = 26;
  let baseHum = 64;
  let baseHealth = 92;
  let baseDiseaseRisk = 18;
  let basePestRisk = 15;

  if (scenario === 'LOW_MOISTURE') {
    baseMoisture = 32;
    baseTemp = 29;
    baseHum = 44;
    baseHealth = 68;
    baseDiseaseRisk = 12;
    basePestRisk = 25;
  } else if (scenario === 'HEAT_STRESS') {
    baseMoisture = 37;
    baseTemp = 36;
    baseHum = 30;
    baseHealth = 62;
    baseDiseaseRisk = 15;
    basePestRisk = 65;
  } else if (scenario === 'DISEASE_ALERT') {
    baseMoisture = 72;
    baseTemp = 24;
    baseHum = 88;
    baseHealth = 58;
    baseDiseaseRisk = 85;
    basePestRisk = 20;
  } else if (scenario === 'PEST_ALERT') {
    baseMoisture = 52;
    baseTemp = 31;
    baseHum = 48;
    baseHealth = 64;
    baseDiseaseRisk = 20;
    basePestRisk = 82;
  } else if (scenario === 'FLOOD') {
    baseMoisture = 94;
    baseTemp = 22;
    baseHum = 92;
    baseHealth = 52;
    baseDiseaseRisk = 75;
    basePestRisk = 15;
  }

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * stepMs;
    const date = new Date(timestamp);
    let timeLabel = '';

    if (range === '24H') {
      timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (range === '7D') {
      timeLabel = `${date.toLocaleDateString([], { weekday: 'short' })} ${date.getHours()}:00`;
    } else {
      timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    // Realistic day-night sinusoidal wave
    const hourOfDay = date.getHours();
    const solarFactor = Math.sin(((hourOfDay - 6) / 24) * 2 * Math.PI); // Peak at 12-14:00
    const tempNoise = (Math.random() - 0.5) * 1.5;
    const moistNoise = (Math.random() - 0.5) * 2;

    const temp = Number((baseTemp + solarFactor * 4 + tempNoise).toFixed(1));
    const hum = Number(Math.max(15, Math.min(99, baseHum - solarFactor * 12 + tempNoise * 2)).toFixed(1));
    
    // Gradual decline or rise towards current scenario state
    const progressToCurrent = (count - i) / count;
    const scenarioDrift = (progressToCurrent - 0.5) * 4;
    const moisture = Number(Math.max(10, Math.min(99, baseMoisture + scenarioDrift + moistNoise)).toFixed(1));

    // Irrigation events: spikes when moisture dipped or scheduled
    let irrigationEvent = 0;
    if (scenario !== 'FLOOD' && (i === 18 || i === 8 || (scenario === 'LOW_MOISTURE' && i === 3))) {
      irrigationEvent = Math.round(18 + Math.random() * 12);
    }

    const health = Math.max(30, Math.min(99, Math.round(baseHealth + (Math.random() - 0.5) * 4)));
    const diseaseScore = Math.max(5, Math.min(98, Math.round(baseDiseaseRisk + (hum > 75 ? 15 : 0) + (Math.random() - 0.5) * 5)));
    const pestScore = Math.max(5, Math.min(98, Math.round(basePestRisk + (temp > 30 ? 15 : 0) + (Math.random() - 0.5) * 5)));

    points.push({
      time: timeLabel,
      timestamp,
      soilMoisture: moisture,
      temperature: temp,
      humidity: hum,
      irrigationEvent,
      cropHealth: health,
      diseaseRiskScore: diseaseScore,
      pestRiskScore: pestScore,
    });
  }

  return points;
}

export function getHistoricalData(range: '24h' | '7d' | '30d'): TelemetryHistoryPoint[] {
  const mapRange: Record<'24h' | '7d' | '30d', '24H' | '7D' | '30D'> = {
    '24h': '24H',
    '7d': '7D',
    '30d': '30D',
  };
  return generateTelemetryHistory('NORMAL', mapRange[range]);
}

export function getDailyWaterConsumption(): { day: string; litres: number; savedVsTimer: number }[] {
  return [
    { day: 'Mon', litres: 240, savedVsTimer: 90 },
    { day: 'Tue', litres: 180, savedVsTimer: 120 },
    { day: 'Wed', litres: 310, savedVsTimer: 60 },
    { day: 'Thu', litres: 210, savedVsTimer: 105 },
    { day: 'Fri', litres: 140, savedVsTimer: 150 },
    { day: 'Sat', litres: 260, savedVsTimer: 80 },
    { day: 'Sun', litres: 195, savedVsTimer: 110 },
  ];
}

