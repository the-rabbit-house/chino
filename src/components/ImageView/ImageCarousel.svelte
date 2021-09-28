<script context="module">
  const DEFAULT_SOFT_SWIPE_DISTANCE = 120; // px
  const DEFAULT_HARD_SWIPE_DISTANCE = 450; // px

  const BOOKMARKS_REGION_WIDTH = 0.25; // 25% of screen width
  const BOOKMARKS_REGION_HEIGHT = 0.3; // 30% of screen height
  const BOOKMARKS_SWIPE_DISTANCE = 150; // px

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
  import {
    getContext,
    createEventDispatcher,
    onDestroy,
  } from "svelte";
  import { writable, get } from "svelte/store";
  import { tweened } from "svelte/motion";
  import { fly } from "svelte/transition";

  import { Http } from "@capacitor-community/http";
  import ZingTouch from "zingtouch";
  import * as R from "ramda";

  import { images } from "@Stores";
  import { SETTINGS } from "@Utils";

  import {
    getImage,
    getThumbnail,
    remote,
    cached as cachedImages,
  } from "@Components/Image.svelte";
  import ImageInfo from "@Components/ImageView/ImageInfo.svelte";
  import BookmarksMenu from "./BookmarksMenu.svelte";

  const dispatch = createEventDispatcher();

  export let image = null;

  const { width: windowWidth, height: windowHeight } =
    getContext("screen");

  var touchareaRef = null;

  const swipeDistance = SETTINGS.get("swipeDistance");

  $: softSwipeDistance = R.defaultTo(
    DEFAULT_SOFT_SWIPE_DISTANCE,
    nonZeroOrNull($windowWidth * $swipeDistance)
  );

  $: hardSwipeDistance = R.defaultTo(
    DEFAULT_HARD_SWIPE_DISTANCE,
    nonZeroOrNull($windowWidth * $swipeDistance * 3)
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
  var showBookmarks = false;

  const ignoreSwipe = writable(false);
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

  const scale = writable(1);

  const zoom_dx = writable(0);
  const zoom_dy = writable(0);

  $: bookmarksThreshold = [
    $windowWidth - $windowWidth * BOOKMARKS_REGION_WIDTH,
    $windowHeight * BOOKMARKS_REGION_HEIGHT,
  ];

  function handleSwipe() {
    if ($ignoreSwipe) {
      $ignoreSwipe = false;
      $delta = 0;
    }

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

    function handleBookmarksPan(event) {
      const angle = event.detail.data[0].directionFromOrigin;
      const distance = event.detail.data[0].distanceFromOrigin;
      const x = event.detail.events[0].x;
      const y = event.detail.events[0].y;

      const [minX, maxY] = bookmarksThreshold;
      if (x > minX && y < maxY) $ignoreSwipe = true;

      if (!isDirection.DOWN(angle)) return;
      if (distance > BOOKMARKS_SWIPE_DISTANCE && $ignoreSwipe)
        showBookmarks = true;
    }

    var radiusThreshold = 10;
    var zoomTimeout = null;

    var zoomStart = null;
    var deltaTimeout = null;

    function handleZoom(event) {
      if (image?.video) return;

      if (R.length(event.detail?.events) >= 2) {
        const distance1 =
          event.detail.data[0].distanceFromOrigin;
        const distance2 =
          event.detail.data[1].distanceFromOrigin;

        const direction1 =
          event.detail.data[0].directionFromOrigin;
        const direction2 =
          event.detail.data[1].directionFromOrigin;

        let directions = [direction1, direction2];

        const y1 = event.detail.events[0].clientY;
        const y2 = event.detail.events[1].clientY;

        if (y1 > y2) directions = [direction2, direction1];

        const distance = Math.max(distance1, distance2);
        if (distance > radiusThreshold) {
          if (
            isDirection.DOWN(directions[0]) &&
            isDirection.UP(directions[1])
          ) {
            $scale = Math.max(1, $scale - 0.05);
            if ($scale <= 1) {
              $zoom_dx = 0;
              $zoom_dy = 0;
            }
          } else $scale = Math.min(3, $scale + 0.05);

          radiusThreshold = distance;

          clearTimeout(zoomTimeout);
          zoomTimeout = setTimeout(() => {
            radiusThreshold = 10;
          }, 100);
        }
      } else {
        if ($scale <= 1) return;

        const distance = event.detail.data[0].distanceFromOrigin;
        const direction =
          event.detail.data[0].directionFromOrigin;

        if (!zoomStart) {
          zoomStart = distance;
          return;
        }

        if (isDirection.LEFT(direction))
          $zoom_dx = $zoom_dx + (zoomStart - distance);

        if (isDirection.RIGHT(direction))
          $zoom_dx = $zoom_dx - (zoomStart - distance);

        if (isDirection.UP(direction))
          $zoom_dy = $zoom_dy + (zoomStart - distance);

        if (isDirection.DOWN(direction))
          $zoom_dy = $zoom_dy - (zoomStart - distance);

        zoomStart = distance;

        clearTimeout(deltaTimeout);
        deltaTimeout = setTimeout(() => {
          zoomStart = null;
        }, 30);
      }
    }

    function handlePan(event) {
      showBookmarks = false;

      handleZoom(event);
      if ($scale > 1) return;

      handleBookmarksPan(event);
      if ($ignoreSwipe) return;

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
    region.bind(
      area,
      new ZingTouch.Pan({ numInputs: 2 }),
      handlePan
    );
    window.addEventListener("touchend", handleSwipe);
  }

  $: bindGestures(imageRef, touchareaRef, showInfo);

  var duration = 0;
  var elapsed = 0;
  function video(node) {
    node?.play();
  }

  function toggleVideo() {
    if (!image?.video) return;
    if (typeof imageRef.paused === "undefined") return;

    if (imageRef?.paused) imageRef?.play();
    else imageRef?.pause();
  }

  function skipForward() {
    if (!image?.video) return;

    imageRef?.pause();
    imageRef.currentTime = Math.min(
      imageRef?.currentTime + 5,
      duration
    );
    imageRef?.play();
  }

  function skipBackward() {
    if (!image?.video) return;

    imageRef?.pause();
    imageRef.currentTime = Math.max(
      imageRef?.currentTime - 5,
      0
    );
    imageRef?.play();
  }

  var showProgress = false;
  var progressTimeout = null;
  var progressImage = writable(null);
  var progress = 0;
  var progressMax = 0;

  function trackProgress(image) {
    showProgress = true;
    clearTimeout(progressTimeout);

    progress = 0;
    progressMax = 0;

    $progressImage = image;
  }

  const useSource = SETTINGS.get("useSourceQuality");
  const getTargetUrl = $useSource
    ? R.prop("file_url")
    : R.prop("sample_url");

  Http.addListener("progress", e => {
    if (e.url !== getTargetUrl($progressImage)) return;
    progress = Math.floor(e.bytes / 1024);
    progressMax = Math.floor(e.contentLength / 1024);

    clearTimeout(progressTimeout);
    progressTimeout = setTimeout(() => {
      showProgress = false;
    }, 2000);
  });

  $: image, trackProgress(image);

  onDestroy(() => {
    Http.removeAllListeners();
  });
</script>

<div
  use:bindRegion
  class="fixed top-0 left-0"
  in:fly={{ y: 1000 }}
>
  <div
    id="carousel"
    bind:this={touchareaRef}
    class="flex flex-row w-[300vw] bg-black"
    style="transform:translate({-$windowWidth + dx}px,{dy}px);"
  >
    <img
      use:invisible
      class="invisible"
      style="transform:translateX(-1px)"
      src={getThumbnail(previousImage)}
      alt="previous"
    />
    {#if image?.video}
      {#key image}
        {#if $cachedImages?.[image.id]}
          <div>
            <video
              bind:this={imageRef}
              use:video
              class="relative h-screen bg-black"
              width={$windowWidth}
              height={$windowHeight}
              loop
              bind:currentTime={elapsed}
              bind:duration
              on:click={e => imageRef.play()}
            >
              <track default kind="captions" />
              <source src={getImage(image)} />
            </video>
            <div
              id="video-buttons"
              class="fixed flex flex-row items-center pl-2 pr-4 z-10"
            >
              <button
                class="w-16 h-16 z-10"
                on:click={toggleVideo}
                on:touchend={toggleVideo}
              >
                <i class="ri-play-line text-5xl" />
              </button>

              <button
                class="w-16 h-16 z-10"
                on:click={skipForward}
                on:touchend={skipForward}
              >
                <i class="ri-skip-forward-line text-5xl" />
              </button>
              <button
                class="w-16 h-16 z-10"
                on:click={skipBackward}
                on:touchend={skipBackward}
              >
                <i class="ri-skip-back-line text-5xl" />
              </button>

              <div class="flex-1" />

              <p class="pb-2">
                {Math.floor(elapsed)} / {Math.floor(duration)}
              </p>
            </div>
          </div>
        {:else}
          <img
            bind:this={imageRef}
            use:remote={[image, true]}
            src={getThumbnail(image)}
            alt="current"
          />
        {/if}
      {/key}
    {:else}
      <div
        id="main-image"
        bind:this={imageRef}
        use:remote={[image, true]}
      >
        <img
          src={getThumbnail(image)}
          alt="current"
          class:hidden={$scale > 1}
        />
        <div
          style={`transform: scale(${$scale}) translate3d(${$zoom_dx}px, ${$zoom_dy}px, 0);`}
        />
        <p
          id="progress"
          class:hidden={!showProgress || progress == progressMax}
        >
          {progress}kB / {progressMax}kB
        </p>
      </div>
    {/if}
    <img
      use:invisible
      class="invisible"
      style="transform:translateX(1px)"
      src={getThumbnail(nextImage)}
      alt="next"
    />
  </div>
</div>

{#if showBookmarks}
  <div id="bookmarks-menu">
    <BookmarksMenu
      on:dismiss={() => {
        showBookmarks = false;
      }}
    />
  </div>
{/if}

<div
  id="info-container"
  style={!showInfo
    ? `transform:translateY(${$windowHeight + dy * 1.75}px`
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

  #main-image {
    @apply relative w-screen h-screen bg-black;
    @apply overflow-hidden;

    > div {
      @apply absolute top-0 left-0;
      @apply h-full w-full;

      background-image: var(--image);
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
    }
  }

  #carousel {
    will-change: transform;
  }

  #video-buttons {
    left: 0;
    bottom: 2rem;

    width: 100vw;

    transform: translateX(100vw);
  }

  #info-container {
    @apply fixed top-0 left-0 h-screen w-screen bg-black;
    will-change: transform;
  }

  #bookmarks-menu {
    @apply fixed top-0 left-0 z-10;
  }

  #progress {
    @apply absolute;

    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
