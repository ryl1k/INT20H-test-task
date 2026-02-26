import { beforeEach, describe, expect, it } from "vitest";
import { useUiStore } from "./useUiStore";

describe("useUiStore", () => {
  beforeEach(() => {
    useUiStore.setState({ sidebarOpen: true, toasts: [] });
  });

  it("toggles sidebar", () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(true);
  });

  it("sets sidebar open state", () => {
    useUiStore.getState().setSidebarOpen(false);
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });

  it("adds and removes toasts", () => {
    useUiStore.getState().addToast({ type: "success", message: "test" });
    expect(useUiStore.getState().toasts).toHaveLength(1);
    const toast = useUiStore.getState().toasts[0]!;
    expect(toast.type).toBe("success");
    expect(toast.message).toBe("test");

    useUiStore.getState().removeToast(toast.id);
    expect(useUiStore.getState().toasts).toHaveLength(0);
  });
});
