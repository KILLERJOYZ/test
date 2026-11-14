import { sameContext, validCatalog, validRequirements } from "./catalog.ts";
import type { AdviceContext, Listing, Requirements } from "./catalog.ts";

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
    if (response.status === 404) throw Error("NOT_FOUND");
    throw Error("SERVICE_ERROR");
  }
  const text = await response.text();
  if (text.length > 4000000) throw Error("RESPONSE_TOO_LARGE");
  if (signal.aborted) throw Error("ABORTED");
  return JSON.parse(text);
}

export async function fetchHealth(
  endpoint: string,
  token = "",
  signal?: AbortSignal,
  transport = fetch,
) {
  const controller = new AbortController();
  const actualSignal = signal || controller.signal;
  return call(endpoint, "/health", token, actualSignal, transport);
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
    !["repository_snapshot", "postgresql_snapshot"].includes(value.sourceState)
  )
    throw Error("INVALID_CATALOG");
  return value;
}

export async function fetchLaptops(
  endpoint: string,
  params: {
    q?: string;
    source?: string;
    brand?: string;
    max_price?: number;
    min_ram?: number;
    min_storage?: number;
    sort?: string;
    limit?: number;
    offset?: number;
  } = {},
  token = "",
  signal?: AbortSignal,
  transport = fetch,
) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.source) qs.set("source", params.source);
  if (params.brand) qs.set("brand", params.brand);
  if (params.max_price) qs.set("max_price", String(params.max_price));
  if (params.min_ram) qs.set("min_ram", String(params.min_ram));
  if (params.min_storage) qs.set("min_storage", String(params.min_storage));
  if (params.sort) qs.set("sort", params.sort);
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));

  const path = `/v1/laptops${qs.toString() ? `?${qs.toString()}` : ""}`;
  const controller = new AbortController();
  return call(endpoint, path, token, signal || controller.signal, transport);
}

export async function fetchLaptopDetail(
  endpoint: string,
  laptopId: string,
  token = "",
  signal?: AbortSignal,
  transport = fetch,
): Promise<Listing> {
  const path = `/v1/laptops/${encodeURIComponent(laptopId)}`;
  const controller = new AbortController();
  return call(endpoint, path, token, signal || controller.signal, transport);
}

export async function fetchCompare(
  endpoint: string,
  ids: string[],
  requirements: Requirements,
  token = "",
  signal?: AbortSignal,
  transport = fetch,
) {
  const controller = new AbortController();
  return call(
    endpoint,
    "/v1/compare",
    token,
    signal || controller.signal,
    transport,
    {
      ids,
      requirements,
    },
  );
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

export async function submitListingReport(
  endpoint: string,
  token: string,
  payload: {
    listingId: string;
    category: "price" | "spec" | "stock" | "link";
    note: string;
  },
  signal: AbortSignal,
  transport = fetch,
) {
  const value = await call(
    endpoint,
    "/v1/reports",
    token,
    signal,
    transport,
    payload,
  );
  if (
    !value?.report ||
    typeof value.report.id !== "string" ||
    value.report.listingId !== payload.listingId
  )
    throw Error("INVALID_REPORT_RESPONSE");
  return value.report;
}

export type CopilotShortlistItem = {
  listing: Listing;
  tradeoffSummary: string;
  assessment?: {
    state: string;
    failed: string[];
    unknown: string[];
  };
};

export type CopilotResponse = {
  assistantReply: string;
  proposedRequirements: Requirements | null;
  requiresConfirmation: boolean;
  clarifyingQuestions: string[];
  shortlist: CopilotShortlistItem[];
  mode: string;
};

export async function fetchCopilotAdvice(
  endpoint: string,
  token: string,
  payload: {
    sessionId: string;
    message: string;
    requirements: Requirements;
    nanoDraft?: Record<string, unknown> | null;
    preferOffline?: boolean;
  },
  signal: AbortSignal,
  transport = fetch,
): Promise<CopilotResponse> {
  const value = await call(
    endpoint,
    "/advisor/v1/copilot",
    token,
    signal,
    transport,
    payload,
  );
  if (!value || typeof value.assistantReply !== "string") {
    throw Error("INVALID_COPILOT_RESPONSE");
  }
  const proposed =
    value.proposedRequirements && validRequirements(value.proposedRequirements)
      ? value.proposedRequirements
      : null;
  return {
    assistantReply: value.assistantReply,
    proposedRequirements: proposed,
    requiresConfirmation: true,
    clarifyingQuestions: Array.isArray(value.clarifyingQuestions)
      ? value.clarifyingQuestions.filter((q: unknown) => typeof q === "string")
      : [],
    shortlist: Array.isArray(value.shortlist) ? value.shortlist.slice(0, 3) : [],
    mode: typeof value.mode === "string" ? value.mode : "online_langgraph_chatgpt",
  };
}

export async function fetchProactiveNudge(
  endpoint: string,
  token: string,
  payload: {
    requirements: Requirements;
    currentListingId?: string | null;
    recentListingIds: string[];
    compareIds: string[];
    preferOffline?: boolean;
  },
  signal: AbortSignal,
  transport = fetch,
) {
  return call(
    endpoint,
    "/advisor/v1/proactive",
    token,
    signal,
    transport,
    payload,
  );
}

export type SynthesizedReview = {
  listingId: string;
  performance: string;
  thermals_noise: string;
  battery_real: string;
  quirks_cons: string;
  sourceName: string;
  sourceUrl: string;
  checkedAt: string;
  status: string;
};

export async function fetchListingReview(
  endpoint: string,
  token: string,
  listingId: string,
  signal: AbortSignal,
  transport = fetch,
): Promise<SynthesizedReview> {
  return call(
    endpoint,
    `/v1/reviews/${encodeURIComponent(listingId)}`,
    token,
    signal,
    transport,
  );
}
