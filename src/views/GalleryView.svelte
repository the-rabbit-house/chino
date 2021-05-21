<script>
  import { getContext } from "svelte";

  const { navigate } = getContext("navigator");
  const events = getContext("events");
</script>

<p on:click={() => navigate("Start")}>Gallery</p>
