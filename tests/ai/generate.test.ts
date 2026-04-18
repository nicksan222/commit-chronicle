import { describe, expect, it, mock } from "bun:test";

const mockGenerateText = mock(() =>
  Promise.resolve({ text: "AI-generated pulse report" })
);

mock.module("ai", () => ({
  generateText: mockGenerateText,
}));

const { generatePulse } = await import("../../src/ai/generate");

describe("generatePulse", () => {
  it("returns text from generateText", async () => {
    const result = await generatePulse({
      provider: "openai",
      apiKey: "test-key",
      activities: [
        {
          author: "Alice",
          email: "alice@example.com",
          commits: [
            {
              hash: "abc123",
              author: "Alice",
              email: "alice@example.com",
              date: new Date(),
              message: "feat: add login",
            },
          ],
        },
      ],
      timeRange: "7d",
    });

    expect(result).toBe("AI-generated pulse report");
  });

  it("calls generateText with a model and prompt", async () => {
    mockGenerateText.mockClear();

    await generatePulse({
      provider: "openai",
      apiKey: "test-key",
      activities: [],
      timeRange: "24h",
    });

    expect(mockGenerateText).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateText.mock.calls[0]![0] as Record<
      string,
      unknown
    >;
    expect(callArgs["model"]).toBeDefined();
    expect(typeof callArgs["prompt"]).toBe("string");
    expect(callArgs["prompt"] as string).toContain("24h");
  });

  it("propagates AI errors", async () => {
    mockGenerateText.mockImplementationOnce(() =>
      Promise.reject(new Error("rate limit exceeded"))
    );

    await expect(
      generatePulse({
        provider: "openai",
        apiKey: "test-key",
        activities: [],
        timeRange: "7d",
      })
    ).rejects.toThrow("rate limit exceeded");
  });

  it("uses custom model when provided", async () => {
    mockGenerateText.mockClear();

    await generatePulse({
      provider: "openai",
      apiKey: "test-key",
      model: "gpt-4o-mini",
      activities: [],
      timeRange: "7d",
    });

    expect(mockGenerateText).toHaveBeenCalledTimes(1);
  });
});
