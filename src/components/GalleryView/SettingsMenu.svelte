<script context="module">
  export const IN_FADE_DELAY = 200;
  export const OUT_FADE_DURATION = 100;

  function active(ref, test) {
    ref.classList.toggle("active-button", test);

    return {
      update(test) {
        ref.classList.toggle("active-button", test);
      },
    };
  }
</script>

<script>
  import { fade } from "svelte/transition";

  import { settings } from "@Stores";

  import * as R from "ramda";

  var innerHeight;
  var innerWidth;
  $: isMobile = innerWidth <= 768;

  $: galleryCols = $settings?.galleryCols;
  $: galleryImageSize = $settings?.galleryImageSize;
  $: swipeDistance = $settings?.swipeDistance;
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<main
  class="flex flex-col items-stretch"
  in:fade={{ delay: IN_FADE_DELAY }}
  out:fade={{ delay: 0, duration: OUT_FADE_DURATION }}
>
  <section
    class="relative flex flex-row items-center text-xl md:text-2xl"
  >
    <p class="absolute top-0 left-0 pl-2 pt-1 text-base">
      MOBILE ONLY
    </p>
    <p class="flex-1">Grid<br /> columns</p>
    <button
      class="w-14 md:w-16 mr-1"
      on:click={() => {
        if (galleryCols > 1)
          $settings.galleryCols = R.dec(galleryCols);
      }}
    >
      -
    </button>
    <button class="w-14 md:w-16 mr-1" disabled={true}>
      {galleryCols}
    </button>
    <button
      class="w-14 md:w-16"
      on:click={() => {
        if (galleryCols < 5)
          $settings.galleryCols = R.inc(galleryCols);
      }}
    >
      +
    </button>
  </section>

  <section
    class="relative flex flex-row items-center text-xl md:text-2xl"
  >
    <p class="absolute top-0 left-0 pl-2 pt-1 text-base">
      MOBILE ONLY
    </p>
    <p class="flex-1 text-wrap">Swipe <br />distance</p>
    <button
      class="mr-1"
      use:active={swipeDistance === 0.2}
      on:click={() => {
        $settings.swipeDistance = 0.2;
      }}
    >
      20%
    </button>

    <button
      class="mr-1"
      use:active={swipeDistance === 0.25}
      on:click={() => {
        $settings.swipeDistance = 0.25;
      }}
    >
      25%
    </button>
    <button
      use:active={swipeDistance === 0.35}
      on:click={() => {
        $settings.swipeDistance = 0.35;
      }}
    >
      35%
    </button>
  </section>

  <section
    class="relative flex flex-row items-center text-xl md:text-2xl"
  >
    <p class="absolute top-0 left-0 pl-2 pt-1 text-base">
      TABLET+ ONLY
    </p>
    <p class="flex-1 text-wrap">Image size</p>
    <button
      class="mr-1"
      use:active={galleryImageSize === "SMALL"}
      on:click={() => {
        $settings.galleryImageSize = "SMALL";
      }}
    >
      {isMobile ? "SM" : "SMALL"}
    </button>

    <button
      class="mr-1"
      use:active={galleryImageSize === "BASE"}
      on:click={() => {
        $settings.galleryImageSize = "BASE";
      }}
    >
      BASE
    </button>
    <button
      use:active={galleryImageSize === "LARGE"}
      on:click={() => {
        $settings.galleryImageSize = "LARGE";
      }}
    >
      {isMobile ? "LG" : "LARGE"}
    </button>
  </section>
</main>

<style lang="scss">
  main {
    @apply w-screen h-full px-2 pb-4 space-y-2;
  }

  section {
    @apply pt-8 pb-4 px-2 rounded;
    background-color: rgba(0, 0, 0, 0.5);
  }

  button {
    @apply py-4 px-4 rounded;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
