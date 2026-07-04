// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { InboxItem } from "@/models/trip";
import InboxPanel from "./InboxPanel";

const inboxItems: InboxItem[] = [
  {
    id: "inbox-ramen-tip",
    type: "note",
    source: "Aki",
    content: "Try Menya Inoichi near Nishiki Market.",
    timestamp: "9:41 AM",
    processed: false,
  },
];

describe("InboxPanel", () => {
  it("renders Inbox Items, accepts typed Trip Material, and invokes process callbacks", async () => {
    const user = userEvent.setup();
    const onAddItem = vi.fn();
    const onProcessItem = vi.fn();

    render(
      <InboxPanel items={inboxItems} onAddItem={onAddItem} onProcessItem={onProcessItem} />,
    );

    expect(screen.getByText("Try Menya Inoichi near Nishiki Market.")).toBeTruthy();
    expect(screen.getByText("1 items total")).toBeTruthy();

    await user.type(screen.getByRole("textbox"), "Book a tea ceremony in Gion");
    await user.click(screen.getByRole("button", { name: "Submit inbox item" }));

    expect(onAddItem).toHaveBeenCalledWith("Book a tea ceremony in Gion");

    await user.click(screen.getByRole("button", { name: /place on canvas/i }));

    expect(onProcessItem).toHaveBeenCalledWith("inbox-ramen-tip");
  });
});
