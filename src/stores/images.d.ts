/**
 * Indicates that some requests are fetching images
 */
export declare const fetching: boolean;

/**
 * Indicates that there is next page of current search query
 */
export declare const hasNextPage: boolean;

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
export declare function requestImages(tags: Array<string>): boolean;

/**
 * Fetches next page of images
 * 
 * @returns {boolean} boolean that indicates success
 */
export declare function requestMoreImages(): boolean;

/**
 * Fetches tags using pattern, used for tags autocompletion
 *
 * @param {string} tag The tag which will get autocompleted
 * @returns {boolean} boolean that indicates success
 */

export declare interface Image {
  id: string,
  file_name: string,
  file_ext: string,
  source: string,
  artist: string,
  thumbnail_url: string,
  file_url: string,
  sample_url: string,
  width: number,
  height: number,
  tags: Array<string>,
  video: boolean
  data: any,
}