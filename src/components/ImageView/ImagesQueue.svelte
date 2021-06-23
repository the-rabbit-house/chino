<script context="module">
  function active(ref, test) {
    ref.classList.toggle("active-queue-image", test);

    return {
      update(test) {
        ref.classList.toggle("active-queue-image", test);
      },
    };
  }
</script>

<script>
  import { getContext, createEventDispatcher } from "svelte";
  import { images, image } from "@Stores";

  import {
    remote,
    getThumbnail,
  } from "@Components/Image.svelte";

  import * as R from "ramda";

  const dispatch = createEventDispatcher();

  var adjacentImages = [];

  const { width: innerWidth, height: innerHeight } =
    getContext("window");
  $: visibleAdjacentImages = $innerHeight < 1050 ? 4 : 5;

  $: {
    const index = R.findIndex(R.equals($image))($images);
    let round = 1;

    let min = 0;
    let max = 0;

    while (
      round < $images.length &&
      min + max < visibleAdjacentImages
    ) {
      if (R.defaultTo(null, $images?.[index + round])) ++max;
      if (min + max === visibleAdjacentImages) break;

      if (R.defaultTo(null, $images?.[index - round])) ++min;

      ++round;
    }

    if (max <= 2) {
      --min;
      ++max;
    }

    const indexMin = R.max(0, index - min);
    const indexMax = R.min($images.length, index + max);
    adjacentImages = R.slice(indexMin, indexMax, $images);
  }
</script>

<div id="images" class="flex flex-row lg:flex-col rounded-lg">
  {#each adjacentImages as adjacentImage}
    <img
      class="object-contain transform hover:scale-110"
      use:remote={[adjacentImage]}
      use:active={adjacentImage === $image}
      src={getThumbnail(adjacentImage)}
      on:click={() => dispatch("imagechange", adjacentImage)}
      alt="adjacent"
    />
  {/each}
</div>

<style lang="scss">
  #images {
    background-color: rgba(0, 0, 0, 0.5) !important;

    img {
      @apply h-40 p-1 w-full;
    }

    @screen md {
      @apply px-6 py-2;

      & > img {
        @apply w-24;
      }

      transform: translateY(2.5rem);
    }

    @screen lg {
      @apply w-48 p-6;

      & > img {
        @apply w-40;
      }

      transform: translateX(1.75rem);
    }
  }

  :global(.active-queue-image) {
    background-color: lightblue;
  }
</style>
