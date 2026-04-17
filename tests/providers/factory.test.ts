import { describe, expect, it } from "bun:test";
import {
  createChatProvider,
  isSupportedChatProvider,
} from "../../src/providers/factory";
import { SlackProvider } from "../../src/providers/slack";

describe("isSupportedChatProvider", () => {
  it("returns true for slack", () => {
    expect(isSupportedChatProvider("slack")).toBe(true);
  });

  it("returns false for unknown provider", () => {
    expect(isSupportedChatProvider("discord")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isSupportedChatProvider("")).toBe(false);
  });
});

describe("createChatProvider", () => {
  it("creates SlackProvider with webhook URL", () => {
    const provider = createChatProvider("slack", {
      slack_webhook_url: "https://hooks.slack.com/test",
    });
    expect(provider).toBeInstanceOf(SlackProvider);
    expect(provider.name).toBe("slack");
  });

  it("throws when slack_webhook_url is missing", () => {
    expect(() => createChatProvider("slack", {})).toThrow(
      "slack_webhook_url is required"
    );
  });
});
