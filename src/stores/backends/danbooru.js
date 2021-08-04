import { Http } from "@capacitor-community/http";

import * as R from "ramda";
import { timeout } from "@Utils";

export const NAME = "danbooru";
export const PLATFORMS = ["web", "native"];

const ROOT_URL = "https://danbooru.donmai.us/";

export async function fetchImages(tags, { page, limit }) {
  try {
    const response = await Http.request({
      method: "GET",
      // We pack everything into url since Http package forces + to be %2B
      url:
        ROOT_URL +
        "/posts.json" +
        "?tags=" +
        tags.join("+") +
        "&page=" +
        (page + 1) + // danbooru page 0/1 is the same
        "&limit=" +
        limit,
      connectTimeout: 8000,
      webFetchExtra: {
        signal: timeout(),
      },
    });

    return [true, parseImagesResponse(response.data)];
  } catch (e) {
    return [false, []];
  }
}

export async function fetchTags(tag) {
  // Unsupported:
  // autocomplete.php is CORS
  // tags.json has bad fuzzy search
  return false;
}

const isVideo = R.anyPass([
  R.equals("zip"),
  R.equals("webm"),
  R.equals("mp4"),
]);

function parseImagesResponse(data) {
  const images = [];

  for (const post of data) {
    if (!post?.["file_url"]) continue;

    const file_ext = post?.["file_ext"];

    const image = {
      id: post?.["md5"],
      file_name: post?.["md5"] + "." + post?.["file_ext"] || "",
      file_ext,
      source: post?.["source"],
      artist: post?.["tag_string_artist"],
      thumbnail_url: post?.["preview_file_url"],
      file_url: !isVideo(file_ext)
        ? post?.["file_url"]
        : post?.["large_file_url"],
      sample_url: post?.["large_file_url"],
      width: post?.["image_width"],
      height: post?.["image_height"],
      tags: post?.["tag_string"].split(" "),
      data: post,
      video: isVideo(file_ext),
    };

    images.push(image);
  }

  return images;
}
