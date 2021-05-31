import { writable, derived } from "svelte/store";

import BACKENDS from "./backends";

export const settings = writable({ galleryCols: 3 });

// Default to danbooru since its cors-free
export const backend = writable(BACKENDS["danbooru"]);

export const images = writable([]);
export const image = writable(null);

export const tags = writable([]);
export const favorites = writable([]);
