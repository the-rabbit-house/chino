import { writable, derived } from "svelte/store";
import { writable as persistent } from "svelte-local-storage-store";

export const DEFAULT_SETTINGS = {
  backend: "danbooru",
  limit: 20,
  throttle: 1,
  galleryCols: 3,
  galleryImageSize: "BASE",
  swipeDistance: 0.2,
  nsfw: false,
};

export const settings = persistent("settings", DEFAULT_SETTINGS);

export const favorites = {
  tags: writable([]),
  images: writable([]),
};

export const images = writable([]);
export const image = writable(null);

export const tags = writable([]);
