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
  import { getContext } from "svelte";
  import { fade } from "svelte/transition";

  import { SETTINGS } from "@Utils";
  import * as R from "ramda";

  const { isMobile } = getContext("screen");

  const limit = SETTINGS.get("limit");
  const throttle = SETTINGS.get("throttle");
  const galleryCols = SETTINGS.get("galleryCols");
  const galleryImageSize = SETTINGS.get("galleryImageSize");
  const swipeDistance = SETTINGS.get("swipeDistance");
  const nsfw = SETTINGS.get("nsfw");
</script>

<article
  class="flex flex-col items-stretch overflow-y-auto"
  in:fade={{ delay: IN_FADE_DELAY }}
  out:fade={{ delay: 0, duration: OUT_FADE_DURATION }}
>
  <section class="px-2 py-4">
    <p class="flex-1">Images <br />per page</p>
    <button
      class="w-14 md:w-16 mr-1"
      on:click={() => {
        if ($limit > 5) SETTINGS.set("limit", $limit - 5);
      }}
    >
      -
    </button>
    <button class="w-14 md:w-16 mr-1" disabled={true}>
      {$limit}
    </button>
    <button
      class="w-14 md:w-16"
      on:click={() => {
        if ($limit < 95) SETTINGS.set("limit", $limit + 5);
      }}
    >
      +
    </button>
  </section>

  <section class="px-2 py-4">
    <p class="flex-1">Load <br />limit</p>
    <button
      class="w-14 md:w-16 mr-1"
      on:click={() => {
        if ($throttle > 1)
          SETTINGS.set("throttle", $throttle - 1);
      }}
    >
      -
    </button>
    <button class="w-14 md:w-16 mr-1" disabled={true}>
      {$throttle}
    </button>
    <button
      class="w-14 md:w-16"
      on:click={() => {
        if ($throttle < 5)
          SETTINGS.set("throttle", $throttle + 1);
      }}
    >
      +
    </button>
  </section>

  <section class="relative px-2 py-4 pt-8">
    <sup> MOBILE ONLY </sup>
    <p class="flex-1">Grid<br /> columns</p>
    <button
      class="w-14 md:w-16 mr-1"
      on:click={() => {
        if ($galleryCols > 1)
          SETTINGS.set("galleryCols", R.dec($galleryCols));
      }}
    >
      -
    </button>
    <button class="w-14 md:w-16 mr-1" disabled={true}>
      {$galleryCols}
    </button>
    <button
      class="w-14 md:w-16"
      on:click={() => {
        if ($galleryCols < 5)
          SETTINGS.set("galleryCols", R.inc($galleryCols));
      }}
    >
      +
    </button>
  </section>

  <section class="relative px-2 py-4 pt-8">
    <sup> MOBILE ONLY </sup>
    <p class="flex-1 text-wrap">Swipe <br />distance</p>
    <button
      class="mr-1"
      use:active={$swipeDistance === 0.161}
      on:click={() => SETTINGS.set("swipeDistance", 0.161)}
    >
      16.1%
    </button>

    <button
      class="mr-1"
      use:active={$swipeDistance === 0.2}
      on:click={() => SETTINGS.set("swipeDistance", 0.2)}
    >
      20%
    </button>
    <button
      use:active={$swipeDistance === 0.25}
      on:click={() => SETTINGS.set("swipeDistance", 0.25)}
    >
      25%
    </button>
  </section>

  <section class="relative px-2 py-4 pt-8">
    <sup> TABLET+ ONLY </sup>
    <p class="flex-1 text-wrap">Image <br /> size</p>
    <button
      class="mr-1"
      use:active={$galleryImageSize === "SMALL"}
      on:click={() => SETTINGS.set("galleryImageSize", "SMALL")}
    >
      {$isMobile ? "SM" : "SMALL"}
    </button>

    <button
      class="mr-1"
      use:active={$galleryImageSize === "BASE"}
      on:click={() => SETTINGS.set("galleryImageSize", "BASE")}
    >
      BASE
    </button>
    <button
      use:active={$galleryImageSize === "LARGE"}
      on:click={() => SETTINGS.set("galleryImageSize", "LARGE")}
    >
      {$isMobile ? "LG" : "LARGE"}
    </button>
  </section>

  <section class="px-2 py-4">
    <p class="flex-1">NSFW<br /> mode</p>

    <button
      use:active={$nsfw === false}
      on:click={() => SETTINGS.set("nsfw", false)}
      style="flex-basis: 6rem"
    >
      OFF
    </button>
    <button
      use:active={$nsfw === true}
      on:click={() => SETTINGS.set("nsfw", true)}
      class="ml-1"
      style="flex-basis: 6rem"
    >
      ON
    </button>
  </section>
</article>

<style lang="scss">
  article {
    @apply w-screen h-full px-2 pb-4 space-y-2;
  }

  section {
    @apply flex flex-row items-center rounded;
    @apply text-xl md:text-2xl;
    background-color: rgba(0, 0, 0, 0.5);

    & > sup {
      @apply absolute top-0 left-0 pl-2 pt-1 text-base;
    }
  }

  button {
    @apply py-4 px-4 rounded;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
