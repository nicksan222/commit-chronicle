import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { parseTimeRange } from "../../src/git/time-range";

describe("parseTimeRange", () => {
  let realNow: number;

  beforeEach(() => {
    realNow = Date.now();
  });

  it("parses hours", () => {
    const result = parseTimeRange("24h");
    const expected = new Date(realNow - 24 * 60 * 60 * 1000);
    expect(Math.abs(result.getTime() - expected.getTime())).toBeLessThan(1000);
  });

  it("parses days", () => {
    const result = parseTimeRange("7d");
    const expected = new Date(realNow - 7 * 24 * 60 * 60 * 1000);
    expect(Math.abs(result.getTime() - expected.getTime())).toBeLessThan(1000);
  });

  it("parses weeks", () => {
    const result = parseTimeRange("2w");
    const expected = new Date(realNow - 14 * 24 * 60 * 60 * 1000);
    expect(Math.abs(result.getTime() - expected.getTime())).toBeLessThan(1000);
  });

  it("parses months as 30-day periods", () => {
    const result = parseTimeRange("1m");
    const expected = new Date(realNow - 30 * 24 * 60 * 60 * 1000);
    expect(Math.abs(result.getTime() - expected.getTime())).toBeLessThan(1000);
  });

  it("throws on invalid format", () => {
    expect(() => parseTimeRange("abc")).toThrow('Invalid time range "abc"');
  });

  it("throws on missing unit", () => {
    expect(() => parseTimeRange("24")).toThrow('Invalid time range "24"');
  });

  it("throws on invalid unit", () => {
    expect(() => parseTimeRange("24x")).toThrow('Invalid time range "24x"');
  });

  it("throws on empty string", () => {
    expect(() => parseTimeRange("")).toThrow('Invalid time range ""');
  });

  it("throws on zero amount", () => {
    expect(() => parseTimeRange("0d")).toThrow("Amount must be greater than 0");
    expect(() => parseTimeRange("0h")).toThrow("Amount must be greater than 0");
  });
});
