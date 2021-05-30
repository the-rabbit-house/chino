<script context="module">
</script>

<script>
  import { image, tags, favorites } from "@Stores";
  import * as R from "ramda";

  $: imageTags = $image?.["tags"];

  const isInTags = (tag) => R.contains(tag, $tags);
  const isInFavorites = (tag) => R.contains(tag, $favorites);

  function addOrRemoveTag(tag) {
    if (isInTags(tag)) $tags = R.without([tag], $tags);
    else $tags = R.append(tag, $tags);

    // Force tags re-render
    imageTags = imageTags;
  }

  function addOrRemoveFavorite(tag) {
    if (isInFavorites(tag))
      $favorites = R.without([tag], $favorites);
    else $favorites = R.append(tag, $favorites);

    // Force tags re-render
    imageTags = imageTags;
  }
</script>

<article class="flex flex-col space-y-2">
  <section class="p-4">
    <p class="text-lg">Source:</p>
    <a
      class="text-xl font-light text-blue-400"
      href={$image?.["source"]}>{$image?.["source"]}</a
    >
  </section>
  <section class="p-4">
    <p class="text-lg">Artist:</p>
    <p class="text-xl font-light">
      {$image?.["artist"]}
    </p>
  </section>

  <div id="tags" class="flex flex-col">
    {#each imageTags as tag}
      <div class="p-4 flex flex-row rounded-lg items-center">
        <p class="flex-1 text-lg font-light">
          {tag}
        </p>

        {#if isInTags(tag)}
          <button
            class="tag-button"
            on:click={() => addOrRemoveTag(tag)}
          >
            Remove
            <i class="ri-subtract-line text-5xl ml-4" />
          </button>
        {:else}
          <button
            class="tag-button"
            on:click={() => addOrRemoveTag(tag)}
          >
            Add
            <i class="ri-add-line text-5xl ml-4" />
          </button>
        {/if}

        <button
          class="tag-button"
          on:click={() => addOrRemoveFavorite(tag)}
        >
          {#if isInFavorites(tag)}
            <i class="ri-star-fill text-5xl text-yellow-300" />
          {:else}
            <i class="ri-star-line text-5xl" />
          {/if}
        </button>
      </div>
    {/each}
  </div>
</article>

<style lang="scss">
  article {
    @apply w-screen h-full p-4 pb-40 space-y-2 bg-black rounded-2xl;

    transform: translateY(1rem);

    background: linear-gradient(
      360deg,
      #000000cd,
      #7d7d7d44,
      rgba(0, 0, 0, 0.2)
    );
  }

  section {
    @apply rounded-lg;
    background-color: rgba(0, 0, 0, 0.6);
  }

  #tags {
    @apply space-y-4 overflow-y-auto;

    & > * {
      @apply space-x-4;
      background-color: rgba(0, 0, 0, 0.4);
    }
  }

  .tag-button {
    @apply px-4 py-2 flex flex-row items-center;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
