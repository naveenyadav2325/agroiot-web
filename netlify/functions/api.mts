import type { Config, Context } from '@netlify/functions';

// In-memory telemetry cache for the serverless instance lifecycle
interface TelemetryData {
  deviceId: string;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  rainProbability: number;
  battery: number;
  timestamp: string;
}

let latestTelemetry: TelemetryData | null = null;
const telemetryHistory: TelemetryData[] = [];
const MAX_HISTORY = 500;

let valveState = {
  active: false,
  zone: 1,
  durationMinutes: 0,
  startedAt: null as string | null,
};

function num(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function evaluateIrrigation(data: TelemetryData) {
  const soil = data.soilMoisture;
  const temp = data.temperature;
  const humidity = data.humidity;
  const rain = data.rainProbability;

  if (rain >= 60) {
    return {
      irrigationRequired: false,
      action: 'DELAY',
      waterAmountMm: 0,
      durationMinutes: 0,
      reason: 'Rain probability is high; delay irrigation.',
    };
  }

  if (soil < 32) {
    return {
      irrigationRequired: true,
      action: 'URGENT_IRRIGATION',
      waterAmountMm: temp >= 34 ? 30 : 25,
      durationMinutes: temp >= 34 ? 60 : 45,
      reason: 'Soil moisture is critically low.',
    };
  }

  if (soil >= 75) {
    return {
      irrigationRequired: false,
      action: 'NO_IRRIGATION',
      waterAmountMm: 0,
      durationMinutes: 0,
      reason: 'Soil moisture is already high.',
    };
  }

  if (soil < 46 && temp >= 30 && humidity < 50 && rain < 30) {
    return {
      irrigationRequired: true,
      action: 'IRRIGATE',
      waterAmountMm: 18,
      durationMinutes: 35,
      reason: 'Moderately low moisture with hot/dry conditions.',
    };
  }

  if (soil < 45) {
    return {
      irrigationRequired: true,
      action: 'IRRIGATE',
      waterAmountMm: 15,
      durationMinutes: 30,
      reason: 'Soil moisture is below the target range.',
    };
  }

  return {
    irrigationRequired: false,
    action: 'MONITOR',
    waterAmountMm: 0,
    durationMinutes: 0,
    reason: 'Current conditions do not require irrigation.',
  };
}

export default async (req: Request, _context: Context): Promise<Response> => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');
  const method = req.method.toUpperCase();

  const jsonHeaders = {
    'Content-Type': 'application/json',
  };

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // GET /api/health
  if (method === 'GET' && (path === '/health' || path === '' || path === '/')) {
    const geminiKey = Netlify.env.get('GEMINI_API_KEY');
    return new Response(
      JSON.stringify({
        ok: true,
        service: 'agro-iot-api',
        timestamp: new Date().toISOString(),
        hardwareDataReceived: Boolean(latestTelemetry),
        lastSensorUpdate: latestTelemetry?.timestamp || null,
        geminiConfigured: Boolean(geminiKey),
      }),
      { status: 200, headers: jsonHeaders }
    );
  }

  // GET /api/sensors/latest
  if (method === 'GET' && path === '/sensors/latest') {
    if (!latestTelemetry) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No sensor telemetry has been received yet.',
          hardwareConnected: false,
          data: null,
        }),
        { status: 503, headers: jsonHeaders }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: latestTelemetry,
        hardwareConnected: true,
      }),
      { status: 200, headers: jsonHeaders }
    );
  }

  // POST /api/sensors
  if (method === 'POST' && path === '/sensors') {
    try {
      const body = await req.json();
      const telemetry: TelemetryData = {
        deviceId: String(body.deviceId || 'unknown-device'),
        soilMoisture: clamp(num(body.soilMoisture), 0, 100),
        temperature: num(body.temperature),
        humidity: clamp(num(body.humidity), 0, 100),
        rainProbability: clamp(num(body.rainProbability), 0, 100),
        battery: clamp(num(body.battery, 100), 0, 100),
        timestamp: body.timestamp ? new Date(body.timestamp).toISOString() : new Date().toISOString(),
      };

      latestTelemetry = telemetry;
      telemetryHistory.push(telemetry);
      if (telemetryHistory.length > MAX_HISTORY) telemetryHistory.shift();

      return new Response(
        JSON.stringify({
          success: true,
          data: latestTelemetry,
          hardwareConnected: true,
        }),
        { status: 201, headers: jsonHeaders }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err?.message || 'Invalid telemetry payload' }),
        { status: 400, headers: jsonHeaders }
      );
    }
  }

  // GET /api/sensors/history
  if (method === 'GET' && path === '/sensors/history') {
    return new Response(
      JSON.stringify({
        success: true,
        data: telemetryHistory,
        count: telemetryHistory.length,
      }),
      { status: 200, headers: jsonHeaders }
    );
  }

  // POST /api/irrigation/evaluate
  if (method === 'POST' && path === '/irrigation/evaluate') {
    try {
      const body = await req.json();
      const data: TelemetryData = {
        deviceId: String(body.deviceId || 'unknown-device'),
        soilMoisture: clamp(num(body.soilMoisture), 0, 100),
        temperature: num(body.temperature),
        humidity: clamp(num(body.humidity), 0, 100),
        rainProbability: clamp(num(body.rainProbability), 0, 100),
        battery: clamp(num(body.battery, 100), 0, 100),
        timestamp: new Date().toISOString(),
      };
      const decision = evaluateIrrigation(data);
      return new Response(
        JSON.stringify({
          success: true,
          input: data,
          decision,
          generatedAt: new Date().toISOString(),
        }),
        { status: 200, headers: jsonHeaders }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err?.message || 'Evaluation failed' }),
        { status: 400, headers: jsonHeaders }
      );
    }
  }

  // GET /api/valve
  if (method === 'GET' && path === '/valve') {
    return new Response(
      JSON.stringify({
        success: true,
        data: valveState,
      }),
      { status: 200, headers: jsonHeaders }
    );
  }

  // POST /api/valve
  if (method === 'POST' && path === '/valve') {
    try {
      const body = await req.json();
      const action = String(body.action || '').toUpperCase();
      const zone = Math.max(1, Math.floor(num(body.zone, 1)));
      const duration = clamp(Math.floor(num(body.durationMinutes, 30)), 1, 180);

      if (!['ON', 'OFF'].includes(action)) {
        return new Response(
          JSON.stringify({ success: false, error: 'action must be ON or OFF' }),
          { status: 400, headers: jsonHeaders }
        );
      }

      if (action === 'OFF') {
        valveState.active = false;
        valveState.durationMinutes = 0;
        valveState.startedAt = null;
        return new Response(
          JSON.stringify({ success: true, message: 'Valve stopped.', data: valveState }),
          { status: 200, headers: jsonHeaders }
        );
      }

      valveState.active = true;
      valveState.zone = zone;
      valveState.durationMinutes = duration;
      valveState.startedAt = new Date().toISOString();

      return new Response(
        JSON.stringify({
          success: true,
          message: `Valve zone ${zone} activated for ${duration} minutes.`,
          data: {
            ...valveState,
            hardwareConnected: false,
          },
        }),
        { status: 200, headers: jsonHeaders }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err?.message || 'Failed to update valve' }),
        { status: 400, headers: jsonHeaders }
      );
    }
  }

  // POST /api/crop/analyze
  if (method === 'POST' && path === '/crop/analyze') {
    const geminiKey = Netlify.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'GEMINI_API_KEY is not configured on the backend.',
        }),
        { status: 503, headers: jsonHeaders }
      );
    }

    try {
      const body = await req.json();
      const { imageBase64, mimeType = 'image/jpeg' } = body;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return new Response(
          JSON.stringify({ success: false, error: 'imageBase64 is required.' }),
          { status: 400, headers: jsonHeaders }
        );
      }

      const model = Netlify.env.get('GEMINI_MODEL') || 'gemini-2.5-flash';
      const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent` +
        `?key=${encodeURIComponent(geminiKey)}`;

      const prompt = `
