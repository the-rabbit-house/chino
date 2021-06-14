<script context="module">
  const QUEUE_FLY_TIME = 200;

  const INFO_DELAY_TIME = 300;
  const INFO_FLY_TIME = 200;
</script>

<script>
  import { getContext } from "svelte";
  import { fade, fly, scale } from "svelte/transition";

  import * as R from "ramda";

  import { images, image, favorites } from "@Stores";
  import { toggleImage as toggleFavorite } from "@Stores/favorites";

  import { remote } from "@Components/Image.svelte";

  import ImagesQueue from "@Components/ImageView/ImagesQueue.svelte";
  import ImageInfo from "@Components/ImageView/ImageInfo.svelte";

  const { images: favoriteImages } = favorites;

  const { navigate } = getContext("navigator");
  const events = getContext("events");

  async function back() {
    showInfo = false;
    showAdjacentImages = false;

    setTimeout(() => navigate("Gallery"), QUEUE_FLY_TIME);
  }

  var innerWidth;
  var innerHeight;
  $: if (innerWidth < 768) back();

  var showAdjacentImages = true;
  var showInfo = false;

  $: isInFavorites =
    typeof R.find(R.propEq("id", $image.id), $favoriteImages) !==
    "undefined";

  $: index = R.findIndex(R.equals($image))($images);

  function nextImage() {
    $image = $images[R.min(index + 1, $images.length - 1)];
  }

  function previousImage() {
    $image = $images[R.max(index - 1, 0)];
  }

  function handleShortcuts(event) {
    const key = event.key;

    if (key === "Escape") back();

    if (key === "ArrowLeft" || key === "j") previousImage();
    if (key === "ArrowRight" || key === "k") nextImage();

    // Spacebar
    if (key === " ") nextImage();
  }
</script>

<svelte:window
  bind:innerWidth
  bind:innerHeight
  on:keyup={handleShortcuts}
/>

<nav class="px-6 pt-2 h-20 flex flex-row items-center">
  <button class="flex flex-row items-center" on:click={back}>
    <i class="ri-arrow-left-s-line text-4xl md:text-5xl" />
    <p class="text-4xl font-light md:text-5xl">image</p>
  </button>
  <div class="flex-1" />
  <button id="previous-image-button" on:click={previousImage}>
    <i class="ri-arrow-left-s-line text-4xl md:text-5xl" />
  </button>
  <button id="next-image-button" on:click={nextImage}>
    <i class="ri-arrow-right-s-line text-4xl md:text-5xl" />
  </button>
  <p id="index-indicator" class="ml-4 text-3xl text-center">
    {index + 1} / {$images.length}
  </p>
</nav>

<main class="flex flex-col lg:flex-row px-4 overflow-hidden">
  <img
    id="main-image"
    style={showInfo ? "filter: blur(12px)" : ""}
    use:remote={[$image, true]}
    width={$image?.["width"]}
    height={$image?.["height"]}
    src={$image?.["thumbnail_url"]}
    in:fade
    alt="main"
  />

  {#if showAdjacentImages && !showInfo}
    <div
      id="images-queue"
      transition:fly={{
        delay: 0,
        duration: QUEUE_FLY_TIME,
        y: 300,
      }}
    >
      <ImagesQueue
        on:imagechange={event => {
          $image = event.detail;
        }}
      />
    </div>
  {/if}

  {#if showInfo}
    <div
      id="image-info"
      in:fly={{
        delay: INFO_DELAY_TIME,
        duration: INFO_FLY_TIME,
        y: 1000,
      }}
      out:fly={{ delay: 0, duration: INFO_FLY_TIME, y: 1000 }}
    >
      <ImageInfo />
    </div>
  {/if}

  <button
    id="favorite-button"
    class="absolute bottom-0 left-0 ml-6 mb-6 py-6 px-8 rounded-3xl"
    on:click={() => toggleFavorite($image)}
  >
    {#if isInFavorites}
      <i class="ri-star-line text-3xl text-yellow-300" />
    {:else}
      <i class="ri-star-line text-3xl" />
    {/if}
  </button>

  <button
    id="info-button"
    class="absolute bottom-0 right-0 mr-6 mb-6 py-6 px-8 rounded-3xl"
    on:click={() => {
      showInfo = !showInfo;
    }}
  >
    {#if showInfo}
      <i class="ri-close-line text-3xl" />
    {:else}
      <i class="ri-information-line text-3xl" />
    {/if}
  </button>
</main>

<style lang="scss">
  main {
    @apply flex-1;
    height: calc(100vh - 6rem);

    @apply flex-1 justify-center;
    @screen md {
      @apply items-center;
    }
  }

  #index-indicator {
    flex-basis: 7.5rem;
  }

  #main-image {
    @apply flex-1;

    object-fit: contain;

    min-width: 0;

    transition: filter 1s;

    @screen md {
      max-height: calc(100vh - 18rem);
    }

    @screen lg {
      max-height: calc(100vh - 8rem);
    }
  }

  #images-queue {
    @apply self-center;

    @screen lg {
      @apply self-start;
    }
  }

  #favorite-button,
  #info-button {
    background-color: rgba(0, 0, 0, 0.5);
  }

  #image-info {
    @apply fixed left-0;

    top: 6rem;
    height: 100vh;
  }
</style>
