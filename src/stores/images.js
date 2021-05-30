import { writable, get } from "svelte/store";

import { backend, tags, images } from "@Stores";

export const fetching = writable(false);

var page = 1;

export async function requestImages(targetTags) {
  if (get(fetching)) return false;

  page = 1;
  images.set([]);

  fetching.set(true);

  const targetImages = await get(backend).fetchImages(
    targetTags,
    page
  );

  fetching.set(false);

  tags.set(targetTags);
  images.set(targetImages);

  return true;
}

export async function requestMoreImages() {
  if (get(fetching)) return;

  ++page;
  const nextImages = await get(backend).fetchImages(
    get(tags),
    page
  );

  images.set([...get(images), ...nextImages]);
}
