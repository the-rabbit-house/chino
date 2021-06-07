import { writable, derived } from "svelte/store";
import { writable as persistent } from "svelte-local-storage-store";

import BACKENDS from "./backends";

export const DEFAULT_SETTINGS = {
  backend: BACKENDS["danbooru"],
  limit: 20,
  throttle: 1,
  galleryCols: 3,
  galleryImageSize: "BASE",
  swipeDistance: 0.2,
};

export const settings = persistent("settings", DEFAULT_SETTINGS);

export const images = writable([]);
export const image = writable(null);

export const tags = writable([]);

export const favorites = persistent("favorites", []);
