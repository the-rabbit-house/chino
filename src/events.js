import EventEmitter from "events";

class Emitter extends EventEmitter {
  emit(type, ...args) {
    if (process.env.NODE_ENV !== "production") {
      console.log(type + " emitted");
    }
    super.emit(type, ...args);
  }
}

export const ServerEvents = new Emitter();
