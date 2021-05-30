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

  return parseResponse(response.data);
}

function parseResponse(data) {
  const images = [];

  for (const post of data) {
    const image = {
      id: post?.["id"],
      file_name: post?.["md5"] + post?.["file_ext"] || "",
      source: post?.["source"],
      artist: post?.["tag_string_artist"],
      thumbnail_url: post?.["preview_file_url"],
      file_url: post?.["file_url"],
      width: post?.["image_width"],
      height: post?.["image_height"],
      tags: post?.["tag_string"].split(" "),
      data: post,
    };

    images.push(image);
  }

  return images;
}
