<script context="module">
  const INPUT_SLIDE_DURATION = 300;
</script>

<script>
  import { getContext } from "svelte";
  import { fade, slide } from "svelte/transition";

  import { favorites, bookmarks, images, tags } from "@Stores";
  import { hasNextPage } from "@Stores/images";

  import Navbar from "@Components/Navbar.svelte";

  import * as R from "ramda";

  const { images: favoriteImages, bookmarks: bookmarksByName } =
    favorites;

  const { navigate } = getContext("navigator");

  var inputRef = null;

  var showInput = false;
  var bookmark = "";

  $: if (showInput) inputRef?.focus();

  function back() {
    showInput = false;
    setTimeout(() => navigate("Gallery"), INPUT_SLIDE_DURATION);
  }

  function open(bookmark) {
    let nextImages = [];

    if (bookmark === "favorites") nextImages = $favoriteImages;
    else {
      nextImages = R.defaultTo([], $bookmarksByName?.[bookmark]);
    }

    $images = nextImages;

    $tags = [];
    $hasNextPage = false;

    showInput = false;
    setTimeout(() => navigate("Gallery"), INPUT_SLIDE_DURATION);
  }

  function addBookmark() {
    showInput = false;

    if (!bookmark) return;

    $bookmarks.push(bookmark);
    $bookmarks = $bookmarks;

    bookmark = "";
  }
</script>

<Navbar on:back={back}>
  <button
    slot="right"
    id="add-bookmark-button"
    on:click={() => {
      showInput = true;
    }}
  >
    <i class="ri-add-line text-3xl" />
  </button>
</Navbar>

<article class="flex flex-col space-y-2">
  <section>
    <div class="flex flex-row items-center">
      <p class="flex-1 text-3xl truncate">Favorites</p>
      <p class="text-2xl pr-1">
        {R.length($favoriteImages || [])}
      </p>
    </div>
    <div class="flex flex-row">
      <div class="flex-1" />
      <button on:click={() => open("favorites")}>
        <i class="ri-arrow-right-line text-6xl" />
      </button>
    </div>
  </section>

  {#if showInput}
    <div
      id="bookmark-menu"
      class="flex flex-row items-center"
      transition:slide={{ duration: INPUT_SLIDE_DURATION + 10 }}
    >
      <input
        type="text"
        class="flex-1"
        placeholder="Bookmark name..."
        bind:this={inputRef}
        bind:value={bookmark}
        on:keyup={e => e.key === "Enter" && addBookmark()}
      />
      <button on:click={addBookmark}>
        <i class="ri-add-line px-4 py-8 text-3xl" />
      </button>
    </div>
  {/if}

  {#each $bookmarks as bookmark, i}
    <section in:fade={{ delay: 250 * i, duration: 175 }}>
      <div class="flex flex-row items-center">
        <p class="flex-1 text-3xl truncate">{bookmark}</p>
        <p class="flex-2xl pr-1">
          {R.length($bookmarksByName?.[bookmark] || [])}
        </p>
      </div>
      <div class="flex flex-row">
        <div class="flex-1" />
        <button on:click={() => open(bookmark)}>
          <i class="ri-arrow-right-line text-6xl" />
        </button>
      </div>
    </section>
  {/each}
</article>

<style lang="scss">
  #add-bookmark-button {
    @apply px-4 rounded-xl cursor-pointer;
    @apply flex flex-row items-center;

    height: 85%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  article {
    @apply flex-1 p-2 mt-1 overflow-y-auto;
  }

  section {
    @apply flex flex-col rounded;
    @apply p-2;

    background-color: rgba(0, 0, 0, 0.5);
  }

  #bookmark-menu {
    @apply py-6 px-4 rounded-lg;

    background-color: rgba(0, 0, 0, 0.7);

    > input {
      @apply px-4 py-4 rounded;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
</style>
