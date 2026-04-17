import * as core from "@actions/core";
import { getCommitsSince, groupByContributor } from "./git";
import { generatePulse, isSupportedProvider } from "./ai";
import type { SupportedProvider } from "./ai";
import { createChatProvider } from "./providers";

async function run(): Promise<void> {
  const timeRange = core.getInput("time_range", { required: true });
  const aiProvider = core.getInput("ai_provider", { required: true });
  const aiApiKey = core.getInput("ai_api_key", { required: true });
  const aiModel = core.getInput("ai_model") || undefined;
  const slackWebhookUrl = core.getInput("slack_webhook_url", {
    required: true,
  });

  // Mask secrets so they never appear in logs
  core.setSecret(aiApiKey);
  core.setSecret(slackWebhookUrl);

  if (!isSupportedProvider(aiProvider)) {
    throw new Error(
      `Unsupported AI provider "${aiProvider}". Supported: openai, anthropic, google`
    );
  }

  core.info(`Fetching commits from the last ${timeRange}...`);
  const commits = await getCommitsSince(timeRange);

  if (commits.length === 0) {
    core.warning("No commits found in the specified time range.");
    const chatProvider = createChatProvider("slack", {
      slack_webhook_url: slackWebhookUrl,
    });
    await chatProvider.send(
      `_No commits found in the last ${timeRange}. Nothing to report._`
    );
    return;
  }

  core.info(`Found ${commits.length} commit(s). Grouping by contributor...`);
  const activities = groupByContributor(commits);
  core.info(
    `${activities.length} contributor(s): ${activities.map((a) => a.author).join(", ")}`
  );

  core.info(`Generating pulse with ${aiProvider}...`);
  const pulse = await generatePulse({
    provider: aiProvider as SupportedProvider,
    apiKey: aiApiKey,
    model: aiModel,
    activities,
    timeRange,
  });

  core.info("Sending pulse to Slack...");
  const chatProvider = createChatProvider("slack", {
    slack_webhook_url: slackWebhookUrl,
  });
  await chatProvider.send(pulse);

  core.info("Pulse sent successfully!");
  core.setOutput("pulse", pulse);
}

run().catch((error) => {
  core.setFailed(
    error instanceof Error ? error.message : "An unknown error occurred"
  );
});
