import type { FocusRingParams } from '$lib/focusRing/types';
import jscad from '@jscad/modeling';

type WorkerResponse = {
	type: 'complete' | 'error';
	id: string;
	geometry?: jscad.geometries.geom3.Geom3;
	numTeeth?: number;
	error?: string;
};

export class FocusRingWorkerManager {
	private worker: Worker;
	private requestMap = new Map<
		string,
		{
			resolve: (value: any) => void;
			reject: (error: Error) => void;
		}
	>();
	private requestCounter = 0;

	constructor() {
		// Create worker from the worker file
		this.worker = new Worker(new URL('./focusRing.worker.ts', import.meta.url), {
			type: 'module'
		});

		// Listen for responses
		this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
			const { type, id, geometry, numTeeth, error } = event.data;
			const request = this.requestMap.get(id);

			if (!request) return;

			this.requestMap.delete(id);

			if (type === 'error') {
				request.reject(new Error(error || 'Unknown worker error'));
			} else {
				request.resolve({ geometry, numTeeth });
			}
		};

		this.worker.onerror = (event: ErrorEvent) => {
			console.error('Worker error:', event.message);
		};
	}

	async generate(params: FocusRingParams): Promise<{ geometry: any; numTeeth: number }> {
		return new Promise((resolve, reject) => {
			const id = String(++this.requestCounter);

			this.requestMap.set(id, { resolve, reject });

			this.worker.postMessage({
				type: 'generate',
				params,
				id
			});

			// Optional: Add timeout to prevent hanging
			setTimeout(() => {
				if (this.requestMap.has(id)) {
					this.requestMap.delete(id);
					reject(new Error('Worker request timeout'));
				}
			}, 60000); // 60 second timeout
		});
	}

	terminate() {
		this.worker.terminate();
	}
}
