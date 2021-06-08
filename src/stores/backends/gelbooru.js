import { writable } from "svelte/store";

import { Http } from "@capacitor-community/http";

export const NAME = "gelbooru";
export const PLATFORMS = ["native"];

export async function fetchImages(tags, { page, limit }) {
  try {
    const response = await Http.request({
      method: "GET",
      url:
        "https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1" +
        "&tags=" +
        tags.join("+") +
        "&pid=" +
        page +
        "&limit=" +
        limit,
    });

    return [true, parseResponse(response.data)];
  } catch (e) {
    return [false, []];
  }
}

function parseResponse(data) {
  const images = [];

  const baseUrl = "https://img3.gelbooru.com";

  for (const post of data) {
    if (!post?.["file_url"]) continue;

    const image = {
      id: post?.["hash"],
      file_name: post?.["image"],
      source: post?.["source"],
      artist: post?.["owner"],
      thumbnail_url: `${baseUrl}/thumbnails/${post?.["directory"]}/thumbnail_${post?.["hash"]}.jpg`,
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
