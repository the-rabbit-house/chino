import { derived, get } from "svelte/store";
import { DEFAULT_SETTINGS, settings } from "@Stores";

import * as R from "ramda";

export const SETTINGS = {
  get: function (key) {
    return derived(settings, ($settings) =>
      R.defaultTo(DEFAULT_SETTINGS[key], $settings?.[key])
    );
  },
  set: function (key, value) {
    get(settings)[key] = value;
    settings.set(get(settings));
  },
};
