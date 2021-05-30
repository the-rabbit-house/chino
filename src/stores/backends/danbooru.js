import { writable } from "svelte/store";

import { Http } from "@capacitor-community/http";

export async function fetchImages(tags, page) {
  const response = await Http.request({
    method: "GET",
    url:
      "https://danbooru.donmai.us/posts.json" +
      "?tags=" +
      tags.join("+") +
      "&page=" +
      page +
      "&limit=5",
  });

  return response.data;
}
