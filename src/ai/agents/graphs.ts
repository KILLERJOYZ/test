import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import type {
  EntityResolutionInput,
  EvidenceDraft,
  ResolutionResult,
  ReviewSynthesisInput,
} from "../types/db.types.js";
import { blockPublication, resolutionResultSchema, resolveStagingItem } from "./entity-resolution.js";
import { evidenceDraftSchema, fallbackReview, forcePending, synthesizeReview } from "./review-synthesis.js";

type UnguardedDraft = Omit<EvidenceDraft, "status"> & { status?: string };

export type ReviewExtractor = (input: ReviewSynthesisInput) => UnguardedDraft;

export interface ReviewSynthesisRunInput {
  request: ReviewSynthesisInput;
  ai_fallback_enabled?: boolean;
  extractor?: ReviewExtractor;
}

const ResolutionState = Annotation.Root({
  item: Annotation<EntityResolutionInput["item"]>,
  variants: Annotation<EntityResolutionInput["variants"]>,
  pricePoints: Annotation<NonNullable<EntityResolutionInput["price_points"]>>,
  requiresMandatoryFees: Annotation<boolean>,
  result: Annotation<ResolutionResult | null>,
});

const SynthesisState = Annotation.Root({
  request: Annotation<ReviewSynthesisInput>,
  aiFallbackEnabled: Annotation<boolean>,
  result: Annotation<UnguardedDraft | null>,
  error: Annotation<string | null>,
});

type ResolutionGraphState = typeof ResolutionState.State;
type SynthesisGraphState = typeof SynthesisState.State;

export function buildResolutionGraph() {
  return new StateGraph(ResolutionState)
    .addNode("match_and_flag", (state: ResolutionGraphState) => ({
      result: resolveStagingItem({
        item: state.item,
        variants: state.variants,
        price_points: state.pricePoints,
        requires_mandatory_fees: state.requiresMandatoryFees,
      }),
    }))
    .addNode("guard", (state: ResolutionGraphState) => ({
      result: state.result ? blockPublication(state.result) : state.result,
    }))
    .addEdge(START, "match_and_flag")
    .addEdge("match_and_flag", "guard")
    .addEdge("guard", END);
}

export function buildSynthesisGraph(extractor: ReviewExtractor = synthesizeReview) {
  return new StateGraph(SynthesisState)
    .addNode("extract", (state: SynthesisGraphState) => {
      const request = state.request;
      const enabled = state.aiFallbackEnabled ?? true;
      try {
        return {
          request,
          aiFallbackEnabled: enabled,
          result: extractor({
            ...request,
            evidence_type: request.evidence_type ?? "editorial_review",
            sibling_skus: request.sibling_skus ?? [],
          }),
          error: null,
        };
      } catch (error) {
        return {
          request,
          aiFallbackEnabled: enabled,
          result: null,
          error: formatError(error),
        };
      }
    })
    .addNode("guard", (state: SynthesisGraphState) => ({
      result: state.result ? forcePending(state.result) : state.result,
    }))
    .addNode("fallback", (state: SynthesisGraphState) => ({
      result: fallbackReview(state.request, String(state.error), state.aiFallbackEnabled ?? true),
    }))
    .addEdge(START, "extract")
    .addConditionalEdges("extract", (state: SynthesisGraphState) => (state.error ? "fallback" : "guard"), {
      guard: "guard",
      fallback: "fallback",
    })
    .addEdge("guard", END)
    .addEdge("fallback", END);
}

let resolutionApp: ReturnType<ReturnType<typeof buildResolutionGraph>["compile"]> | null = null;
let synthesisApp: ReturnType<ReturnType<typeof buildSynthesisGraph>["compile"]> | null = null;

export async function runEntityResolution(input: EntityResolutionInput): Promise<ResolutionResult> {
  resolutionApp ??= buildResolutionGraph().compile();
  const state = await resolutionApp.invoke({
    item: input.item,
    variants: input.variants,
    pricePoints: input.price_points ?? [],
    requiresMandatoryFees: input.requires_mandatory_fees ?? false,
    result: null,
  });
  if (!state.result) throw new Error("resolution graph returned no result");
  return resolutionResultSchema.parse(blockPublication(state.result));
}

export async function runReviewSynthesis(input: ReviewSynthesisRunInput): Promise<EvidenceDraft> {
  const app = input.extractor ? buildSynthesisGraph(input.extractor).compile() : sharedSynthesis();
  const state = await app.invoke({
    request: input.request,
    aiFallbackEnabled: input.ai_fallback_enabled ?? true,
    result: null,
    error: null,
  });
  if (!state.result) throw new Error("synthesis graph returned no result");
  return evidenceDraftSchema.parse(forcePending(state.result));
}

function sharedSynthesis() {
  synthesisApp ??= buildSynthesisGraph().compile();
  return synthesisApp;
}

function formatError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return `Error: ${String(error)}`;
}
