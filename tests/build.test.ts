import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

describe("build output", () => {
	const distPath = resolve(import.meta.dir, "../dist/index.js");

	it("dist/index.js exists", () => {
		expect(existsSync(distPath)).toBe(true);
	});

	it("dist/index.js is not empty", async () => {
		const file = Bun.file(distPath);
		const size = file.size;
		expect(size).toBeGreaterThan(0);
	});

	it("dist/index.js contains expected modules", async () => {
		const content = await Bun.file(distPath).text();
		expect(content).toContain("generateText");
		expect(content).toContain("simple-git");
	});
});
