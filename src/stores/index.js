import { writable, derived } from "svelte/store";
import { writable as persistent } from "svelte-local-storage-store";

import BACKENDS from "./backends";

export const settings = persistent("settings", {
  galleryCols: 3,
  galleryImageSize: "BASE",
  swipeDistance: 0.2,
});

// Default to danbooru since its cors-free
export const backend = writable(BACKENDS["danbooru"]);

export const images = writable([]);
export const image = writable(null);

export const tags = writable([]);

export const favorites = persistent("favorites", []);
