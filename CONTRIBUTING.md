# Contributing to Commit Chronicles

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/nicksan222/commit-chronicle.git
cd commit-chronicle

# Install dependencies (requires Bun)
bun install

# Run tests
bun test

# Run linter
bun run lint

# Fix lint issues
bun run lint:fix

# Build the action
bun run build
```

## Making Changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `bun test` and `bun run lint` — both must pass
4. Run `bun run build` and commit the updated `dist/index.js`
5. Open a pull request against `main`

## Project Structure

```
src/
  git/           # Git log parsing and time range utilities
  ai/            # Vercel AI SDK integration, prompt building
  providers/     # Chat provider interface (Slack, future: Discord, Teams)
  main.ts        # GitHub Action entry point
tests/           # Mirror of src/ structure
```

## Adding a New Chat Provider

The architecture is designed for this. To add a new provider (e.g., Discord):

1. Create `src/providers/discord.ts` implementing the `ChatProvider` interface
2. Add `"discord"` to `SupportedChatProvider` in `src/providers/factory.ts`
3. Add the factory entry with its required config
4. Add the new input to `action.yml`
5. Wire it up in `src/main.ts`
6. Add tests in `tests/providers/discord.test.ts`

## Adding a New AI Provider

The Vercel AI SDK supports many providers. To add one:

1. Install the SDK package: `bun add @ai-sdk/<provider>`
2. Add the provider to `src/ai/provider.ts` (type, default model, factory)
3. Add tests

## Code Style

- We use [Biome](https://biomejs.dev/) for linting and formatting
- Run `bun run lint:fix` before committing
- Use tabs for indentation (Biome default)
- Write tests for all new functionality

## Commit Messages

We use short, descriptive commit messages (max 80 chars):

- `feat:` new feature
- `fix:` bug fix
- `test:` adding or updating tests
- `docs:` documentation changes
- `chore:` maintenance tasks
- `ci:` CI/CD changes
- `style:` formatting changes

## Releases

Releases happen automatically on every push to `main`. No manual version bumping needed.
