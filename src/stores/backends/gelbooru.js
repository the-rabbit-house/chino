import { Http } from "@capacitor-community/http";

import * as R from "ramda";
import { timeout } from "@Utils";

export const NAME = "gelbooru";
export const PLATFORMS = ["native"];

const ROOT_URL = "https://gelbooru.com/index.php";

export async function fetchImages(tags, { page, limit }) {
  try {
    const response = await Http.request({
      method: "GET",
      url: ROOT_URL,
      params: {
        page: "dapi",
        s: "post",
        q: "index",
        json: 1,
        tags: tags.join("+"),
        limit,
      },
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
  const parseTagsResponse = R.pluck("tag");

  try {
    const response = await Http.request({
      method: "GET",
      url: ROOT_URL,
      params: {
        page: "dapi",
        s: "tag",
        q: "index",
        json: 1,
        name_pattern: tag + "%",
      },
      connectTimeout: 8000,
      webFetchExtra: {
        signal: timeout(),
      },
    });

    return [true, parseTagsResponse(response.data)];
  } catch (e) {
    return [false, []];
  }
}

const isVideo = R.anyPass([
  R.equals("zip"),
  R.equals("webm"),
  R.equals("mp4"),
]);

function parseImagesResponse(data) {
  const images = [];

  const baseUrl = "https://img3.gelbooru.com";

  for (const post of data) {
    if (!post?.["file_url"]) continue;

    const file_ext = R.last(post?.["file_url"].split("."));

    const image = {
      id: post?.["hash"],
      file_name: post?.["image"],
      source: post?.["source"],
      artist: post?.["owner"],
      file_ext,
      video: isVideo(file_ext),
      thumbnail_url: `${baseUrl}/thumbnails/${post?.["directory"]}/thumbnail_${post?.["hash"]}.jpg`,
      file_url: post?.["file_url"],
      sample_url: `${baseUrl}//samples/${post?.["directory"]}/sample_${post?.["hash"]}.jpg`,
      width: post?.["width"],
      height: post?.["height"],
      tags: post?.["tags"].split(" "),
      data: post,
    };

    images.push(image);
  }

  return images;
}
