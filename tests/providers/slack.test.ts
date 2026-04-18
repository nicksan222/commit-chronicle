import { describe, expect, it } from "bun:test";
import { SlackProvider } from "../../src/providers/slack";

function withMockFetch<T>(
  mockFn: (url: string, options: RequestInit) => Response | Promise<Response>,
  testFn: () => T
): T {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFn as typeof fetch;
  try {
    return testFn();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function capturedFetch() {
  const calls: { url: string; options: RequestInit }[] = [];
  const mock = async (url: string, options: RequestInit) => {
    calls.push({ url, options });
    return new Response("ok", { status: 200 });
  };
  return { calls, mock };
}

describe("SlackProvider", () => {
  it("throws if webhook URL is empty", () => {
    expect(() => new SlackProvider("")).toThrow("Slack webhook URL is required");
  });

  it("has name 'slack'", () => {
    const provider = new SlackProvider("https://hooks.slack.com/test");
    expect(provider.name).toBe("slack");
  });

  it("sends message with correct Block Kit payload", async () => {
    const { calls, mock } = capturedFetch();
    await withMockFetch(mock, async () => {
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
    });
  });

  it("throws on non-ok response", async () => {
    await withMockFetch(
      async () => new Response("invalid_payload", { status: 400 }),
      async () => {
        const provider = new SlackProvider("https://hooks.slack.com/test");
        await expect(provider.send("Hello")).rejects.toThrow(
          "Slack webhook failed (400): invalid_payload"
        );
      }
    );
  });

  it("throws on network error", async () => {
    await withMockFetch(
      async () => {
        throw new TypeError("fetch failed");
      },
      async () => {
        const provider = new SlackProvider("https://hooks.slack.com/test");
        await expect(provider.send("Hello")).rejects.toThrow("fetch failed");
      }
    );
  });

  it("truncates messages exceeding 2900 characters", async () => {
    const { calls, mock } = capturedFetch();
    await withMockFetch(mock, async () => {
      const provider = new SlackProvider("https://hooks.slack.com/test");
      await provider.send("x".repeat(3500));

      const body = JSON.parse(calls[0]!.options.body as string);
      const sentText = body.blocks[1].text.text as string;
      expect(sentText.length).toBeLessThanOrEqual(2920);
      expect(sentText).toEndWith("\n_[truncated]_");
    });
  });

  it("does not truncate message at exactly 2900 characters", async () => {
    const { calls, mock } = capturedFetch();
    await withMockFetch(mock, async () => {
      const msg = "x".repeat(2900);
      const provider = new SlackProvider("https://hooks.slack.com/test");
      await provider.send(msg);

      const body = JSON.parse(calls[0]!.options.body as string);
      expect(body.blocks[1].text.text).toBe(msg);
    });
  });

  it("does not truncate messages under 2900 characters", async () => {
    const { calls, mock } = capturedFetch();
    await withMockFetch(mock, async () => {
      const msg = "x".repeat(100);
      const provider = new SlackProvider("https://hooks.slack.com/test");
      await provider.send(msg);

      const body = JSON.parse(calls[0]!.options.body as string);
      expect(body.blocks[1].text.text).toBe(msg);
    });
  });
});
