import { describe, expect, it } from "bun:test";
import { buildPrompt } from "../src/ai/prompt";
import { isSupportedProvider } from "../src/ai/provider";
import { groupByContributor } from "../src/git/log";
import { createChatProvider } from "../src/providers/factory";

describe("end-to-end data flow", () => {
	it("rejects unsupported AI provider", () => {
		expect(isSupportedProvider("cohere")).toBe(false);
		expect(isSupportedProvider("openai")).toBe(true);
	});

	it("rejects missing slack webhook", () => {
		expect(() => createChatProvider("slack", {})).toThrow(
			"slack_webhook_url is required",
		);
	});

	it("transforms commits through the full pipeline", () => {
		const commits = [
			{
				hash: "abc1234",
				author: "Alice",
				email: "alice@example.com",
				date: new Date(),
				message: "feat: add login",
			},
			{
				hash: "def5678",
				author: "Alice",
				email: "alice@example.com",
				date: new Date(),
				message: "fix: login redirect",
			},
			{
				hash: "ghi9012",
				author: "Bob",
				email: "bob@example.com",
				date: new Date(),
				message: "docs: update readme",
			},
		];

		const activities = groupByContributor(commits);
		expect(activities).toHaveLength(2);

		const prompt = buildPrompt(activities, "7d");
		expect(prompt).toContain("Alice");
		expect(prompt).toContain("Bob");
		expect(prompt).toContain("feat: add login");
		expect(prompt).toContain("last 7d");
	});

	it("handles zero commits gracefully", () => {
		const activities = groupByContributor([]);
		expect(activities).toHaveLength(0);

		const prompt = buildPrompt(activities, "24h");
		expect(prompt).toContain("last 24h");
	});
});
