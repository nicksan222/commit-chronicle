import { describe, expect, it } from "bun:test";
import { SlackProvider } from "../../src/providers/slack";

describe("SlackProvider", () => {
  it("throws if webhook URL is empty", () => {
    expect(() => new SlackProvider("")).toThrow("Slack webhook URL is required");
  });

  it("has name 'slack'", () => {
    const provider = new SlackProvider("https://hooks.slack.com/test");
    expect(provider.name).toBe("slack");
  });

  it("sends message with correct Block Kit payload", async () => {
    const calls: { url: string; options: RequestInit }[] = [];

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string, options: RequestInit) => {
      calls.push({ url, options });
      return new Response("ok", { status: 200 });
    }) as typeof fetch;

    try {
      const provider = new SlackProvider("https://hooks.slack.com/test");
      await provider.send("Hello team!");

      expect(calls).toHaveLength(1);
      expect(calls[0]!.url).toBe("https://hooks.slack.com/test");

      const body = JSON.parse(calls[0]!.options.body as string);
      expect(body.blocks).toHaveLength(3);
      expect(body.blocks[0].type).toBe("header");
      expect(body.blocks[1].type).toBe("section");
      expect(body.blocks[1].text.text).toBe("Hello team!");
      expect(body.blocks[2].type).toBe("context");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("throws on non-ok response", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response("invalid_payload", { status: 400 });
    }) as typeof fetch;

    try {
      const provider = new SlackProvider("https://hooks.slack.com/test");
      await expect(provider.send("Hello")).rejects.toThrow(
        "Slack webhook failed (400): invalid_payload"
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("truncates messages exceeding 2900 characters", async () => {
    const calls: { url: string; options: RequestInit }[] = [];

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string, options: RequestInit) => {
      calls.push({ url, options });
      return new Response("ok", { status: 200 });
    }) as typeof fetch;

    try {
      const longMessage = "x".repeat(3500);
      const provider = new SlackProvider("https://hooks.slack.com/test");
      await provider.send(longMessage);

      const body = JSON.parse(calls[0]!.options.body as string);
      const sentText = body.blocks[1].text.text as string;
      expect(sentText.length).toBeLessThanOrEqual(2920);
      expect(sentText).toEndWith("\n_[truncated]_");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("does not truncate messages under 2900 characters", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response("ok", { status: 200 });
    }) as typeof fetch;

    try {
      const shortMessage = "x".repeat(100);
      const calls: { url: string; options: RequestInit }[] = [];
      globalThis.fetch = (async (url: string, options: RequestInit) => {
        calls.push({ url, options });
        return new Response("ok", { status: 200 });
      }) as typeof fetch;

      const provider = new SlackProvider("https://hooks.slack.com/test");
      await provider.send(shortMessage);

      const body = JSON.parse(calls[0]!.options.body as string);
      expect(body.blocks[1].text.text).toBe(shortMessage);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
