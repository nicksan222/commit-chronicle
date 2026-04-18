import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockLog = mock(() =>
	Promise.resolve({
		all: [
			{
				hash: "abc1234567890",
				author_name: "Alice",
				author_email: "alice@example.com",
				date: "2026-04-15T10:00:00Z",
				message: "feat: add login",
				refs: "",
				body: "",
			},
			{
				hash: "def4567890123",
				author_name: "Bob",
				author_email: "bob@example.com",
				date: "2026-04-16T12:00:00Z",
				message: "fix: typo",
				refs: "",
				body: "",
			},
		],
		latest: null,
		total: 2,
	}),
);

mock.module("simple-git", () => ({
	default: () => ({ log: mockLog }),
	__esModule: true,
}));

// Dynamic import AFTER mock is set up
const { getCommitsSince } = await import("../../src/git/log");

describe("getCommitsSince", () => {
	beforeEach(() => {
		mockLog.mockClear();
	});

	it("returns mapped commits from git log", async () => {
		const commits = await getCommitsSince("7d");

		expect(commits).toHaveLength(2);
		expect(commits[0]?.hash).toBe("abc1234567890");
		expect(commits[0]?.author).toBe("Alice");
		expect(commits[0]?.email).toBe("alice@example.com");
		expect(commits[0]?.date).toBeInstanceOf(Date);
		expect(commits[0]?.message).toBe("feat: add login");
		expect(commits[1]?.author).toBe("Bob");
	});

	it("passes --since and --all to git log", async () => {
		await getCommitsSince("24h");

		expect(mockLog).toHaveBeenCalled();
		const callArgs = mockLog.mock.calls[0]?.[0] as Record<string, unknown>;
		expect(callArgs["--all"]).toBeNull();
		expect(typeof callArgs["--since"]).toBe("string");
	});

	it("returns empty array when no commits", async () => {
		mockLog.mockImplementationOnce(() =>
			Promise.resolve({ all: [], latest: null, total: 0 }),
		);

		const commits = await getCommitsSince("1d");
		expect(commits).toEqual([]);
	});

	it("propagates git errors", async () => {
		mockLog.mockImplementationOnce(() =>
			Promise.reject(new Error("not a git repository")),
		);

		await expect(getCommitsSince("1d")).rejects.toThrow("not a git repository");
	});
});
