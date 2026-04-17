import simpleGit from "simple-git";
import type { Commit, ContributorActivity } from "./types";
import { parseTimeRange } from "./time-range";

const repoPath = process.env.GITHUB_WORKSPACE ?? process.cwd();
const git = simpleGit(repoPath);

export async function getCommitsSince(timeRange: string): Promise<Commit[]> {
  const since = parseTimeRange(timeRange);

  const log = await git.log({
    "--since": since.toISOString(),
    "--all": null,
  });

  return log.all.map((entry) => ({
    hash: entry.hash,
    author: entry.author_name,
    email: entry.author_email,
    date: new Date(entry.date),
    message: entry.message,
  }));
}

export function groupByContributor(commits: Commit[]): ContributorActivity[] {
  const grouped = new Map<string, ContributorActivity>();

  for (const commit of commits) {
    const key = commit.email;
    const existing = grouped.get(key);

    if (existing) {
      existing.commits.push(commit);
      // Use the most recent author name for this email
      if (commit.date > existing.commits[0]!.date) {
        existing.author = commit.author;
      }
    } else {
      grouped.set(key, {
        author: commit.author,
        email: commit.email,
        commits: [commit],
      });
    }
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.commits.length - a.commits.length
  );
}
