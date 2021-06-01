<script context="module">
  const isDirection = {
    DOWN: (angle) => angle > 200 && angle < 315,
    LEFT: (angle) => angle > 120 && angle < 200,
    RIGHT: (angle) =>
      (angle > 0 && angle < 60) || (angle > 315 && angle <= 360),
    UP: (angle) => angle > 60 && angle < 120,
  };

  function invisible(ref) {
    setTimeout(() => {
      ref.classList.remove("invisible");
    }, 300);
  }
</script>

<script>
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";
  import { tweened } from "svelte/motion";

  import * as R from "ramda";
  import ZingTouch from "zingtouch";

  import { images } from "@Stores";

  import { remote } from "@Components/Image.svelte";
  import ImageInfo from "@Components/ImageView/ImageInfo.svelte";

  const dispatch = createEventDispatcher();

  export let image = null;
  export let handles;

  const [send, receive] = handles; // crossfade handles

  var innerHeight = 0;

  var touchareaRef = null;

  var imageRef = null;
  var previousImage = null;
  var nextImage = null;

  $: {
    const index = R.findIndex(R.equals(image))($images);

    previousImage = $images[R.max(index - 1, 0)];
    nextImage = $images[R.min(index + 1, R.length($images))];
  }

  var showInfo = false;

  const direction = writable(null);
  const delta = tweened(0, { duration: 50 });

  $: dx =
    $direction === "RIGHT"
      ? $delta
      : $direction === "LEFT"
      ? -$delta
      : 0;
  $: dy =
    $direction === "DOWN"
      ? $delta
      : $direction === "UP"
      ? -$delta
      : 0;

  function handleSwipe() {
    if ($delta > 150) {
      if ($direction === "DOWN") $delta = 0;
      if ($direction === "UP") {
        $delta = 0;
        showInfo = true;
      }
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

  function bindGestures(child, area) {
    if (!region || !child) return;

    region.bind(area, "pan", function (event) {
      const angle = event.detail.data[0].directionFromOrigin;
      const distance = event.detail.data[0].distanceFromOrigin;

      let nextDirection = null;

      if (isDirection.DOWN(angle)) nextDirection = "DOWN";
      else if (isDirection.LEFT(angle)) nextDirection = "LEFT";
      else if (isDirection.RIGHT(angle)) nextDirection = "RIGHT";
      else if (isDirection.UP(angle)) nextDirection = "UP";

      if (nextDirection !== $direction) {
        $direction = nextDirection;
        $delta = 0;
      } else $delta = distance;

      if (distance > 500) handleSwipe();
    });

    window.addEventListener("touchend", handleSwipe);
  }

  $: bindGestures(imageRef, touchareaRef);
</script>

<svelte:window bind:innerHeight />

<div
  class="fixed top-0 left-0"
  use:bindRegion
  bind:this={touchareaRef}
  in:send={{ key: image?.["id"] }}
  out:receive={{ key: image?.["id"] }}
>
  <div
    class="flex flex-row h-screen"
    style="width:300vw;transform:translate({-window.innerWidth +
      dx}px,{dy}px)"
  >
    <img
      use:invisible
      class="invisible"
      src={previousImage?.["thumbnail_url"]}
      alt="previous"
    />
    <img
      bind:this={imageRef}
      use:remote={[image, true]}
      src={image?.["thumbnail_url"]}
      alt="current"
    />
    <img
      use:invisible
      class="invisible"
      src={nextImage?.["thumbnail_url"]}
      alt="next"
    />
  </div>
</div>

<div
  id="info-container"
  style={!showInfo
    ? `transform:translateY(${innerHeight + dy * 2}px`
    : ""}
>
  <ImageInfo
    closable={true}
    on:close={() => {
      showInfo = false;
    }}
  />
</div>

<style lang="scss">
  img {
    @apply w-screen h-screen object-contain bg-black;
  }

  #info-container {
    @apply absolute top-0 left-0 h-screen w-screen bg-black;
  }
</style>
