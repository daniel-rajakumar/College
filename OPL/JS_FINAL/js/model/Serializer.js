
// js/model/Serializer.js

// Very simple wrapper around localStorage for saves.

const PREFIX = "canoga_";

export class Serializer {
  static save(name, data) {
    const key = PREFIX + name;
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Serializer.save error:", e);
      return false;
    }
  }

  static load(name) {
    const key = PREFIX + name;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Serializer.load error:", e);
      return null;
    }
  }
}



