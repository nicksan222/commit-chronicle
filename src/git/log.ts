import simpleGit, { type SimpleGit } from "simple-git";
import type { Commit, ContributorActivity } from "./types";
import { parseTimeRange } from "./time-range";

let git: SimpleGit | null = null;

function getGit(): SimpleGit {
  if (!git) {
    const repoPath = process.env.GITHUB_WORKSPACE ?? process.cwd();
    git = simpleGit(repoPath);
  }
  return git;
}

export async function getCommitsSince(timeRange: string): Promise<Commit[]> {
  const since = parseTimeRange(timeRange);

  const log = await getGit().log({
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
  const grouped = new Map<
    string,
    ContributorActivity & { latestDate: Date }
  >();

  for (const commit of commits) {
    const key = commit.email;
    const existing = grouped.get(key);

    if (existing) {
      existing.commits.push(commit);
      if (commit.date > existing.latestDate) {
        existing.latestDate = commit.date;
        existing.author = commit.author;
      }
    } else {
      grouped.set(key, {
        author: commit.author,
        email: commit.email,
        commits: [commit],
        latestDate: commit.date,
      });
    }
  }

  return Array.from(grouped.values())
    .map(({ author, email, commits }) => ({ author, email, commits }))
    .sort((a, b) => b.commits.length - a.commits.length);
}
