<script>
  const IsImage = R.anyPass([
    R.propEq("file_ext", "png"),
    R.propEq("file_ext", "jpg"),
    R.propEq("file_ext", "jpeg"),
  ]);

  const RATINGS = {
    SAFE: "rating:safe",
    UNSAFE: "rating:questionable",
    EXPLICIT: "rating:explicit",
  };
  const ACTIVE_STYLE = "background-color: rgba(200, 0, 60, 0.5)";

  import { tick, createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  import { images, tags } from "../stores";
  import * as R from "ramda";

  import TagsInput from "svelte-tags-input";

  const dispatch = createEventDispatcher();

  var tagsBuffer = R.clone($tags);
  var rating = "";

  async function search() {
    $tags = tagsBuffer;

    $images = [];

    const ratingTag = rating ? "+" + RATINGS?.[rating] : "";

    const response = await fetch(
      "https://danbooru.donmai.us/posts.json" +
        "?tags=" +
        $tags.join("+") +
        ratingTag +
        "&limit=100"
    );

    await tick();

    $images = await response.json();
    // Filtering was gelbooru specific
    // $images = R.filter(IsImage, $images);

    dispatch("searchend", tagsBuffer);
  }
</script>

<div
  class="flex flex-col items-stretch w-screen h-full pb-4 space-y-2"
  in:fade={{ delay: 200 }}
  out:fade={{ delay: 0, duration: 100 }}
>
  <div id="tags-input">
    <TagsInput
      tags={tagsBuffer}
      onlyUnique={true}
      allowBlur={true}
    />
  </div>

  <div class="mt-4 flex-1">
    <div class="flex flex-col px-4">
      <hr class="border-t-2" />
      <p class="text-4xl font-light">Favorite</p>
    </div>
  </div>

  <div
    id="rating-buttons"
    class="mx-4 flex flex-row items-center justify-between space-x-4"
  >
    <button
      class="rating-button"
      style={rating === "SAFE" ? ACTIVE_STYLE : null}
      on:click={() => {
        rating = rating !== "SAFE" ? "SAFE" : "";
      }}
    >
      SAFE
    </button>
    <button
      class="rating-button"
      style={rating === "UNSAFE" ? ACTIVE_STYLE : null}
      on:click={() => {
        rating = rating !== "UNSAFE" ? "UNSAFE" : "";
      }}
    >
      UNSAFE
    </button>
    <button
      class="rating-button"
      style={rating === "EXPLICIT" ? ACTIVE_STYLE : null}
      on:click={() => {
        rating = rating !== "EXPLICIT" ? "EXPLICIT" : "";
      }}
    >
      EXPLICIT
    </button>
  </div>

  <button
    id="search-button"
    class="mx-4 py-2 text-4xl rounded-lg"
    on:click={search}
  >
    Search
  </button>
</div>

<style lang="scss">
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

  .rating-button {
    @apply flex-1 py-4 px-4 rounded-lg;
    background-color: rgba(0, 0, 0, 0.5);
  }

  #search-button {
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
