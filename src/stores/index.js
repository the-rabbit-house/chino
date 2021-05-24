import { writable, derived } from "svelte/store";

export const images = writable([]);
export const image = writable(null);

export const tags = writable(["rating:safe"]);

export const lastScrollY = writable(0);
