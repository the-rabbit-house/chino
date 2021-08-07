<script>
  import { getContext } from "svelte";
  import { fade } from "svelte/transition";

  import { favorites, bookmarks, images, tags } from "@Stores";
  import { hasNextPage } from "@Stores/images";

  import Navbar from "@Components/Navbar.svelte";

  import * as R from "ramda";

  const { images: favoriteImages, bookmarks: bookmarksByName } =
    favorites;

  const { navigate } = getContext("navigator");

  function back() {
    navigate("Gallery");
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

    navigate("Gallery");
  }
</script>

<Navbar on:back={back}>
  <button slot="right" id="add-bookmark-button">
    <i class="ri-add-line text-3xl" />
  </button>
</Navbar>

<article class="flex flex-col space-y-2">
  <section>
    <p class="truncate">Favorites</p>
    <div class="flex flex-row">
      <div class="flex-1" />
      <button on:click={() => open("favorites")}>
        <i class="ri-arrow-right-line text-6xl" />
      </button>
    </div>
  </section>

  {#each $bookmarks as bookmark, i}
    <section>
      <p class="truncate">{bookmark}</p>
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

    > p {
      @apply text-3xl;
    }
  }
</style>
