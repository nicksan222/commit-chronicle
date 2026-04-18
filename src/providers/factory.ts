import { SlackProvider } from "./slack";
import type { ChatProvider } from "./types";

export type SupportedChatProvider = "slack";

interface ChatProviderConfig {
	slack_webhook_url?: string;
}

const PROVIDER_FACTORIES: Record<
	SupportedChatProvider,
	(config: ChatProviderConfig) => ChatProvider
> = {
	slack: (config) => {
		if (!config.slack_webhook_url) {
			throw new Error("slack_webhook_url is required for Slack provider");
		}
		return new SlackProvider(config.slack_webhook_url);
	},
};

export function isSupportedChatProvider(
	provider: string,
): provider is SupportedChatProvider {
	return provider in PROVIDER_FACTORIES;
}

export function createChatProvider(
	provider: SupportedChatProvider,
	config: ChatProviderConfig,
): ChatProvider {
	return PROVIDER_FACTORIES[provider](config);
}
