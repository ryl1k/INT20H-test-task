import { describe, expect, it } from "vitest";
import i18n from "./config";

describe("i18n config", () => {
  it("resolves English translation keys", () => {
    expect(i18n.t("app.name")).toBe("Instant Wellness Kits");
    expect(i18n.t("nav.dashboard")).toBe("Dashboard");
    expect(i18n.t("nav.orders")).toBe("Orders");
  });

  it("resolves nested translation keys", () => {
    expect(i18n.t("orders.search")).toBe("Search orders...");
    expect(i18n.t("taxBreakdown.stateRate")).toBe("State Tax");
  });

  it("switches to Ukrainian", async () => {
    await i18n.changeLanguage("uk");
    expect(i18n.t("app.name")).toBe("Instant Wellness Kits");
    expect(i18n.t("nav.dashboard")).toBe("Панель");
    await i18n.changeLanguage("en");
  });
});
