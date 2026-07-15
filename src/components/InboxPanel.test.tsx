// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { InboxItem } from "@/models/trip";
import InboxPanel from "./InboxPanel";

const inboxItems: InboxItem[] = [
  {
    id: "inbox-ramen-tip",
    type: "note",
    source: "Try Menya Inoichi near Nishiki Market.",
    content: "Try Menya Inoichi near Nishiki Market.",
    rawContent: "Try Menya Inoichi near Nishiki Market.",
    timestamp: "9:41 AM",
    capturedAt: "2026-07-12T09:41:00.000Z",
    processed: false,
  },
  {
    id: "inbox-link",
    type: "link",
    source: "example.com",
    content: "https://example.com/opaque-path",
    rawContent: "https://example.com/opaque-path",
    sourceUrl: "https://example.com/opaque-path",
    timestamp: "Just now",
    capturedAt: "2026-07-12T10:00:00.000Z",
    processed: false,
  },
];

describe("InboxPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders captured Inbox Items with honest copy and source recovery actions", async () => {
    const user = userEvent.setup();
    const onAddItem = vi.fn();
    const onProcessItem = vi.fn();

    render(
      <InboxPanel items={inboxItems} onAddItem={onAddItem} onProcessItem={onProcessItem} />,
    );

    expect(screen.getByText("Saved capture")).toBeTruthy();
    expect(screen.getAllByText("Try Menya Inoichi near Nishiki Market.").length).toBeGreaterThan(0);
    const openSourceLink = screen.getByRole("link", { name: "Open original source" });
    expect(openSourceLink.getAttribute("href")).toBe("https://example.com/opaque-path");
    expect(screen.getByText("2 items total")).toBeTruthy();

    await user.type(screen.getByRole("textbox"), "Book a tea ceremony in Gion");
    await user.click(screen.getByRole("button", { name: "Submit inbox item" }));

    expect(onAddItem).toHaveBeenCalledWith("Book a tea ceremony in Gion");

    await user.click(screen.getAllByRole("button", { name: /place on canvas/i })[0]);

    expect(onProcessItem).toHaveBeenCalledWith("inbox-ramen-tip");
  });

  it("hides the capture input on desktop while keeping the inbox list", () => {
    render(
      <InboxPanel
        items={inboxItems}
        onAddItem={vi.fn()}
        onProcessItem={vi.fn()}
        showCaptureInput={false}
      />,
    );

    expect(screen.queryByTestId("inbox-capture-input")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(
      screen.getByText(/paste a link or note in ask ai below to capture more/i),
    ).toBeTruthy();
    expect(screen.getAllByText("Try Menya Inoichi near Nishiki Market.").length).toBeGreaterThan(0);
  });
});
