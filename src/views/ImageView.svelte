<script>
  const SLIDE_TIME = 200;

  import { getContext } from "svelte";
  import { writable } from "svelte/store";
  import { fade, fly } from "svelte/transition";

  import { images, image } from "../stores";

  import * as R from "ramda";
  import SimpleBar from "simplebar";

  const { navigate } = getContext("navigator");
  const events = getContext("events");

  async function back() {
    navigate("Gallery");
  }

  const tags = writable([]);
  $: $tags = $image?.["tag_string"]?.split(" ") || [];

  var innerWidth;
  $: if (innerWidth < 768) back();

  // Queue
  var showQueue = false;

  $: index = R.findIndex(R.equals($image))($images);
  $: indexMax = R.min($images.length, index + 7);
  $: indexMin = R.max(
    0,
    index - ($images.length - index <= 2 ? 4 : 2)
  );

  $: adjacentImages = R.slice(indexMin, indexMax, $images);

  function nextImage() {
    $image = $images[R.min(index + 1, $images.length - 1)];
  }

  function previousImage() {
    $image = $images[R.max(index - 1, 0)];
  }

  var scrollbar;
  function customScrollbar(ref, tags) {
    scrollbar = new SimpleBar(ref);

    return {
      update(tags) {
        scrollbar.recalculate();
        // scrollbar = new SimpleBar(ref);
      },
    };
  }

  function lazy(ref, img) {
    ref.src = img?.["file_url"];
    return {
      update(img) {
        ref.src = img?.["file_url"];
      },
    };
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

<svelte:window bind:innerWidth on:keyup={handleShortcuts} />

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
  <p class="ml-4 text-3xl">{index + 1} / {$images.length}</p>
</nav>

<main
  class="flex-1 mt-2 flex flex-col md:flex-row items-stretch overflow-hidden"
>
  <div
    id="tags"
    class="relative pl-4 pt-8 pb-2 overflow-y-auto overflow-x-hidden"
    in:fly={{ duration: SLIDE_TIME, x: -300 }}
    use:customScrollbar={$tags}
  >
    <p class="fixed top-0 right-0 pr-2">Tags</p>
    {#each $tags as tag}
      <div>{tag}</div>
    {/each}
  </div>
  <div class="flex-1 pr-2 flex flex-col items-center">
    <img
      id="main-image"
      use:lazy={$image}
      class="py-2"
      width={$image?.["image_width"]}
      height={$image?.["image_height"]}
      src={$image?.["preview_file_url"]}
      in:fade
      alt="main"
    />
    {#if showQueue}
      <div
        id="adjacent-images"
        class="relative flex flex-row items-center justify-between space-x-4"
        in:fly={{ duration: SLIDE_TIME, y: 300 }}
      >
        <div
          class="absolute top-0 left-0 text-sm transform translate-y-1 translate-x-2"
        >
          Queue
        </div>
        {#each adjacentImages as adjacentImage}
          <img
            class="h-32 w-32 p-1 object-contain"
            src={adjacentImage?.["preview_file_url"]}
            style={adjacentImage === $image
              ? "background-color: lightblue"
              : ""}
            alt="adjacent"
          />
        {/each}
      </div>
    {/if}
  </div>
</main>

<style>
  #tags {
    @apply self-stretch rounded-lg;

    max-height: calc(100vh - 6rem);
    width: 25vw;

    background-color: rgba(0, 0, 0, 0.5);
    transform: translate(-10px, 5px);
  }

  main {
    height: calc(100vh - 6rem);
  }

  #main-image {
    @apply flex-1;

    height: calc(100vh - 20rem);

    object-fit: contain;
  }

  #adjacent-images {
    @apply self-end;
    @apply p-6;
    @apply rounded-lg;

    max-width: 60vw;

    background-color: rgba(0, 0, 0, 0.5);

    transform: translate(10px, 5px);
  }
</style>
