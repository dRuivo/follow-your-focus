import { writable } from 'svelte/store';

export type ModalName = 'feedback' | 'intro' | 'whatNext' | 'helpPrinting';

type ModalsState = {
	[key in ModalName]: boolean;
};

const initialState: ModalsState = {
	feedback: false,
	intro: true,
	whatNext: false,
	helpPrinting: false
};

export const modals = writable<ModalsState>(initialState);

export function openModal(name: ModalName) {
	modals.update((m) => ({ ...m, [name]: true }));
}

export function closeModal(name: ModalName) {
	modals.update((m) => ({ ...m, [name]: false }));
}
