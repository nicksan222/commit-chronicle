export function parseTimeRange(range: string): Date {
	const match = range.match(/^(\d+)(h|d|w|m)$/);
	if (!match) {
		throw new Error(
			`Invalid time range "${range}". Expected format: <number><unit> where unit is h (hours), d (days), w (weeks), or m (months). Examples: 24h, 7d, 2w, 1m`,
		);
	}

	const amount = parseInt(match[1]!, 10);
	if (amount === 0) {
		throw new Error(
			`Invalid time range "${range}". Amount must be greater than 0.`,
		);
	}
	const unit = match[2]!;
	const now = new Date();

	switch (unit) {
		case "h":
			now.setHours(now.getHours() - amount);
			break;
		case "d":
			now.setDate(now.getDate() - amount);
			break;
		case "w":
			now.setDate(now.getDate() - amount * 7);
			break;
		case "m":
			now.setDate(now.getDate() - amount * 30);
			break;
	}

	return now;
}
