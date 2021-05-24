<script>
  const SLIDE_TIME = 200;

  import { getContext } from "svelte";
  import { fade, fly } from "svelte/transition";

  import { images, image } from "../stores";

  import * as R from "ramda";

  const { navigate } = getContext("navigator");
  const events = getContext("events");

  async function back() {
    navigate("Gallery");
  }

  const index = R.findIndex(R.equals($image))($images);
  const adjacentImages = R.without(
    [$image],
    R.slice(
      R.max(0, index - 3),
      R.min($images.length, index + 4),
      $images
    )
  );

  function lazy(ref) {
    ref.src = $image?.["file_url"];
  }
</script>

<nav class="px-6 pt-2 h-20 flex flex-row items-center">
  <button class="flex flex-row items-center" on:click={back}>
    <i class="ri-arrow-left-s-line text-4xl md:text-5xl" />
    <p class="text-4xl font-light md:text-5xl">image</p>
  </button>
  <div class="flex-1" />
</nav>

<main class="flex-1 mt-2 flex flex-row items-stretch">
  <div id="tags" in:fly={{ duration: SLIDE_TIME, x: -300 }} />
  <div class="flex-1 flex flex-col items-center">
    <img
      id="main-image"
      use:lazy
      width={$image?.["image_width"]}
      height={$image?.["image_height"]}
      src={$image?.["preview_file_url"]}
      in:fade
      alt="main"
    />
    <div
      id="adjacent-images"
      class="flex flex-row items-center justify-between space-x-4"
      in:fly={{ duration: SLIDE_TIME, y: 300 }}
    >
      {#each adjacentImages as adjacentImage}
        <img
          class="h-32 w-32 object-contain"
          src={adjacentImage?.["preview_file_url"]}
        />
      {/each}
    </div>
  </div>
</main>

<style>
  #tags {
    @apply self-stretch rounded-lg;

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

    background-color: rgba(0, 0, 0, 0.5);

    transform: translate(10px, 5px);
  }
</style>
