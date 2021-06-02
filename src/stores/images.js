import { writable, get } from "svelte/store";

import { backend, tags, images } from "@Stores";

export const fetching = writable(false);

export const page = writable(0);
export const limit = writable(10);
export const hasNextPage = writable(false);

export async function requestImages(targetTags) {
  if (get(fetching)) return false;

  const booru = get(backend);

  page.set(0);
  hasNextPage.set(false);

  images.set([]);

  fetching.set(true);

  const [success, allImages] = await booru.fetchImages(
    targetTags,
    {
      page: get(page),
      limit: get(limit),
    }
  );

  fetching.set(false);

  tags.set(targetTags);
  images.set(allImages);

  if (allImages?.length > 0) hasNextPage.set(true);

  return true;
}

export async function requestMoreImages() {
  if (!get(hasNextPage)) return false;
  if (get(fetching)) return false;

  const booru = get(backend);

  fetching.set(true);

  page.update((p) => p + 1);
  const [success, nextImages] = await booru.fetchImages(
    get(tags),
    {
      page: get(page),
      limit: get(limit),
    }
  );

  if (nextImages && nextImages?.length < 1)
    hasNextPage.set(false);

  fetching.set(false);

  images.set([...get(images), ...nextImages]);

  return true;
}
