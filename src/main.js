import App from "./App.svelte";
import "./main.scss";

import "@capacitor/core";

const app = new App({
  target: document.getElementById("app"),
});

export default app;
