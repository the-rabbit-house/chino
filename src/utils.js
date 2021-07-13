import { derived, get } from "svelte/store";
import { DEFAULT_SETTINGS, settings } from "@Stores";

import * as R from "ramda";

export const SETTINGS = {
  get: function (key) {
    return derived(settings, $settings =>
      R.defaultTo(DEFAULT_SETTINGS[key], $settings?.[key])
    );
  },
  set: function (key, value) {
    const nextSettings = { ...get(settings), [key]: value };
    settings.set(nextSettings);
  },
};

export function timeout(ms = 8000) {
  const controller = new AbortController();
  const signal = controller.signal;

  setTimeout(() => controller.abort(), ms);
  return signal;
}

export function remToPx(rem) {
  return (
    rem *
    parseFloat(
      getComputedStyle(document.documentElement).fontSize
    )
  );
}
