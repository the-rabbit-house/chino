import { get } from "svelte/store";
import { writable as persistent } from "svelte-local-storage-store";

import { favorites } from "@Stores";

import * as R from "ramda";

const cache = {
  tags: persistent("favorites:tags", []),
  images: persistent("favorites:images", []),
};

cache.tags.subscribe(tags => favorites.tags.set(tags));
cache.images.subscribe(images => favorites.images.set(images));

export function toggleTag(tag) {
  const tags = get(cache.tags);

  let nextTags = tags;
  if (!R.find(R.equals(tag), tags))
    nextTags = R.append(tag, nextTags);
  else nextTags = R.without([tag], nextTags);

  cache.tags.set(nextTags);
}

export function toggleImage(image) {
  const images = get(cache.images);

  let nextImages = images;

  const found = R.defaultTo(
    null,
    R.find(R.propEq("id", image.id), images)
  );

  if (!found) nextImages = R.append(image, nextImages);
  else nextImages = R.without([found], nextImages);

  cache.images.set(nextImages);
}
