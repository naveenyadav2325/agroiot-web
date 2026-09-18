# AGRO-IOT Backend API

Real-time backend service for the AGRO-IOT smart-farming web application.

## Important

This backend **does not generate sensor telemetry**. It starts with no sensor data and is populated only when a real device/data source sends telemetry to `POST /api/sensors`.

The API therefore reports the hardware/data stream as disconnected until real telemetry is received.

## Run locally

From this `backend` directory:

```bash
npm install
npm start
```

Server:

```text
http://localhost:5000
```

## Environment

Copy `.env.example` to `.env` and set the required values.

Never commit `.env` or API keys.

## Real sensor ingestion

Send telemetry from the ESP32/edge gateway to:

```text
POST /api/sensors
Content-Type: application/json
```

Example payload shape:

```json
{
  "deviceId": "AGRO-ESP32-01",
  "soilMoisture": 58.4,
  "temperature": 26.8,
  "humidity": 64.2,
  "rainProbability": 15,
  "battery": 92,
  "timestamp": "2026-09-18T12:00:00.000Z"
}
```

The example above is only the **request format**; the server does not use it automatically.

## API

- `GET /api/health`
- `GET /api/sensors/latest`
- `GET /api/sensors/history`
- `POST /api/sensors`
- `POST /api/irrigation/evaluate`
- `GET /api/valve`
- `POST /api/valve`
- `POST /api/crop/analyze`

## Sensor data

`GET /api/sensors/latest` returns `503` with `hardwareConnected: false` until the first real telemetry packet is received.

`GET /api/sensors/history` contains only telemetry actually received by the server during its current process lifetime.

For persistent production history, connect a database.

## Crop analysis

`POST /api/crop/analyze` uses Gemini when `GEMINI_API_KEY` is configured. Keep the key on the server only.

## Valve control

The valve endpoint currently changes backend state only. It is **not physical valve control**. Connect it to the actual ESP32/relay/valve control layer before treating it as hardware actuation.

## Deployment

This backend is currently a Node/Express server. Deploy it as a server process on a compatible backend host, then configure the Vercel frontend to use its public API URL.

Do not hardcode localhost in the production frontend.
