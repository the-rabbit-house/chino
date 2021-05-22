<script>
  import { getContext } from "svelte";

  const { navigate } = getContext("navigator");
  const events = getContext("events");

  import allPosts from "../assets/posts.json";

  const posts = allPosts.posts.post;
</script>

<div class="px-6 pt-2 flex flex-row">
  <p class="flex-1 text-5xl font-light">gallery</p>
  <div id="search-icon" class="rounded-xl">
    <i class="ri-search-line text-3xl" />
  </div>
</div>

<div class="mt-8 flex flex-row justify-center flex-wrap">
  {#each posts as post}
    <img
      class="object-cover"
      src={post["@preview_url"]}
      alt=""
      on:click={() => navigate("Start")}
    />
  {/each}
</div>

<style lang="scss">
  #search-icon {
    @apply py-2;
    @apply px-4;

    background-color: rgba(0, 0, 0, 0.5);

    cursor: pointer;

    i {
    }
  }

  img {
    width: calc(33vw);
    height: 20vh;
  }

  @screen md {
    img {
      width: 20rem;
    }
  }
</style>
