import type { z } from "zod";

import { zodToJsonSchema } from "./json-schema.js";

export interface StructuredLlmRequest<T> {
  /** Stable schema name for the provider's structured-output cache. */
  name: string;
  schema: z.ZodType<T>;
  system: string;
  input: unknown;
  maxOutputTokens?: number;
  temperature?: number;
}

/**
 * Provider-neutral boundary. Workflows always validate the returned value with
 * Zod, even when the provider already enforced a JSON schema.
 */
export interface StructuredLlm {
  generate<T>(request: StructuredLlmRequest<T>): Promise<T>;
}

export interface OpenAiLlmOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

interface ChatCompletionResponse {
  choices?: {
    message?: {
      content?: string | null;
      refusal?: string | null;
    };
  }[];
  error?: { message?: string; type?: string };
}

export class LlmError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "LlmError";
    this.status = status;
  }
}

export function createOpenAiStructuredLlm(options: OpenAiLlmOptions): StructuredLlm {
  const model = options.model ?? "gpt-4o-mini";
  const baseUrl = (options.baseUrl ?? "https://api.openai.com/v1").replace(/\/+$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async generate<T>(request: StructuredLlmRequest<T>): Promise<T> {
      const body = {
        model,
        temperature: request.temperature ?? 0.1,
        max_tokens: request.maxOutputTokens ?? 900,
        messages: [
          { role: "system", content: request.system },
          {
            role: "user",
            content:
              "Dữ liệu đầu vào là JSON. Chỉ dùng dữ liệu trong JSON, không bổ sung kiến thức bên ngoài.\n" +
              JSON.stringify(request.input),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: request.name,
            strict: true,
            schema: zodToJsonSchema(request.schema),
          },
        },
      };

      let response: Response;
      try {
        response = await fetchImpl(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${options.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(options.timeoutMs ?? 20_000),
        });
      } catch (error) {
        throw new LlmError(`OpenAI request failed: ${formatError(error)}`);
      }

      const text = await response.text();
      let parsed: ChatCompletionResponse;
      try {
        parsed = JSON.parse(text) as ChatCompletionResponse;
      } catch {
        throw new LlmError(`OpenAI returned non-JSON (${response.status}): ${text.slice(0, 300)}`, response.status);
      }

      if (!response.ok) {
        throw new LlmError(
          `OpenAI error ${response.status}: ${parsed.error?.message ?? text.slice(0, 300)}`,
          response.status,
        );
      }
      const message = parsed.choices?.[0]?.message;
      if (message?.refusal) {
        throw new LlmError(`OpenAI refused: ${message.refusal}`, response.status);
      }
      const content = message?.content;
      if (!content) {
        throw new LlmError("OpenAI returned an empty structured output", response.status);
      }

      let json: unknown;
      try {
        json = JSON.parse(content);
      } catch {
        throw new LlmError("OpenAI structured output was not valid JSON", response.status);
      }

      const validated = request.schema.safeParse(json);
      if (!validated.success) {
        throw new LlmError(
          `OpenAI structured output failed ${request.name}: ${validated.error.issues
            .map((issue) => `${issue.path.join(".")} ${issue.message}`)
            .join("; ")}`,
          response.status,
        );
      }
      return validated.data;
    },
  };
}

function formatError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}
