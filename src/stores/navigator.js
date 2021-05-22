import { writable, get } from "svelte/store";

export const screen = writable(null);
export const history = writable([]);

const EVENTS = writable({});
const SCREENS = writable({});

export const screenEvents = writable({});

export function init(events, screens) {
  EVENTS.set(events);
  SCREENS.set(screens);
}

export function navigate(nextScreen, reset) {
  if (get(screen)) {
    const allEvents = Object.entries(get(EVENTS));
    const viewEvents = Object.entries(get(screenEvents));

    // Unsubscribe all of view's listeners
    for (const [name, emitter] of viewEvents) {
      if (typeof emitter.clear === "function") emitter.clear();
    }

    // Register view events
    const nextEvents = {};
    for (const [name, emitter] of allEvents) {
      nextEvents[name] = new ViewEmitter(nextScreen, emitter);
    }

    screenEvents.set(nextEvents);
  }

  if (reset) get(history).push("StartView");

  const screens = get(SCREENS);
  screen.set(screens[nextScreen]);
}

export class ViewEmitter {
  constructor(view, emitter) {
    this.view = view;
    this.emitter = emitter;

    this.listeners = [];
  }

  on(event, listener) {
    this.listeners.push([event, listener]);
    this.emitter.on(event, listener);
  }

  clear() {
    const listeners = this.listeners;
    for (const [event, listener] of listeners) {
      this.emitter.removeListener(event, listener);
    }
  }
}
