export type { Image } from "./backends";

/**
 * Indicates that some requests are fetching images
 */
export declare const fetching: Writable<boolean>;

/**
 * Indicates that there is next page of current search query
 */
export declare const hasNextPage: Writable<boolean>;

/**
 * Adds or removes (toggles) the tag from being searched
 *
 * @param {string} tag The tag that is being added or removed from searching
 */
export declare function toggleTag(tag: string, d: number): void;

/**
 * Fetches images based on provided tags then places it in global images store
 * 
 * @param {Array<string>} tags The tags which should be searched for
 * @returns {boolean} boolean that indicates success
 */
export declare function requestImages(tags: Array<string>): Promise<boolean>;

/**
 * Fetches next page of images
 * 
 * @returns {boolean} boolean that indicates success
 */
export declare function requestMoreImages(): Promise<boolean>;

/**
 * Fetches tags using pattern, used for tags autocompletion
 *
 * @param {string} tag The tag which will get autocompleted
 * @returns {boolean} boolean that indicates success
 */
export declare function requestTags(tag: string): Promise<boolean>;