/**
 * Agro-IoT Express Backend
 *
 * Endpoints:
 *   GET  /api/health
 *   GET  /api/sensors/latest
 *   POST /api/sensors
 *   POST /api/irrigation/evaluate
 *   GET  /api/valve
 *   POST /api/valve
 *   POST /api/crop/analyze
 *
 * The server keeps the latest telemetry in memory. Replace the in-memory
 * store with MongoDB/PostgreSQL later if persistent history is required.
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "10mb" }));

// No fabricated telemetry. This is populated only after a real
// POST /api/sensors request from the hardware/backend data source.
let latestTelemetry = null;
const telemetryHistory = [];
const MAX_HISTORY = 500;

let valveState = {
  active: false,
  zone: 1,
  durationMinutes: 0,
  startedAt: null,
  timer: null
};

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function validateTelemetry(body) {
  const data = {
    deviceId: String(body.deviceId || "unknown-device"),
    soilMoisture: clamp(num(body.soilMoisture), 0, 100),
    temperature: num(body.temperature),
    humidity: clamp(num(body.humidity), 0, 100),
    rainProbability: clamp(num(body.rainProbability), 0, 100),
    battery: clamp(num(body.battery, 100), 0, 100),
    timestamp: body.timestamp ? new Date(body.timestamp).toISOString() : new Date().toISOString()
  };

  if (!Number.isFinite(new Date(data.timestamp).getTime())) {
    throw new Error("Invalid timestamp");
  }
  return data;
}

function evaluateIrrigation(data) {
  const soil = data.soilMoisture;
  const temp = data.temperature;
  const humidity = data.humidity;
  const rain = data.rainProbability;

  // Mirrors the current app's rule-based decision approach.
  if (rain >= 60) {
    return {
      irrigationRequired: false,
      action: "DELAY",
      waterAmountMm: 0,
      durationMinutes: 0,
      reason: "Rain probability is high; delay irrigation."
    };
  }

  if (soil < 32) {
    return {
      irrigationRequired: true,
      action: "URGENT_IRRIGATION",
      waterAmountMm: temp >= 34 ? 30 : 25,
      durationMinutes: temp >= 34 ? 60 : 45,
      reason: "Soil moisture is critically low."
    };
  }

  if (soil >= 75) {
    return {
      irrigationRequired: false,
      action: "NO_IRRIGATION",
      waterAmountMm: 0,
      durationMinutes: 0,
      reason: "Soil moisture is already high."
    };
  }

  if (soil < 46 && temp >= 30 && humidity < 50 && rain < 30) {
    return {
      irrigationRequired: true,
      action: "IRRIGATE",
      waterAmountMm: 18,
      durationMinutes: 35,
      reason: "Moderately low moisture with hot/dry conditions."
    };
  }

  if (soil < 45) {
    return {
      irrigationRequired: true,
      action: "IRRIGATE",
      waterAmountMm: 15,
      durationMinutes: 30,
      reason: "Soil moisture is below the target range."
    };
  }

  return {
    irrigationRequired: false,
    action: "MONITOR",
    waterAmountMm: 0,
    durationMinutes: 0,
    reason: "Current conditions do not require irrigation."
  };
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "agro-iot-api",
    timestamp: new Date().toISOString(),
    hardwareDataReceived: Boolean(latestTelemetry),
    lastSensorUpdate: latestTelemetry?.timestamp || null,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.get("/api/sensors/latest", (req, res) => {
  if (!latestTelemetry) {
    return res.status(503).json({
      success: false,
      error: "No sensor telemetry has been received yet.",
      hardwareConnected: false,
      data: null
    });
  }
  res.json({ success: true, data: latestTelemetry, hardwareConnected: true });
});

app.post("/api/sensors", (req, res) => {
  try {
    latestTelemetry = validateTelemetry(req.body);
    telemetryHistory.push(latestTelemetry);
    if (telemetryHistory.length > MAX_HISTORY) telemetryHistory.shift();

    res.status(201).json({
      success: true,
      data: latestTelemetry,
      hardwareConnected: true
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get("/api/sensors/history", (req, res) => {
  res.json({
    success: true,
    data: telemetryHistory,
    count: telemetryHistory.length
  });
});

app.post("/api/irrigation/evaluate", (req, res) => {
  try {
    const data = validateTelemetry(req.body);
    const decision = evaluateIrrigation(data);
    res.json({
      success: true,
      input: data,
      decision,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get("/api/valve", (req, res) => {
  res.json({
    success: true,
    data: {
      active: valveState.active,
      zone: valveState.zone,
      durationMinutes: valveState.durationMinutes,
      startedAt: valveState.startedAt
    }
  });
});

function stopValve() {
  if (valveState.timer) clearTimeout(valveState.timer);
  valveState.timer = null;
  valveState.active = false;
  valveState.durationMinutes = 0;
  valveState.startedAt = null;
}

app.post("/api/valve", (req, res) => {
  const action = String(req.body.action || "").toUpperCase();
  const zone = Math.max(1, Math.floor(num(req.body.zone, 1)));
  const duration = clamp(Math.floor(num(req.body.durationMinutes, 30)), 1, 180);

  if (!["ON", "OFF"].includes(action)) {
    return res.status(400).json({
      success: false,
      error: "action must be ON or OFF"
    });
  }

  if (action === "OFF") {
    stopValve();
    return res.json({
      success: true,
      message: "Valve stopped.",
      data: valveState
    });
  }

  valveState.active = true;
  valveState.zone = zone;
  valveState.durationMinutes = duration;
  valveState.startedAt = new Date().toISOString();

  // This endpoint currently changes backend state only.
  // Connect this command to the physical valve/ESP32 control layer before
  // representing it as hardware actuation.
  if (valveState.timer) clearTimeout(valveState.timer);
  valveState.timer = setTimeout(stopValve, duration * 60 * 1000);

  res.json({
    success: true,
    message: `Valve zone ${zone} activated for ${duration} minutes.`,
    data: {
      active: valveState.active,
      zone: valveState.zone,
      durationMinutes: valveState.durationMinutes,
      startedAt: valveState.startedAt,
      hardwareConnected: false
    }
  });
});

function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Gemini did not return valid JSON.");
  return JSON.parse(candidate.slice(start, end + 1));
}

app.post("/api/crop/analyze", async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg" } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      success: false,
      error: "GEMINI_API_KEY is not configured on the backend."
    });
  }

  if (!imageBase64 || typeof imageBase64 !== "string") {
    return res.status(400).json({
      success: false,
      error: "imageBase64 is required."
    });
  }

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent` +
      `?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;

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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64.replace(/^data:[^;]+;base64,/, "")
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    const raw = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: raw?.error?.message || "Gemini request failed."
      });
    }

    const text = raw?.candidates?.[0]?.content?.parts
      ?.map(p => p.text || "")
      .join("") || "";

    const result = extractJson(text);

    res.json({
      success: true,
      source: "gemini",
      model,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || "Crop analysis failed."
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Agro-IoT API running at http://localhost:${PORT}`);
});
