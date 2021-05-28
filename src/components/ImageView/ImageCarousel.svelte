<script context="module">
  const isDirection = {
    DOWN: (angle) => angle > 200 && angle < 315,
    LEFT: (angle) => angle > 90 && angle < 200,
    RIGHT: (angle) =>
      (angle > 0 && angle < 90) || (angle > 315 && angle <= 360),
  };

  function invisible(ref) {
    setTimeout(() => {
      ref.classList.remove("invisible");
    }, 300);
  }

  function lazy(ref, image) {
    ref.src = image?.["file_url"];

    return {
      update(image) {
        ref.src = image?.["file_url"];
      },
    };
  }
</script>

<script>
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";
  import { tweened } from "svelte/motion";

  import * as R from "ramda";
  import ZingTouch from "zingtouch";

  import { images } from "@Stores";

  const dispatch = createEventDispatcher();

  export let image = null;
  export let handles;

  const [send, receive] = handles; // crossfade handles

  var imageRef = null;
  var previousImage = null;
  var nextImage = null;

  $: {
    const index = R.findIndex(R.equals(image))($images);

    previousImage = $images[R.max(index - 1, 0)];
    nextImage = $images[R.min(index + 1, R.length($images))];
  }

  const direction = writable(null);
  const delta = tweened(0, { duration: 50 });

  $: dx =
    $direction === "RIGHT"
      ? $delta
      : $direction === "LEFT"
      ? -$delta
      : 0;
  $: dy = $direction === "DOWN" ? $delta : 0;

  function handleSwipe() {
    if ($delta > 60) {
      if ($direction === "DOWN") $delta = 0;
      if ($direction === "LEFT")
        dispatch("imagechange", nextImage);
      if ($direction === "RIGHT")
        dispatch("imagechange", previousImage);

      dispatch("swipe", $direction);
    }

    $direction = null;
    $delta = 0;
  }

  var region = null;

  function bindRegion(ref) {
    if (!ref || region) return;

    region = ZingTouch.Region(ref);

    return {
      destroy() {
        region.unbind(imageRef, "swipe");
        region.unbind(imageRef, "pan");
        window.removeEventListener("touchend", handleSwipe);

        region = null;
      },
    };
  }

  function bindGestures(child) {
    if (!region || !child) return;

    region.bind(imageRef, "pan", function (event) {
      const angle = event.detail.data[0].directionFromOrigin;
      const distance = event.detail.data[0].distanceFromOrigin;

      let nextDirection = null;

      if (isDirection.DOWN(angle)) nextDirection = "DOWN";
      else if (isDirection.LEFT(angle)) nextDirection = "LEFT";
      else if (isDirection.RIGHT(angle)) nextDirection = "RIGHT";

      if (nextDirection !== $direction) {
        $direction = nextDirection;
        $delta = 0;
      } else $delta = distance;
    });

    window.addEventListener("touchend", handleSwipe);
  }

  $: bindGestures(imageRef);
</script>

<div
  class="fixed top-0 left-0"
  use:bindRegion
  in:send={{ key: image?.["id"] }}
  out:receive={{ key: image?.["id"] }}
>
  <div class="relative flex flex-row w-screen h-screen">
    <img
      class="absolute w-screen h-screen object-contain bg-black"
      use:invisible
      src={previousImage?.["preview_file_url"]}
      style="transform:translate({-window.innerWidth +
        dx}px,{dy}px)"
      alt="previous"
    />
    <img
      bind:this={imageRef}
      use:lazy={image}
      class="absolute w-screen h-screen object-contain bg-black"
      src={image?.["preview_file_url"]}
      style="transform:translate({dx}px,{dy}px)"
      alt="current"
    />
    <img
      class="absolute w-screen h-screen object-contain bg-black"
      use:invisible
      src={nextImage?.["preview_file_url"]}
      style="transform:translate({window.innerWidth +
        dx}px,{dy}px)"
      alt="next"
    />
  </div>
</div>
