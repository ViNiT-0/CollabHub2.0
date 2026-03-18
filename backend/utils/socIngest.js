const DEFAULT_TIMEOUT_MS = 1500;

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) return xff.split(",")[0].trim();
  if (Array.isArray(xff) && xff.length) return String(xff[0]).trim();
  return req.ip || req.connection?.remoteAddress || "";
}

function safeBodyPreview(req, maxLen = 2000) {
  // Avoid sending secrets / large payloads. Keep only a small preview.
  // If body is an object, stringify it; if it's a string, truncate it.
  const b = req.body;
  if (!b) return "";

  let s = "";
  if (typeof b === "string") s = b;
  else {
    try {
      s = JSON.stringify(b);
    } catch {
      s = "";
    }
  }

  // Basic redaction for common sensitive keys
  s = s.replace(/"password"\s*:\s*"[^"]*"/gi, '"password":"[REDACTED]"');
  s = s.replace(/"token"\s*:\s*"[^"]*"/gi, '"token":"[REDACTED]"');

  return s.length > maxLen ? s.slice(0, maxLen) + "…(truncated)" : s;
}

async function postJsonWithTimeout(url, payload, headers, timeoutMs) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return { ok: res.ok, status: res.status };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Send a single request log to SOC platform ingest API.
 *
 * SOC expects:
 *   ip, url, method, status_code, site
 * optional:
 *   body, user_agent
 *
 * Env:
 *   SOC_INGEST_URL (e.g. http://localhost:8000/api/ingest)
 *   SOC_API_KEY
 *   SOC_SITE (e.g. collabhub)
 */
async function sendToSoc({ req, statusCode }) {
  const ingestUrl = process.env.SOC_INGEST_URL;
  const apiKey = process.env.SOC_API_KEY;
  if (!ingestUrl || !apiKey) return;

  const site = process.env.SOC_SITE || "collabhub";
  const ip = getClientIp(req);
  const url = req.originalUrl || req.url || "/";
  const method = (req.method || "GET").toUpperCase();

  // Only include body for POST/PUT/PATCH, and keep it small.
  const includeBody = ["POST", "PUT", "PATCH"].includes(method);

  const payload = {
    ip,
    url,
    method,
    status_code: Number(statusCode) || 200,
    site,
    user_agent: req.headers["user-agent"] || "",
    body: includeBody ? safeBodyPreview(req) : "",
  };

  try {
    await postJsonWithTimeout(
      ingestUrl,
      payload,
      { "X-API-Key": apiKey },
      Number(process.env.SOC_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS
    );
  } catch {
    // Intentionally swallow errors to avoid impacting user requests.
  }
}

module.exports = { sendToSoc };

