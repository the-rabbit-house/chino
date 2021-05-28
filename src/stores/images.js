import { writable, get } from "svelte/store";

import { tags, images } from "./";

export const fetching = writable(false);

var page = 1;

export async function requestImages(_tags) {
  if (get(fetching)) return false;

  fetching.set(true);

  page = 1;

  const response = await fetch(
    "https://danbooru.donmai.us/posts.json" +
      "?tags=" +
      _tags.join("+") +
      "&page=" +
      page +
      "&limit=30"
  );

  fetching.set(false);

  tags.set(_tags);
  images.set(await response.json());

  return true;
}

export async function requestMoreImages() {
  if (get(fetching)) return;

  const _tags = get(tags);

  ++page;

  const response = await fetch(
    "https://danbooru.donmai.us/posts.json" +
      "?tags=" +
      _tags.join("+") +
      "&page=" +
      page +
      "&limit=30"
  );
}