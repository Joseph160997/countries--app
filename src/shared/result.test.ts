import { describe, expect, it } from "vitest";
import { err, isErr, isOk, map, ok, unwrapOr, type Result } from "./result";

describe("Result", () => {
  describe("ok / err", () => {
    it("should create a success result", () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(42);
    });

    it("should create a failure result", () => {
      const result = err({ kind: "network", message: "timeout" });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe("network");
    });
  });

  describe("isOk / isErr", () => {
    it("should narrow types correctly", () => {
      const success = ok("data");
      const failure = err("boom");
      expect(isOk(success)).toBe(true);
      expect(isErr(failure)).toBe(true);
      if (isOk(success)) expect(success.value).toBe("data");
      if (isErr(failure)) expect(failure.error).toBe("boom");
    });
  });

  describe("unwrapOr", () => {
    it("should return the value on success", () => {
      expect(unwrapOr(ok(10), 0)).toBe(10);
    });

    it("should return the fallback on failure", () => {
      expect(unwrapOr(err("boom"), 0)).toBe(0);
    });
  });

  describe("map", () => {
    it("should transform the value on success", () => {
      const result = map(ok(5), (n) => n * 2);
      expect(unwrapOr(result, 0)).toBe(10);
    });

    it("should pass through the error on failure", () => {
      const failure: Result<number, string> = err("boom");
      const result = map(failure, (n) => n * 2);
      expect(isErr(result)).toBe(true);
    });
  });
});
