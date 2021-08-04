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

  function longpress(node, threshold = 1500) {
    function handleMouseDown() {
      const timeout = setTimeout(() => {
        node.dispatchEvent(new CustomEvent("longpress"));
      }, threshold);

      const cancel = () => {
        clearTimeout(timeout);
        node.removeEventListener("mousemove", cancel);
        node.removeEventListener("mouseup", cancel);
      };

      node.addEventListener("mousemove", cancel);
      node.addEventListener("mouseup", cancel);
    }

    function handleTouchStart() {
      const timeout = setTimeout(() => {
        node.dispatchEvent(new CustomEvent("longpress"));
      }, threshold);

      const cancel = () => {
        clearTimeout(timeout);
        node.removeEventListener("touchmove", cancel);
        node.removeEventListener("touchend", cancel);
      };

      node.addEventListener("touchmove", cancel);
      node.addEventListener("touchend", cancel);
    }

    node.addEventListener("mousedown", handleMouseDown);
    node.addEventListener("touchstart", handleTouchStart);

    return {
      destroy() {
        node.removeEventListener("mousedown", handleMouseDown);
        node.removeEventListener("touchstart", handleTouchStart);
      },
    };
  }

  function nocontext(node) {
    function handleContextMenu(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }

    node.addEventListener("oncontextmenu", handleContextMenu);

    return {
      destroy() {
        node.removeEventListener(
          "oncontextmenu",
          handleContextMenu
        );
      },
    };
  }

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
  import {
    onMount,
    tick,
    createEventDispatcher,
    onDestroy,
  } from "svelte";
  import { fade } from "svelte/transition";

  import { tags, suggestions, favorites } from "@Stores";
  import { fetching, requestTags } from "@Stores/images";

  import { SETTINGS } from "@Utils";
  import * as R from "ramda";

  import TagsInput from "svelte-tags-input";

  const { tags: favoriteTags } = favorites;

  const dispatch = createEventDispatcher();

  const nsfw = SETTINGS.get("nsfw");

  var inputRef = null;

  var suggestionsTimeout = null;
  var tagsBuffer = stripTags($tags);

  var rating = "";
  function toggleRating(value) {
    rating = rating !== value ? value : "";
  }

  async function search() {
    if ($fetching) return;

    const ratingTag = rating ? RATINGS?.[rating] : "";
    dispatch("search", [
      ...tagsBuffer,
      $nsfw ? ratingTag : "rating:safe",
    ]);
  }

  function addTag(tag) {
    if (R.contains(tag, tagsBuffer)) return;

    tagsBuffer = R.append(tag, tagsBuffer);
  }

  function removeFromFavorites(tag) {
    if (!R.contains(tag, $favoriteTags)) return;

    $favoriteTags = R.without([tag], $favoriteTags);
  }

  var lastPhrase = null;
  function handleAutocomplete() {
    const tag = R.last(R.split(" ", inputRef.value));
    clearTimeout(suggestionsTimeout);

    if (R.isEmpty(tag) || lastPhrase === tag) return;
    $suggestions = [];

    lastPhrase = tag;
    suggestionsTimeout = setTimeout(
      () => requestTags(tag),
      1000
    );
  }

  onMount(() => {
    inputRef = document.querySelector(".svelte-tags-input");
    inputRef.addEventListener("input", handleAutocomplete);
    inputRef.focus();
  });

  onDestroy(() => {
    inputRef.removeEventListener("input", handleAutocomplete);
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
      on:tags={handleAutocomplete}
    />
  </div>

  <div class="rounded overflow-y-auto">
    {#if !R.isEmpty($suggestions)}
      <section>
        <p class="text-4xl font-medium">Suggested</p>

        <div id="suggestions" class="flex flex-row flex-wrap">
          {#each $suggestions as tag}
            <button
              class="select-none"
              on:click={async () => {
                clearTimeout(suggestionsTimeout);

                await tick();
                tagsBuffer = R.dropLast(1, tagsBuffer);

                addTag(tag);
                console.log(tagsBuffer);
                $suggestions = [];
              }}
            >
              {tag}
            </button>
          {/each}
        </div>
      </section>
    {/if}
  </div>

  <div class="rounded overflow-y-auto">
    {#if !R.isEmpty($favoriteTags)}
      <section>
        <p class="text-4xl font-medium">Favorites</p>

        <div id="favorites" class="flex flex-row flex-wrap">
          {#each $favoriteTags as tag}
            <button
              use:longpress
              use:nocontext
              class="select-none"
              on:longpress={() => removeFromFavorites(tag)}
              on:click={() => addTag(tag)}
            >
              {tag}
            </button>
          {/each}
        </div>
      </section>
    {/if}
  </div>

  <div class="flex-1" />

  {#if $nsfw}
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
  {/if}

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
    @apply text-3xl rounded;

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

  #favorites,
  #suggestions {
    @apply pt-2 md:pt-4 space-x-4 space-y-2;

    & > button {
      @apply p-4 text-sm md:text-base;
      background-color: rgba(0, 0, 0, 0.3);

      transform: translateX(-1rem);
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

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
