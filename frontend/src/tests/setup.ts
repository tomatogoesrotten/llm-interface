import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement scrollIntoView; stub it so components that use it don't crash.
if (typeof window !== "undefined" && !(Element.prototype as any).scrollIntoView) {
  (Element.prototype as any).scrollIntoView = () => {};
}
