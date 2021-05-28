<script context="module">
  const IN_FADE_DELAY = 200;
  const OUT_FADE_DURATION = 100;

  const RATINGS = {
    SAFE: "rating:safe",
    UNSAFE: "rating:questionable",
    EXPLICIT: "rating:explicit",
  };

  // Utility functions
  const stripTags = R.without([
    "",
    "rating:safe",
    "rating:questionable",
    "rating:explicit",
  ]);
</script>

<script>
  import { onMount, tick, createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  import { images, tags } from "../../stores";
  import * as R from "ramda";

  import TagsInput from "svelte-tags-input";

  import { requestImages } from "../../stores/images";

  const dispatch = createEventDispatcher();

  var tagsBuffer = stripTags($tags);

  var rating = "";
  function toggleRating(value) {
    rating = rating !== value ? value : "";
  }

  var fetching = false;

  async function search() {
    $tags = tagsBuffer;

    $images = [];

    const ratingTag = rating ? RATINGS?.[rating] : "";

    fetching = true;
    await requestImages([...$tags, ratingTag]);
    fetching = false;

    await tick();

    dispatch("searchend", tagsBuffer);
  }

  function active(ref, test) {
    return {
      update(test) {
        ref.classList.toggle("active-rating-button", test);
      },
    };
  }

  onMount(() => {
    document.querySelector(".svelte-tags-input").focus();
  });
</script>

<main
  class="flex flex-col items-stretch"
  in:fade={{ delay: IN_FADE_DELAY }}
  out:fade={{ delay: 0, duration: OUT_FADE_DURATION }}
>
  <div id="tags-input">
    <TagsInput
      tags={tagsBuffer}
      onlyUnique={true}
      allowBlur={true}
    />
  </div>

  <div class="flex-1" />

  <div
    id="rating-buttons"
    class="flex flex-row items-center justify-between"
  >
    <button
      use:active={rating === "SAFE"}
      on:click={() => toggleRating("SAFE")}
    >
      SAFE
    </button>
    <button
      use:active={rating === "UNSAFE"}
      on:click={() => toggleRating("UNSAFE")}
    >
      UNSAFE
    </button>
    <button
      use:active={rating === "EXPLICIT"}
      on:click={() => toggleRating("EXPLICIT")}
    >
      EXPLICIT
    </button>
  </div>

  <button
    id="search-button"
    class="mx-4 py-2 text-4xl rounded-lg"
    on:click={search}
  >
    {!fetching ? "Search" : "Searching..."}
  </button>
</main>

<style lang="scss">
  main {
    @apply w-screen h-full pb-4 space-y-2;
  }

  #tags-input {
    @apply px-2;

    @apply text-3xl;

    :global(.svelte-tags-input-layout) {
      border: none;
      background-color: rgba(0, 0, 0, 0.5);
    }
    :global(.svelte-tags-input) {
      @apply text-2xl;

      background-color: rgba(0, 0, 0, 0.5);
    }
    :global(.svelte-tags-input-tag) {
      @apply text-2xl;
    }
    :global(.svelte-tags-input-tag-remove) {
      @apply text-2xl;
    }
  }

  #rating-buttons {
    @apply mx-4 space-x-4;

    & > button {
      @apply flex-1 py-4 px-4 rounded-lg;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }

  :global(.active-rating-button) {
    background-color: rgba(200, 0, 60, 0.8) !important;
  }

  #search-button {
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
