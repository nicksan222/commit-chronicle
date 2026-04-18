# Commit Chronicles

AI-powered team activity pulse from your git history, delivered to Slack.

Commit Chronicles reads your recent commits, groups them by contributor, sends them to an AI provider of your choice, and posts a team activity report to Slack.

## Quick Start

```yaml
name: Weekly Team Pulse

on:
  schedule:
    - cron: "0 9 * * 1" # Every Monday at 9am UTC
  workflow_dispatch:

jobs:
  pulse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: nicksan222/commit-chronicle@v1
        with:
          time_range: "7d"
          ai_provider: "openai"
          ai_api_key: ${{ secrets.AI_API_KEY }}
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `time_range` | Yes | `7d` | How far back to look. `24h`, `7d`, `2w`, `1m` |
| `ai_provider` | Yes | - | `openai`, `anthropic`, or `google` |
| `ai_api_key` | Yes | - | API key for the chosen provider |
| `ai_model` | No | per-provider | Override the default model |
| `slack_webhook_url` | Yes | - | Slack incoming webhook URL |

### Default Models

| Provider | Default Model |
|----------|--------------|
| `openai` | `gpt-4o` |
| `anthropic` | `claude-sonnet-4-20250514` |
| `google` | `gemini-2.5-flash` |

## Outputs

| Output | Description |
|--------|-------------|
| `pulse` | The generated team activity report text |

## Setup

### 1. Get an AI API key

Get a key from [OpenAI](https://platform.openai.com/api-keys), [Anthropic](https://console.anthropic.com/), or [Google AI](https://aistudio.google.com/apikey).

### 2. Create a Slack webhook

Go to [Slack Apps](https://api.slack.com/apps) > Create New App > Incoming Webhooks > Add New Webhook to Workspace.

### 3. Add secrets to your repo

Go to your repo Settings > Secrets and variables > Actions, and add:
- `AI_API_KEY` - your AI provider API key
- `SLACK_WEBHOOK_URL` - your Slack webhook URL

Optionally add `AI_PROVIDER` as a repository variable (Settings > Variables) if you want to change providers without editing the workflow.

## Examples

### Daily standup recap

```yaml
on:
  schedule:
    - cron: "0 9 * * 1-5" # Weekdays at 9am UTC

jobs:
  standup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: nicksan222/commit-chronicle@v1
        with:
          time_range: "24h"
          ai_provider: "anthropic"
          ai_api_key: ${{ secrets.AI_API_KEY }}
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Monthly report with custom model

```yaml
on:
  schedule:
    - cron: "0 9 1 * *" # First day of each month

jobs:
  monthly:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: nicksan222/commit-chronicle@v1
        with:
          time_range: "1m"
          ai_provider: "openai"
          ai_api_key: ${{ secrets.AI_API_KEY }}
          ai_model: "gpt-4o-mini"
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### On-demand via workflow dispatch

```yaml
on:
  workflow_dispatch:
    inputs:
      time_range:
        description: "How far back to look"
        default: "7d"

jobs:
  pulse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: nicksan222/commit-chronicle@v1
        with:
          time_range: ${{ inputs.time_range }}
          ai_provider: "openai"
          ai_api_key: ${{ secrets.AI_API_KEY }}
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Important Notes

- **`fetch-depth: 0` is required** in the checkout step so the full git history is available.
- **Secrets are masked** in logs automatically — the action calls `core.setSecret()` on your API key and webhook URL.
- **Long reports are truncated** to fit Slack's 3000-character block limit.
- **Zero commits?** The action sends a "nothing to report" message instead of failing.

## License

MIT
