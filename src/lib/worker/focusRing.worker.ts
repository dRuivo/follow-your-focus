import { makeFocusRing } from '$lib/focusRing/makeFocusRing';
import type { FocusRingParams } from '$lib/focusRing/types';

type WorkerMessage = {
    type: 'generate';
    params: FocusRingParams;
    id: string;
};

type WorkerResponse = {
    type: 'complete' | 'error';
    id: string;
    geometry?: any;
    numTeeth?: number;
    error?: string;
};

// Listen for messages from the main thread
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
    const { type, params, id } = event.data;

    if (type === 'generate') {
        try {
            const result = makeFocusRing(params);
            
            // Send result back to main thread
            const response: WorkerResponse = {
                type: 'complete',
                id,
                geometry: result.geometry,
                numTeeth: result.numTeeth
            };
            
            self.postMessage(response);
        } catch (error) {
            const response: WorkerResponse = {
                type: 'error',
                id,
                error: error instanceof Error ? error.message : String(error)
            };
            
            self.postMessage(response);
        }
    }
};