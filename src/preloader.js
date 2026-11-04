/**
 * Downloads every asset in parallel while reporting byte-level progress.
 * Resolves with a Map of url -> ArrayBuffer.
 */
export async function preloadAssets(assets, onProgress) {
	const state = assets.map((asset) => ({ ...asset, loaded: 0, done: false }));
	const report = () => onProgress(state);
	report();

	const buffers = await Promise.all(
		state.map(async (item) => {
			const response = await fetch(item.url);
			if (!response.ok) {
				throw new Error(`Could not load ${item.label} (HTTP ${response.status})`);
			}

			let buffer;
			if (response.body && response.body.getReader) {
				const reader = response.body.getReader();
				const chunks = [];
				let received = 0;
				for (;;) {
					const { done, value } = await reader.read();
					if (done) break;
					chunks.push(value);
					received += value.byteLength;
					item.loaded = received;
					report();
				}
				const bytes = new Uint8Array(received);
				let offset = 0;
				for (const chunk of chunks) {
					bytes.set(chunk, offset);
					offset += chunk.byteLength;
				}
				buffer = bytes.buffer;
			} else {
				buffer = await response.arrayBuffer();
			}

			item.size = buffer.byteLength;
			item.loaded = buffer.byteLength;
			item.done = true;
			report();
			return [item.url, buffer];
		})
	);

	return new Map(buffers);
}

