import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type SupportedProvider = "openai" | "anthropic" | "google";

const DEFAULT_MODELS: Record<SupportedProvider, string> = {
	openai: "gpt-4o",
	anthropic: "claude-sonnet-4-20250514",
	google: "gemini-2.5-flash",
};

const PROVIDER_FACTORIES: Record<
	SupportedProvider,
	(model: string, apiKey: string) => LanguageModel
> = {
	openai: (model, apiKey) => createOpenAI({ apiKey })(model),
	anthropic: (model, apiKey) => createAnthropic({ apiKey })(model),
	google: (model, apiKey) => createGoogleGenerativeAI({ apiKey })(model),
};

export function isSupportedProvider(
	provider: string,
): provider is SupportedProvider {
	return provider in DEFAULT_MODELS;
}

export function resolveModel(
	provider: SupportedProvider,
	apiKey: string,
	model?: string,
): LanguageModel {
	const modelId = model || DEFAULT_MODELS[provider];
	return PROVIDER_FACTORIES[provider](modelId, apiKey);
}

export function getDefaultModel(provider: SupportedProvider): string {
	return DEFAULT_MODELS[provider];
}
