import { describe, expect, it } from "bun:test";
import { buildPrompt } from "../../src/ai/prompt";
import type { ContributorActivity } from "../../src/git/types";

describe("buildPrompt", () => {
  const activities: ContributorActivity[] = [
    {
      author: "Alice",
      email: "alice@example.com",
      commits: [
        {
          hash: "abc1234567890",
          author: "Alice",
          email: "alice@example.com",
          date: new Date("2026-04-15"),
          message: "feat: add user authentication",
        },
        {
          hash: "def4567890123",
          author: "Alice",
          email: "alice@example.com",
          date: new Date("2026-04-16"),
          message: "fix: resolve login redirect bug",
        },
      ],
    },
    {
      author: "Bob",
      email: "bob@example.com",
      commits: [
        {
          hash: "ghi7890123456",
          author: "Bob",
          email: "bob@example.com",
          date: new Date("2026-04-15"),
          message: "docs: update API readme",
        },
      ],
    },
  ];

  it("includes the time range", () => {
    const prompt = buildPrompt(activities, "7d");
    expect(prompt).toContain("last 7d");
  });

  it("includes contributor names and emails", () => {
    const prompt = buildPrompt(activities, "7d");
    expect(prompt).toContain("Alice (alice@example.com)");
    expect(prompt).toContain("Bob (bob@example.com)");
  });

  it("includes commit count per contributor", () => {
    const prompt = buildPrompt(activities, "7d");
    expect(prompt).toContain("2 commit(s)");
    expect(prompt).toContain("1 commit(s)");
  });

  it("includes truncated commit hashes", () => {
    const prompt = buildPrompt(activities, "7d");
    expect(prompt).toContain("abc1234");
    expect(prompt).toContain("def4567");
    expect(prompt).toContain("ghi7890");
  });

  it("includes commit messages", () => {
    const prompt = buildPrompt(activities, "7d");
    expect(prompt).toContain("feat: add user authentication");
    expect(prompt).toContain("fix: resolve login redirect bug");
    expect(prompt).toContain("docs: update API readme");
  });

  it("includes Slack formatting instruction", () => {
    const prompt = buildPrompt(activities, "7d");
    expect(prompt).toContain("*bold*");
    expect(prompt).toContain("Slack");
  });

  it("handles empty activities", () => {
    const prompt = buildPrompt([], "24h");
    expect(prompt).toContain("last 24h");
  });
});
