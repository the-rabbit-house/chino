import { Writable } from "svelte/store";
import { Image } from "./images";

/**
 * Supported backends
 */
type Backend = "danbooru" | "gelbooru";

/**
 * Supported sizes of gallery images 
 */
type ImageSize = "BASE" | "SMALL" | "LARGE";

export declare interface Settings {
  backend: Backend,
  limit: number, // Images per page
  throttle: number, // Images loaded at once
  galleryCols: number, // Number of columns in GalleryView
  galleryImageSize: ImageSize, // Size of images in GalleryView
  swipeDistance: number, // Swipe distance in % of screen width e.g 0.2 means 20% of screen
  useSourceQuality: boolean, // Use source quality whenever possible
  nsfw: boolean // Shows unsafe and explicit filters in SearchMenu
}

export declare const DEFAULT_SETTINGS: Settings;
export declare const settings: Writable<Settings>;

export declare const favorites: {
  tags: Writable<Array<string>>,
  images: Writable<Array<Image>>
};

export declare const images: Writable<Array<Image>>;
export declare const image: Writable<Image>;

export declare const tags: Writable<string>;

