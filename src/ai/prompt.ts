import type { ContributorActivity } from "../git/types";

export function buildPrompt(
  activities: ContributorActivity[],
  timeRange: string
): string {
  const contributorSections = activities
    .map((activity) => {
      const commitList = activity.commits
        .map((c) => `  - ${c.hash.slice(0, 7)} ${c.message}`)
        .join("\n");
      return `### ${activity.author} (${activity.email}) — ${activity.commits.length} commit(s)\n${commitList}`;
    })
    .join("\n\n");

  return `You are a technical team lead writing a concise team activity pulse report.

Analyze the following git activity from the last ${timeRange} and write a report grouped by contributor.

For each contributor, write a brief summary of what they worked on, highlighting:
- Key features or changes they delivered
- Bug fixes or improvements
- Any patterns or themes in their work

End with a brief "Team Highlights" section noting any cross-cutting themes or notable achievements.

Keep the tone professional but approachable. Use plain text formatting suitable for Slack messages.
Do NOT use markdown headers — use *bold* for section headers (Slack format).

---

${contributorSections}`;
}
