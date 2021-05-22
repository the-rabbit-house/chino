<script>
  import { getContext } from "svelte";
  import { tweened } from "svelte/motion";

  const { navigate } = getContext("navigator");
  const events = getContext("events");

  import allPosts from "../assets/posts.json";

  const posts = allPosts.posts.post;

  var scrollY = 0;
  $: showBackButton = scrollY > window.innerHeight;
</script>

<svelte:window bind:scrollY />

<div class="px-6 pt-2 flex flex-row">
  <p class="flex-1 text-5xl font-light">gallery</p>
  <div id="search-icon" class="py-2 px-4 rounded-xl pointer">
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

{#if showBackButton}
  <div
    class="fixed bottom-0 right-0 mr-4 mb-4 bg-white px-5 py-4 rounded-lg"
    on:click={() => {
      scrollY = 0;
    }}
  >
    <i class="ri-arrow-up-line text-xl text-black" />
  </div>
{/if}

<style lang="scss">
  #search-icon {
    background-color: rgba(0, 0, 0, 0.5);
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
