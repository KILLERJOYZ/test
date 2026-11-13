import { z } from "zod";

/**
 * Small Zod -> JSON Schema converter for the subset used by LLM output
 * schemas. OpenAI strict structured outputs require every object property to
 * be listed in `required` and `additionalProperties: false`, so the converter
 * never emits optional object properties.
 */

type JsonSchema = Record<string, unknown>;

export function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchema {
  const converted = convert(schema);
  if (converted.type !== "object" && !converted.anyOf) {
    return { type: "object", properties: { value: converted }, required: ["value"], additionalProperties: false };
  }
  return converted;
}

function convert(schema: z.ZodTypeAny): JsonSchema {
  const def = schema._def;
  switch (def.typeName) {
    case z.ZodFirstPartyTypeKind.ZodString: {
      const out: JsonSchema = { type: "string" };
      const checks = def.checks as { kind: string; value?: number }[];
      const max = checks.find((check) => check.kind === "max")?.value;
      const min = checks.find((check) => check.kind === "min")?.value;
      if (typeof min === "number") out.minLength = min;
      if (typeof max === "number") out.maxLength = max;
      if (def.description) out.description = def.description;
      return out;
    }
    case z.ZodFirstPartyTypeKind.ZodNumber: {
      const out: JsonSchema = { type: "number" };
      if (def.description) out.description = def.description;
      return out;
    }
    case z.ZodFirstPartyTypeKind.ZodBoolean:
      return { type: "boolean" };
    case z.ZodFirstPartyTypeKind.ZodNull:
      return { type: "null" };
    case z.ZodFirstPartyTypeKind.ZodLiteral:
      return { type: literalType(def.value), enum: [def.value] };
    case z.ZodFirstPartyTypeKind.ZodEnum:
      return { type: "string", enum: [...def.values] };
    case z.ZodFirstPartyTypeKind.ZodNativeEnum: {
      const values = Object.values(def.values as Record<string, string | number>).filter(
        (value) => typeof value === "string" || typeof value === "number",
      );
      return { enum: [...new Set(values)] };
    }
    case z.ZodFirstPartyTypeKind.ZodArray: {
      const out: JsonSchema = { type: "array", items: convert(def.type) };
      if (def.minLength) out.minItems = def.minLength.value;
      if (def.maxLength) out.maxItems = def.maxLength.value;
      return out;
    }
    case z.ZodFirstPartyTypeKind.ZodObject: {
      const shape = (def.shape as () => Record<string, z.ZodTypeAny>)();
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = convert(value);
        required.push(key);
      }
      const out: JsonSchema = {
        type: "object",
        properties,
        required,
        additionalProperties: false,
      };
      if (def.description) out.description = def.description;
      return out;
    }
    case z.ZodFirstPartyTypeKind.ZodRecord:
      return {
        type: "object",
        additionalProperties: convert(def.valueType as z.ZodTypeAny),
      };
    case z.ZodFirstPartyTypeKind.ZodUnion:
      return { anyOf: (def.options as z.ZodTypeAny[]).map(convert) };
    case z.ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
      return { anyOf: [...(def.options as Set<z.ZodTypeAny>)].map(convert) };
    case z.ZodFirstPartyTypeKind.ZodNullable: {
      const inner = convert(def.innerType as z.ZodTypeAny);
      return { anyOf: [inner, { type: "null" }] };
    }
    case z.ZodFirstPartyTypeKind.ZodOptional:
      return convert(def.innerType as z.ZodTypeAny);
    case z.ZodFirstPartyTypeKind.ZodDefault:
      return convert(def.innerType as z.ZodTypeAny);
    case z.ZodFirstPartyTypeKind.ZodEffects:
      return convert(def.schema as z.ZodTypeAny);
    case z.ZodFirstPartyTypeKind.ZodBranded:
      return convert(def.type as z.ZodTypeAny);
    case z.ZodFirstPartyTypeKind.ZodReadonly:
      return convert(def.innerType as z.ZodTypeAny);
    case z.ZodFirstPartyTypeKind.ZodPipeline:
      return convert(def.out as z.ZodTypeAny);
    case z.ZodFirstPartyTypeKind.ZodAny:
    case z.ZodFirstPartyTypeKind.ZodUnknown:
      return {};
    default:
      throw new Error(`unsupported Zod type for JSON Schema: ${String(def.typeName)}`);
  }
}

function literalType(value: unknown): string {
  if (value === null) return "null";
  return typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "string";
}
