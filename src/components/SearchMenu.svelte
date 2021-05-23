<script>
  const IsImage = R.anyPass([
    R.propEq("file_ext", "png"),
    R.propEq("file_ext", "jpg"),
    R.propEq("file_ext", "jpeg"),
  ]);

  import { tick, createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  import { images, tags } from "../stores";
  import * as R from "ramda";

  import TagsInput from "svelte-tags-input";

  const dispatch = createEventDispatcher();

  var tagsBuffer = R.clone($tags);

  async function search() {
    $tags = tagsBuffer;

    $images = [];

    const response = await fetch(
      "https://danbooru.donmai.us/posts.json" +
        "?tags=" +
        $tags.join("+") +
        "&limit=100"
    );

    await tick();

    $images = await response.json();
    $images = R.filter(IsImage, $images);

    dispatch("searchend", tagsBuffer);
  }
</script>

<div
  class="flex flex-col w-screen h-full pb-4"
  in:fade={{ delay: 200 }}
  out:fade={{ delay: 0, duration: 100 }}
>
  <div id="tags-input">
    <TagsInput tags={tagsBuffer} onlyUnique={true} />
  </div>

  <div class="mt-4 flex-1">
    <div class="flex flex-col px-4">
      <hr class="border-t-2" />
      <p class="text-4xl font-light">Favorite</p>
    </div>
  </div>
  <button
    id="search-button"
    class="self-center px-24 py-2 text-4xl rounded-lg"
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

  #search-button {
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
