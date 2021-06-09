export class EventEmitter {
	private events: Map<string, Set<CallableFunction>> = new Map();

	emit(event: string, data?: any): void {
		const subscribers = this.events.get(event);
		if (subscribers) {
			for (const subscriber of subscribers.values()) {
				subscriber(data);
			}
		}
	}

	on(event: string, callback: CallableFunction): void {
		const subscribers = this.events.get(event);
		if (subscribers) {
			subscribers.add(callback);
		} else {
			const subscribers = new Set<CallableFunction>();
			subscribers.add(callback);
			this.events.set(event, subscribers);
		}
	}

	off(event: string, callback: CallableFunction): void {
		const subscribers = this.events.get(event);
		if (subscribers) {
			if (callback) {
				subscribers.delete(callback);
			} else this.events.delete(event);
		}
	}
}
