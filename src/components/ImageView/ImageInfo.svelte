<script context="module">
</script>

<script>
  import { createEventDispatcher } from "svelte";
  import { image, tags, favorites } from "@Stores";

  import * as R from "ramda";
  import { Clipboard } from "@capacitor/clipboard";

  import { getImage } from "@Components/Image.svelte";

  const { tags: favoriteTags } = favorites;

  const dispatch = createEventDispatcher();

  export let closable = false;

  var innerWidth;
  $: isMobile = innerWidth <= 768;

  $: imageTags = R.defaultTo([], $image?.["tags"]);

  const isInTags = (tag) => R.contains(tag, $tags);
  const isInFavorites = (tag) => R.contains(tag, $favoriteTags);

  function addOrRemoveTag(tag) {
    if (isInTags(tag)) $tags = R.without([tag], $tags);
    else $tags = R.append(tag, $tags);

    // Force tags re-render
    imageTags = imageTags;
  }

  function addOrRemoveFavorite(tag) {
    if (isInFavorites(tag)) {
      $favoriteTags = R.without([tag], $favoriteTags);
    } else $favoriteTags = R.append(tag, $favoriteTags);

    // Force tags re-render
    imageTags = imageTags;
  }

  function copyToClipboard() {
    Clipboard.write({
      url: $image?.["file_url"],
    });
  }
</script>

<svelte:window bind:innerWidth />

<article class="flex flex-col space-y-2">
  <div class="p-2 flex flex-row justify-between space-x-4">
    <button class="icon-button">
      <i class="ri-star-fill text-4xl" />
    </button>
    <a
      class="icon-button"
      href={getImage($image)}
      download={$image?.file_name}
    >
      <i class="ri-download-fill text-4xl" />
    </a>
    <button class="icon-button" on:click={copyToClipboard}>
      <i class="ri-file-copy-fill text-4xl" />
    </button>
    <a
      class="icon-button"
      href={$image?.["source"]}
      target="_blank"
    >
      <i class="ri-phone-find-line text-4xl" />
    </a>
  </div>
  <section class="p-4 flex flex-row">
    <div class="flex-1 flex flex-col">
      <p class="text-lg">Artist:</p>
      <p class="text-xl font-light">
        {$image?.["artist"]}
      </p>
    </div>
    <button
      class="icon-button"
      on:click={() => addOrRemoveFavorite($image?.["artist"])}
    >
      {#if isInFavorites($image?.["artist"])}
        <i
          class="ri-star-fill text-4xl md:text-5xl text-yellow-300"
        />
      {:else}
        <i class="ri-star-line text-4xl md:text-5xl" />
      {/if}
    </button>
  </section>

  <div id="tags" class="flex flex-col">
    {#each imageTags as tag}
      <div class="p-4 flex flex-row rounded-lg items-center">
        <p class="truncate flex-1 md:text-lg font-light">
          {tag}
        </p>

        {#if isInTags(tag)}
          <button
            class="icon-button"
            on:click={() => addOrRemoveTag(tag)}
          >
            {!isMobile ? "Remove" : ""}
            <i class="ri-subtract-line text-4xl md:text-5xl" />
          </button>
        {:else}
          <button
            class="icon-button"
            on:click={() => addOrRemoveTag(tag)}
          >
            {!isMobile ? "Add" : ""}
            <i class="ri-add-line text-4xl md:text-5xl" />
          </button>
        {/if}

        <button
          class="icon-button"
          on:click={() => addOrRemoveFavorite(tag)}
        >
          {#if isInFavorites(tag)}
            <i
              class="ri-star-fill text-4xl md:text-5xl text-yellow-300"
            />
          {:else}
            <i class="ri-star-line text-4xl md:text-5xl" />
          {/if}
        </button>
      </div>
    {/each}
  </div>

  {#if closable}
    <button
      id="close-button"
      class="tracking-wider"
      on:click={() => dispatch("close")}
    >
      CLOSE
    </button>
  {/if}
</article>

<style lang="scss">
  article {
    @apply w-screen h-full p-4 space-y-2 bg-black rounded-2xl;

    @screen md {
      padding-bottom: 15rem;
    }

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

  .icon-button {
    @apply px-4 py-2 flex flex-row items-center rounded-lg;
    background-color: rgba(0, 0, 0, 0.5);
  }

  #close-button {
    @apply py-6 mb-4 rounded;
    background-color: rgba(255, 0, 0, 0.3);
  }
</style>
