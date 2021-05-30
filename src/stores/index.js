import { writable, derived } from "svelte/store";

import BACKENDS from "./backends";

// Default to danbooru since its cors-free
export const backend = writable(BACKENDS["danbooru"]);

export const images = writable([]);
export const image = writable(null);

export const tags = writable([]);
export const favorites = writable([]);

export const lastScrollY = writable(0);
