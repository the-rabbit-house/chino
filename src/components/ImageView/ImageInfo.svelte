<script context="module">
</script>

<script>
  import { image } from "@Stores";
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
      {$image?.["tag_string_artist"]}
    </p>
  </section>

  <div id="tags" class="flex flex-col">
    {#each $image?.["tag_string"].split(" ") as tag}
      <div class="p-4 flex flex-row rounded-lg items-center">
        <p class="flex-1 text-lg font-light">
          {tag}
        </p>

        <button class="tag-button">
          Add
          <i class="ri-add-line text-5xl ml-4" />
        </button>

        <button class="tag-button">
          Search
          <i class="ri-search-line text-5xl ml-4" />
        </button>

        <button class="tag-button">
          <i class="ri-star-line text-5xl" />
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
