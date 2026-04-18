import { generateText } from "ai";
import type { ContributorActivity } from "../git/types";
import { buildPrompt } from "./prompt";
import type { SupportedProvider } from "./provider";
import { resolveModel } from "./provider";

export interface GenerateOptions {
	provider: SupportedProvider;
	apiKey: string;
	model?: string;
	activities: ContributorActivity[];
	timeRange: string;
}

export async function generatePulse(options: GenerateOptions): Promise<string> {
	const model = resolveModel(options.provider, options.apiKey, options.model);
	const prompt = buildPrompt(options.activities, options.timeRange);

	const { text } = await generateText({ model, prompt });
	return text;
}
