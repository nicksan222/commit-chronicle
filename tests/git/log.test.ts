import { describe, expect, it } from "bun:test";
import { groupByContributor } from "../../src/git/log";
import type { Commit } from "../../src/git/types";

function makeCommit(overrides: Partial<Commit> = {}): Commit {
  return {
    hash: "abc123",
    author: "Alice",
    email: "alice@example.com",
    date: new Date(),
    message: "fix: something",
    ...overrides,
  };
}

describe("groupByContributor", () => {
  it("groups commits by email", () => {
    const commits: Commit[] = [
      makeCommit({ author: "Alice", email: "alice@example.com", message: "feat: add login" }),
      makeCommit({ author: "Bob", email: "bob@example.com", message: "fix: typo" }),
      makeCommit({ author: "Alice", email: "alice@example.com", message: "feat: add signup" }),
    ];

    const result = groupByContributor(commits);

    expect(result).toHaveLength(2);
    expect(result[0]!.author).toBe("Alice");
    expect(result[0]!.commits).toHaveLength(2);
    expect(result[1]!.author).toBe("Bob");
    expect(result[1]!.commits).toHaveLength(1);
  });

  it("sorts by commit count descending", () => {
    const commits: Commit[] = [
      makeCommit({ email: "bob@example.com", author: "Bob" }),
      makeCommit({ email: "alice@example.com", author: "Alice" }),
      makeCommit({ email: "alice@example.com", author: "Alice" }),
      makeCommit({ email: "alice@example.com", author: "Alice" }),
    ];

    const result = groupByContributor(commits);

    expect(result[0]!.author).toBe("Alice");
    expect(result[0]!.commits).toHaveLength(3);
    expect(result[1]!.author).toBe("Bob");
    expect(result[1]!.commits).toHaveLength(1);
  });

  it("returns empty array for no commits", () => {
    expect(groupByContributor([])).toEqual([]);
  });

  it("handles single contributor", () => {
    const commits: Commit[] = [
      makeCommit({ email: "alice@example.com" }),
      makeCommit({ email: "alice@example.com" }),
    ];

    const result = groupByContributor(commits);
    expect(result).toHaveLength(1);
    expect(result[0]!.commits).toHaveLength(2);
  });

  it("uses the most recent author name for same email", () => {
    const commits: Commit[] = [
      makeCommit({
        author: "alice",
        email: "alice@example.com",
        date: new Date("2026-04-10"),
      }),
      makeCommit({
        author: "Alice Smith",
        email: "alice@example.com",
        date: new Date("2026-04-15"),
      }),
    ];

    const result = groupByContributor(commits);
    expect(result).toHaveLength(1);
    expect(result[0]!.author).toBe("Alice Smith");
  });
});
