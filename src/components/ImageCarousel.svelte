<script>
  const IsDirection = {
    DOWN: (angle) => angle > 200 && angle < 315,
    LEFT: (angle) => angle > 90 && angle < 200,
    RIGHT: (angle) =>
      (angle > 0 && angle < 90) || (angle > 315 && angle <= 360),
  };

  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";
  import { tweened } from "svelte/motion";

  import * as R from "ramda";
  import ZingTouch from "zingtouch";

  import { images } from "../stores";

  const dispatch = createEventDispatcher();

  export let image = null;
  export let handles;

  const [send, receive] = handles; // crossfade handles

  var previousImage = null;
  var nextImage = null;

  function handleImageChange(image) {
    const index = R.findIndex(R.equals(image))($images);

    previousImage = $images[R.max(index - 1, 0)];
    nextImage = $images[R.min(index + 1, R.length($images))];
  }

  $: handleImageChange(image);

  var imageRef = null;

  var region = null;
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

  $: bindGestures(imageRef);
  function bindGestures(child) {
    if (!region || !child) return;

    region.bind(imageRef, "pan", function (event) {
      const angle = event.detail.data[0].directionFromOrigin;
      const distance = event.detail.data[0].distanceFromOrigin;

      let nextDirection = null;

      if (IsDirection.DOWN(angle)) nextDirection = "DOWN";
      else if (IsDirection.LEFT(angle)) nextDirection = "LEFT";
      else if (IsDirection.RIGHT(angle)) nextDirection = "RIGHT";

      if (nextDirection !== $direction) {
        $direction = nextDirection;
        $delta = 0;
      } else $delta = distance;
    });

    window.addEventListener("touchend", handleSwipe);
  }

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
    />
    <img
      bind:this={imageRef}
      use:lazy={image}
      class="absolute w-screen h-screen object-contain bg-black"
      src={image?.["preview_file_url"]}
      style="transform:translate({dx}px,{dy}px)"
    />
    <img
      class="absolute w-screen h-screen object-contain bg-black"
      use:invisible
      src={nextImage?.["preview_file_url"]}
      style="transform:translate({window.innerWidth +
        dx}px,{dy}px)"
    />
  </div>
</div>
