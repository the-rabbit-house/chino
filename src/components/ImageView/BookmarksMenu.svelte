<script>
  import { getContext, createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

  import { bookmarks, favorites, image } from "@Stores";

  import * as R from "ramda";

  const { bookmarks: bookmarksByName } = favorites;

  const dispatch = createEventDispatcher();

  function addToBookmark(bookmark) {
    const images = R.defaultTo([], $bookmarksByName?.[bookmark]);
    images.push($image);
    $bookmarksByName[bookmark] = images;

    dispatch("dismiss");
  }
</script>

<article class="flex flex-col" in:slide>
  <div id="bookmarks" class="flex flex-row">
    {#each $bookmarks as bookmark}
      <button on:click={() => addToBookmark(bookmark)}>
        {bookmark}
      </button>
    {/each}
  </div>

  <p class="text-xl text-white text-center">Add to bookmark</p>
</article>

<style lang="scss">
  article {
    @apply w-screen overflow-hidden;
    @apply justify-center;

    height: 6rem;
    background-color: rgba(0, 0, 0, 0.7);
  }

  #bookmarks {
    @apply space-x-2 overflow-x-auto overflow-y-hidden;
    @apply pl-2;

    > button {
      @apply w-32 h-20 text-2xl truncate;
      @apply bg-black rounded;

      flex: 0 0 8rem;
    }
  }
</style>
