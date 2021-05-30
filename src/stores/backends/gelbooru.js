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

  return parseResponse(response.data);
}

function parseResponse(data) {
  const images = [];

  const baseUrl = "https://img3.gelbooru.com";

  for (const post of data) {
    const image = {
      id: post?.["hash"],
      file_name: post?.["image"],
      source: post?.["source"],
      artist: post?.["owner"],
      thumbnail_url: `${baseUrl}/thumbnails/${post?.["directory"]}/thumbnail_${post?.["image"]}`,
      file_url: post?.["file_url"],
      width: post?.["width"],
      height: post?.["height"],
      tags: post?.["tags"].split(" "),
      data: post,
    };

    images.push(image);
  }

  return images;
}
