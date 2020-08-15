import { writable, Writable } from 'svelte/store';
import type { SensorMap } from '../models/State';
import type { Hubkit } from '../models/GravioModels';

const Smaps: Writable<Array<SensorMap>> = writable([]);
const Hubkits: Writable<Array<Hubkit>> = writable([]);

const AcceptedMapFiles: ReadonlyArray<string> = [
    "image/*",
];

export {
    Smaps,
    Hubkits,
    AcceptedMapFiles
};