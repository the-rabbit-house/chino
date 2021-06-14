<script context="module">
  import { writable, derived, get } from "svelte/store";
  import { Capacitor } from "@capacitor/core";
  import { Filesystem } from "@capacitor/filesystem";
  import { Http } from "@capacitor-community/http";

  import { settings } from "@Stores";

  import * as R from "ramda";

  const ORIGINAL_KEY = "file_url";

  const THUMBNAIL_PREFIX = "thumbnail_";
  const THUMBNAIL_KEY = "thumbnail_url";

  // transparent 1x1 .png image
  const PLACEHOLDER_IMAGE = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`;

  export const cached = {};

  export function getImage(image) {
    if (cached?.[image?.id]) return cached[image.id];

    if (cached?.[THUMBNAIL_PREFIX + image?.id])
      return cached[THUMBNAIL_PREFIX + image.id];

    return PLACEHOLDER_IMAGE;
  }

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
      });

      url = Capacitor.convertFileSrc(file.uri);
    }

    if (!url) return null;

    cached[prefix + image?.["id"]] = url;
    return url;
  }

  const current = { image: null };

  // Priorty queues
  const queue1 = writable([]);
  const queue2 = writable([]);

  function removeFromQueue(item) {
    queue1.set(R.without([item], get(queue1)));
    queue2.set(R.without([item], get(queue2)));
  }

  const queue = derived(
    [queue1, queue2],
    ([$queue1, $queue2]) => [...$queue1, ...$queue2]
  );

  const processing = writable([]);

  function processQueue() {
    const throttle = R.defaultTo(1, get(settings)?.throttle);
    if (get(processing).length >= throttle) return;
    if (get(queue).length < 1) return;

    const [first, ...rest] = get(queue);

    const [image, ref, thumbnail = false] = first;

    const found = R.find(
      R.equals([image, thumbnail]),
      get(processing)
    );

    if (typeof found !== "undefined") {
      removeFromQueue(first);
      return;
    }

    function updateImage() {
      if (!thumbnail && current.image !== image) return;
      if (document.body.contains(ref)) ref.src = getImage(image);
    }

    const key = thumbnail ? THUMBNAIL_KEY : ORIGINAL_KEY;
    const prefix = thumbnail ? THUMBNAIL_PREFIX : "";

    if (!cached?.[prefix + image?.id]) {
      const pair = [image, thumbnail];
      processing.set(R.append(pair, get(processing)));

      loadAndCache(image, key, prefix).then(url => {
        updateImage();

        processing.set(R.without([pair], get(processing)));
      });
    }

    removeFromQueue(first);
  }

  queue.subscribe(processQueue);
  processing.subscribe(processQueue);

  export function remote(ref, [image, full = false]) {
    if (full) current.image = image;
    ref.src = getImage(image);

    queue1.set([...get(queue1), [image, ref, true]]);
    if (full) queue2.set([[image, ref, false], ...get(queue2)]);

    return {
      update([image, full = false]) {
        if (full) current.image = image;
        ref.src = getImage(image);

        queue1.set([...get(queue1), [image, ref, true]]);
        if (full)
          queue2.set([[image, ref, false], ...get(queue2)]);
      },
    };
  }
</script>
