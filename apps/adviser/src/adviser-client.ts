import { sameContext, validCatalog, validRequirements } from "./catalog.ts";
import type { AdviceContext, Requirements } from "./catalog.ts";
export function endpointUrl(endpoint: string, path: string) {
  const url = new URL(endpoint);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    !(
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "10.0.2.2", "[::1]"].includes(url.hostname))
    )
  )
    throw Error("ENDPOINT_REQUIRES_HTTPS");
  return url.origin + path;
}
async function call(
  endpoint: string,
  path: string,
  token: string,
  signal: AbortSignal,
  transport: typeof fetch,
  body?: unknown,
) {
  const response = await transport(endpointUrl(endpoint, path), {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    if (response.status === 409) throw Error("STALE_CATALOG");
    if (response.status === 503) throw Error("SERVICE_UNAVAILABLE");
    if (response.status === 429) throw Error("USAGE_LIMIT");
    throw Error("SERVICE_ERROR");
  }
  const text = await response.text();
  if (text.length > 4000000) throw Error("RESPONSE_TOO_LARGE");
  if (signal.aborted) throw Error("ABORTED");
  return JSON.parse(text);
}
export async function fetchCatalog(
  endpoint: string,
  token: string,
  signal: AbortSignal,
  transport = fetch,
) {
  const value = await call(endpoint, "/v1/catalog", token, signal, transport);
  if (
    !validCatalog(value.catalog) ||
    !Number.isFinite(Date.parse(value.checkedAt)) ||
    value.sourceState !== "repository_snapshot"
  )
    throw Error("INVALID_CATALOG");
  return value;
}
export async function fetchAdvice(
  endpoint: string,
  token: string,
  context: AdviceContext,
  requirements: Requirements,
  message: string,
  signal: AbortSignal,
  transport = fetch,
) {
  const value = await call(endpoint, "/v1/advice", token, signal, transport, {
    context,
    requirements,
    message,
  });
  if (
    !value.context ||
    !sameContext(context, value.context) ||
    typeof value.text !== "string" ||
    value.text.length > 10000 ||
    !(value.proposal === null || validRequirements(value.proposal)) ||
    value.mode !== "provider"
  )
    throw Error("INVALID_ADVICE");
  return value;
}