You are an agricultural crop-disease assistant.
Analyze the supplied leaf/crop image conservatively.
Return ONLY valid JSON with these keys:
{
  "crop": "string",
  "disease": "string",
  "confidence": 0,
  "severity": "Healthy|Early Warning|Moderate|Severe|Unknown",
  "affectedAreaPercent": 0,
  "symptoms": ["string"],
  "recommendations": ["string"],
  "needsExpertReview": true
}
Confidence and affectedAreaPercent must be numbers from 0 to 100.
If the image is not a crop/leaf or diagnosis is uncertain, say so and set needsExpertReview to true.
Do not invent certainty.
`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
                },
              },
            ],
          }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      const raw = await response.json();
      if (!response.ok) {
        return new Response(
          JSON.stringify({ success: false, error: raw?.error?.message || 'Gemini request failed.' }),
          { status: response.status, headers: jsonHeaders }
        );
      }

      const text = raw?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
      const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
      const candidate = fenced ? fenced[1] : text;
      const start = candidate.indexOf('{');
      const end = candidate.lastIndexOf('}');
      if (start === -1 || end === -1) {
        throw new Error('Gemini did not return valid JSON.');
      }
      const result = JSON.parse(candidate.slice(start, end + 1));

      return new Response(
        JSON.stringify({ success: true, source: 'gemini', model, data: result }),
        { status: 200, headers: jsonHeaders }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err?.message || 'Crop analysis failed.' }),
        { status: 500, headers: jsonHeaders }
      );
    }
  }

  // 404 for unknown /api routes
  return new Response(
    JSON.stringify({ error: `Not found: ${method} ${path}` }),
    { status: 404, headers: jsonHeaders }
  );
};

export const config: Config = {
  path: '/api/*',
};
