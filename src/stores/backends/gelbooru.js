import { writable } from "svelte/store";

import { Http } from "@capacitor-community/http";

export async function fetchImages(tags, page) {
  const response = await Http.request({
    method: "GET",
    url:
      "https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1" +
      "&tags=" +
      tags.join("+") +
      "&pid=" +
      page +
      "&limit=30",
  });

  return response.data;
}
