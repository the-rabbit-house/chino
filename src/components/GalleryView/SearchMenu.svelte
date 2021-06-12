<script context="module">
  export const IN_FADE_DELAY = 200;
  export const OUT_FADE_DURATION = 100;

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
  import { onMount, tick, createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  import { images, tags, favorites } from "@Stores";
  import { fetching, requestImages } from "@Stores/images";

  import * as R from "ramda";

  import TagsInput from "svelte-tags-input";

  const { tags: favoriteTags } = favorites;

  const dispatch = createEventDispatcher();

  var tagsBuffer = stripTags($tags);

  var rating = "";
  function toggleRating(value) {
    rating = rating !== value ? value : "";
  }

  async function search() {
    if ($fetching) return;

    const ratingTag = rating ? RATINGS?.[rating] : "";
    dispatch("search", [...tagsBuffer, ratingTag]);
  }

  function addTag(tag) {
    if (R.contains(tag, tagsBuffer)) return;

    tagsBuffer = R.append(tag, tagsBuffer);
  }

  onMount(() => {
    document.querySelector(".svelte-tags-input").focus();
  });
</script>

<main
  class="flex flex-col items-stretch space-y-2"
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

  <div class="flex-1 overflow-y-auto">
    {#if !R.isEmpty($favoriteTags)}
      <section>
        <p class="text-4xl font-medium">Favorites</p>

        <div id="favorites" class="flex flex-row flex-wrap">
          {#each $favoriteTags as tag}
            <button on:click={() => addTag(tag)}>{tag}</button>
          {/each}
        </div>
      </section>
    {/if}
  </div>

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
    class="py-2 text-4xl rounded-lg"
    on:click={search}
  >
    {!$fetching ? "Search" : "Searching..."}
  </button>
</main>

<style lang="scss">
  main {
    @apply w-screen h-full px-4 pb-4;
  }

  #tags-input {
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
      @apply text-xl;
    }
    :global(.svelte-tags-input-tag-remove) {
      @apply text-2xl;
    }
  }

  section {
    @apply px-2 pt-4 pb-6;

    background-color: rgba(0, 0, 0, 0.5);
  }

  #favorites {
    @apply pt-2 md:pt-4 space-x-4 space-y-2;

    & > button {
      @apply p-4 text-sm md:text-base;
      background-color: rgba(0, 0, 0, 0.3);

      transform: translateX(-1rem);

      &:first-child {
        @apply mt-2 ml-4;
      }
    }
  }

  #rating-buttons {
    @apply space-x-4;

    & > button {
      @apply flex-1 py-4 px-4 rounded-lg;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }

  #search-button {
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
