<script>
  import { getContext } from "svelte";
  import { crossfade, scale } from "svelte/transition";

  const { navigate } = getContext("navigator");
  const events = getContext("events");

  import allPosts from "../assets/posts.json";
  const posts = allPosts.posts.post;

  const [send, receive] = crossfade({
    duration: 200,
    fallback: scale,
  });

  var selectedImage = null;

  var showSearch = false;
  $: document.body.classList.toggle(
    "noscroll",
    showSearch || selectedImage !== null
  );

  var scrollY = 0;
  $: showBackButton = scrollY > window.innerHeight;
</script>

<svelte:window bind:scrollY />

<div class="px-6 pt-2 flex flex-row">
  <p class="flex-1 text-5xl font-light">gallery</p>
  <div
    id="search-icon"
    class="py-2 px-4 rounded-xl pointer"
    on:click={() => {
      window.scrollTo(0, 0);
      showSearch = !showSearch;
    }}
  >
    {#if showSearch}
      <i class="ri-close-line text-3xl" />
    {:else}
      <i class="ri-search-line text-3xl" />
    {/if}
  </div>
</div>

<div
  id="posts"
  class="mt-8 flex flex-row justify-center flex-wrap"
  style={showSearch && "filter: blur(20px)"}
>
  {#each posts as post}
    <img
      class="object-cover"
      src={post["@preview_url"]}
      alt=""
      on:click={() => {
        selectedImage = post;
      }}
      in:receive={{ key: post["@id"] }}
      out:send={{ key: post["@id"] }}
    />
  {/each}
</div>

{#if selectedImage}
  <div
    class="fixed top-0 left-0"
    on:click={() => {
      selectedImage = null;
    }}
    in:send={{ key: selectedImage?.["@id"] }}
    out:receive={{ key: selectedImage?.["@id"] }}
  >
    <img
      class="w-screen h-screen object-contain bg-black"
      src={selectedImage["@preview_url"]}
    />
  </div>
{/if}

{#if showSearch}
  <div id="search-menu" class="fixed left-0">
    <div class="w-screen h-screen" />
  </div>
{/if}

{#if showBackButton && !showSearch}
  <div
    class="fixed bottom-0 right-0 mr-8 mb-7 px-6 py-5 bg-white rounded-lg"
    on:click={() => {
      scrollY = 0;
    }}
  >
    <i class="ri-arrow-up-line text-2xl text-black" />
  </div>
{/if}

<style lang="scss">
  #search-icon {
    background-color: rgba(0, 0, 0, 0.5);
  }

  #search-menu {
    top: 6rem;
  }

  #posts {
    transition: 0.5s filter linear;

    img {
      width: calc(33vw);
      height: 20vh;
    }
  }
</style>
