// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import InboxPanel from "./InboxPanel";
import type { InboxItem } from "@/models/trip";

const inboxItems: InboxItem[] = [
  {
    id: "inbox-kyoto-tip",
    type: "note",
    source: "Mina",
    content: "Book a quiet dinner near Philosopher's Path.",
    timestamp: "9:15 AM",
    processed: false,
  },
];

describe("InboxPanel", () => {
  it("renders Inbox Items and invokes the process callback", async () => {
    const onProcessItem = vi.fn();

    render(
      <InboxPanel
        items={inboxItems}
        onProcessItem={onProcessItem}
        onAddItem={vi.fn()}
      />,
    );

    expect(screen.getByText("Book a quiet dinner near Philosopher's Path.")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: /place on canvas/i }));

    expect(onProcessItem).toHaveBeenCalledWith("inbox-kyoto-tip");
  });
});
