import { describe, expect, it, vi } from "vitest";
import { createStore } from "./store";

interface CounterState {
  count: number;
  label: string;
}

const createCounter = () =>
  createStore<CounterState>({ count: 0, label: "init" });

describe("createStore", () => {
  // ====================================================
  // getState
  // ====================================================
  describe("getState", () => {
    it("should return the initial state", () => {
      const store = createCounter();
      expect(store.getState()).toEqual({ count: 0, label: "init" });
    });
  });

  // ====================================================
  // setState
  // ====================================================
  describe("setState", () => {
    it("should merge a partial update into state", () => {
      const store = createCounter();
      store.setState({ count: 5 });
      expect(store.getState()).toEqual({ count: 5, label: "init" });
    });

    it("should support functional updates based on previous state", () => {
      const store = createCounter();
      store.setState((prev) => ({ count: prev.count + 1 }));
      store.setState((prev) => ({ count: prev.count + 1 }));
      expect(store.getState().count).toBe(2);
    });

    it("should replace the state reference instead of mutating it", () => {
      const store = createCounter();
      const before = store.getState();

      store.setState({ count: 1 });

      // La referencia cambia (nuevo snapshot)...
      expect(store.getState()).not.toBe(before);
      // ...y el snapshot anterior queda intacto (inmutabilidad)
      expect(before.count).toBe(0);
    });
  });

  // ====================================================
  // subscribe
  // ====================================================
  describe("subscribe", () => {
    it("should notify listeners with next and prev state", () => {
      const store = createCounter();
      const listener = vi.fn();
      store.subscribe(listener);

      store.setState({ count: 7 });

      expect(listener).toHaveBeenCalledWith(
        { count: 7, label: "init" },
        { count: 0, label: "init" },
      );
    });

    it("should notify all subscribers", () => {
      const store = createCounter();
      const listenerA = vi.fn();
      const listenerB = vi.fn();
      store.subscribe(listenerA);
      store.subscribe(listenerB);

      store.setState({ count: 1 });

      expect(listenerA).toHaveBeenCalledTimes(1);
      expect(listenerB).toHaveBeenCalledTimes(1);
    });

    it("should stop notifying after unsubscribe", () => {
      const store = createCounter();
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      unsubscribe();
      store.setState({ count: 1 });

      expect(listener).not.toHaveBeenCalled();
    });

    it("should not notify when nothing actually changes", () => {
      const store = createCounter();
      const listener = vi.fn();
      store.subscribe(listener);

      store.setState({ count: 0 }); // el mismo valor que ya tiene

      expect(listener).not.toHaveBeenCalled();
    });
  });

  // ====================================================
  // reset
  // ====================================================
  describe("reset", () => {
    it("should restore initial state and notify", () => {
      const store = createCounter();
      const listener = vi.fn();
      store.setState({ count: 99, label: "dirty" });
      store.subscribe(listener);

      store.reset();

      expect(store.getState()).toEqual({ count: 0, label: "init" });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
