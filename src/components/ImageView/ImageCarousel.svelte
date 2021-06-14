<script context="module">
  const DEFAULT_SOFT_SWIPE_DISTANCE = 120;
  const DEFAULT_HARD_SWIPE_DISTANCE = 450;

  const nonZeroOrNull = R.when(R.equals(0), () => null);

  const isDirection = {
    DOWN: angle => angle > 200 && angle < 315,
    LEFT: angle => angle > 120 && angle < 200,
    RIGHT: angle =>
      (angle > 0 && angle < 60) || (angle > 315 && angle <= 360),
    UP: angle => angle > 60 && angle < 120,
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
  import { fly } from "svelte/transition";

  import * as R from "ramda";
  import ZingTouch from "zingtouch";

  import { images } from "@Stores";
  import { SETTINGS } from "@Utils";

  import { getImage, remote } from "@Components/Image.svelte";
  import ImageInfo from "@Components/ImageView/ImageInfo.svelte";

  const dispatch = createEventDispatcher();

  export let image = null;

  var innerHeight = 0;
  var innerWidth = 0;

  var touchareaRef = null;

  const swipeDistance = SETTINGS.get("swipeDistance");

  $: softSwipeDistance = R.defaultTo(
    DEFAULT_SOFT_SWIPE_DISTANCE,
    nonZeroOrNull(innerWidth * $swipeDistance)
  );

  $: hardSwipeDistance = R.defaultTo(
    DEFAULT_HARD_SWIPE_DISTANCE,
    nonZeroOrNull(innerWidth * $swipeDistance * 3)
  );

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
    if ($delta > softSwipeDistance) {
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
        region.unbind(touchareaRef, "pan");
        window.removeEventListener("touchend", handleSwipe);

        region = null;
      },
    };
  }

  function bindGestures(child, area, disabled) {
    if (!region || !child) return;

    if (disabled) {
      region.unbind(area, "pan");
      return;
    }

    function handlePan(event) {
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

      if (distance > hardSwipeDistance) handleSwipe();
    }

    region.bind(area, "pan", handlePan);
    window.addEventListener("touchend", handleSwipe);
  }

  $: bindGestures(imageRef, touchareaRef, showInfo);
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<div
  class="fixed top-0 left-0"
  use:bindRegion
  in:fly={{ y: 1000 }}
>
  <div
    bind:this={touchareaRef}
    class="flex flex-row"
    style="width:300vw;transform:translate({-innerWidth +
      dx}px,{dy}px);will-change:transform"
  >
    <img
      use:invisible
      class="invisible"
      alt="previous"
      src={getImage(previousImage)}
    />
    <img
      bind:this={imageRef}
      use:remote={[image, true]}
      src={getImage(image)}
      alt="current"
    />
    <img
      use:invisible
      class="invisible"
      src={getImage(nextImage)}
      alt="next"
    />
  </div>
</div>

<div
  id="info-container"
  style={!showInfo
    ? `transform:translateY(${innerHeight + dy * 1.75}px`
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
    @apply fixed top-0 left-0 h-screen w-screen bg-black;
    will-change: transform;
  }
</style>
