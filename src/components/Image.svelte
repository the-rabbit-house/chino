<script context="module">
  import { Capacitor } from "@capacitor/core";
  import { Filesystem } from "@capacitor/filesystem";
  import { Http } from "@capacitor-community/http";

  const cached = {};

  const current = { image: null };

  async function loadAndCache(image, key, prefix) {
    const response = await Http.downloadFile({
      url: image?.[key],
      filePath: prefix + image?.["file_name"],
      fileDirectory: "CACHE",
      method: "GET",
    });

    let url = null;

    if (response?.blob) {
      const blob = response.blob;
      url = URL.createObjectURL(blob);
    }

    if (response?.path) {
      const file = await Filesystem.getUri({
        path: response.path,
        directory: "CACHE",
      });

      url = Capacitor.convertFileSrc(file.uri);
    }

    if (!url) return null;

    cached[prefix + image[key]] = url;
    return url;
  }

  function loadThumbnail(image) {
    const prefix = "thumbnail_";
    const key = "thumbnail_url";

    if (cached?.[prefix + image?.[key]])
      return Promise.resolve(cached?.[prefix + image?.[key]]);

    return loadAndCache(image, key, prefix);
  }

  function loadFullImage(image) {
    const prefix = "";
    const key = "file_url";

    if (cached?.[prefix + image?.[key]])
      return Promise.resolve(cached?.[prefix + image?.[key]]);

    return loadAndCache(image, key, prefix);
  }

  export function remote(ref, [image, full = false]) {
    if (full) current.image = image;

    if (image) {
      loadThumbnail(image).then((thumbnail) => {
        ref.src = thumbnail;

        if (!full) return;

        loadFullImage(image).then((original) => {
          if (current.image !== image) return;

          ref.src = original;
        });
      });
    }

    return {
      update([image, full = false]) {
        if (full) current.image = image;

        if (image) {
          loadThumbnail(image).then((thumbnail) => {
            ref.src = thumbnail;

            if (!full) return;

            loadFullImage(image).then((original) => {
              if (current.image !== image) return;

              ref.src = original;
            });
          });
        }
      },
    };
  }
</script>
