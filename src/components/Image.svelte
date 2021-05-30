<script context="module">
  import { Capacitor } from "@capacitor/core";
  import { Filesystem } from "@capacitor/filesystem";
  import { Http } from "@capacitor-community/http";

  const cached = {};

  async function loadAndCache(
    image,
    key = "file_url",
    prefix = ""
  ) {
    if (cached?.[prefix + image?.[key]])
      return cached?.[prefix + image?.[key]];

    const response = await Http.downloadFile({
      url: image?.[key],
      filePath: prefix + image?.["file_name"],
      fileDirectory: "CACHE",
      method: "GET",
    });

    let blob = null;

    if (response?.blob) blob = response.blob;

    if (response?.path) {
      const file = await Filesystem.getUri({
        path: response.path,
      });

      const path = Capacitor.convertFileSrc(file.uri);
      cached[prefix + image[key]] = path;
      return path;
    }

    if (!blob) return;
    return URL.createObjectURL(blob);
  }

  function loadThumbnail(image) {
    return loadAndCache(image, "thumbnail_url", "thumbnail_");
  }

  function loadFullImage(image) {
    return loadAndCache(image);
  }

  export function remote(ref, [image, full = false]) {
    if (image) {
      loadThumbnail(image).then((thumbnail) => {
        ref.src = thumbnail;

        if (!full) return;

        loadFullImage(image).then((original) => {
          ref.src = original;
        });
      });
    }

    return {
      update([image, full = false]) {
        if (image) {
          loadThumbnail(image).then((thumbnail) => {
            ref.src = thumbnail;

            if (!full) return;

            loadFullImage(image).then((original) => {
              ref.src = original;
            });
          });
        }
      },
    };
  }
</script>
