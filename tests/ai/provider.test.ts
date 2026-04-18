import { describe, expect, it } from "bun:test";
import {
	getDefaultModel,
	isSupportedProvider,
	resolveModel,
} from "../../src/ai/provider";

describe("isSupportedProvider", () => {
	it("returns true for openai", () => {
		expect(isSupportedProvider("openai")).toBe(true);
	});

	it("returns true for anthropic", () => {
		expect(isSupportedProvider("anthropic")).toBe(true);
	});

	it("returns true for google", () => {
		expect(isSupportedProvider("google")).toBe(true);
	});

	it("returns false for unknown provider", () => {
		expect(isSupportedProvider("cohere")).toBe(false);
	});

	it("returns false for empty string", () => {
		expect(isSupportedProvider("")).toBe(false);
	});
});

describe("getDefaultModel", () => {
	it("returns gpt-4o for openai", () => {
		expect(getDefaultModel("openai")).toBe("gpt-4o");
	});

	it("returns claude-sonnet-4-20250514 for anthropic", () => {
		expect(getDefaultModel("anthropic")).toBe("claude-sonnet-4-20250514");
	});

	it("returns gemini-2.5-flash for google", () => {
		expect(getDefaultModel("google")).toBe("gemini-2.5-flash");
	});
});

describe("resolveModel", () => {
	it("returns a model object for openai", () => {
		const model = resolveModel("openai", "test-key");
		expect(model).toBeDefined();
		expect(model.modelId).toBe("gpt-4o");
	});

	it("uses custom model when provided", () => {
		const model = resolveModel("openai", "test-key", "gpt-4o-mini");
		expect(model.modelId).toBe("gpt-4o-mini");
	});

	it("returns a model object for anthropic", () => {
		const model = resolveModel("anthropic", "test-key");
		expect(model).toBeDefined();
	});

	it("returns a model object for google", () => {
		const model = resolveModel("google", "test-key");
		expect(model).toBeDefined();
	});

	it("does not set process.env keys", () => {
		const _before = { ...process.env };
		resolveModel("openai", "secret-key-123");
		expect(process.env.OPENAI_API_KEY).toBeUndefined();
	});
});
