import { describe, expect, it } from "vitest";
import { buildCompactWindow, buildPageWindow } from "./pagination";

describe("buildPageWindow", () => {
  it("should return all pages when total is small", () => {
    expect(buildPageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("should show anchors and ellipsis for large totals", () => {
    expect(buildPageWindow(5, 20)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      20,
    ]);
  });

  it("should handle the first page", () => {
    expect(buildPageWindow(1, 20)).toEqual([1, 2, "ellipsis", 20]);
  });

  it("should handle the last page", () => {
    expect(buildPageWindow(20, 20)).toEqual([1, "ellipsis", 19, 20]);
  });
});

describe("buildCompactWindow", () => {
  it("should center the window on the current page", () => {
    expect(buildCompactWindow(10, 20)).toEqual([8, 9, 10, 11, 12]);
  });

  it("should clamp at the start", () => {
    expect(buildCompactWindow(1, 20)).toEqual([1, 2, 3, 4, 5]);
  });

  it("should clamp at the end", () => {
    expect(buildCompactWindow(20, 20)).toEqual([16, 17, 18, 19, 20]);
  });

  it("should return all pages when total is less than 5", () => {
    expect(buildCompactWindow(2, 3)).toEqual([1, 2, 3]);
  });
});
