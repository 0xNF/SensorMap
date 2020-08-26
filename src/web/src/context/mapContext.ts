import { writable, Writable } from 'svelte/store';
import type { SensorMap } from '../models/State';
import type { Hubkit } from '../models/GravioModels';

const Smaps: Writable<Array<SensorMap>> = writable([]);
const Hubkits: Writable<Array<Hubkit>> = writable([]);

/** We only accept JPEG, png, and svg. This is becuase we put everything underneath an svg>image tag, and that tag only officially supports those file types */
const AcceptedMapFiles: ReadonlyArray<string> = [
    "image/jpeg",
    "image/png",
    "image/svg+xml",
];

export {
    Smaps,
    Hubkits,
    AcceptedMapFiles
};