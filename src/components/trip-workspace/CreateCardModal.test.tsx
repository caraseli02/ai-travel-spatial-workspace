// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateCardModal } from "./CreateCardModal";

describe("CreateCardModal", () => {
  it("opens card type and associate day selects above the dialog", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <CreateCardModal
        isOpen
        onClose={onClose}
        onSubmit={onSubmit}
        days={[{ day: 1, label: "Arrival" }]}
      />,
    );

    expect(screen.getByRole("heading", { name: /create spatial card/i })).toBeTruthy();

    const [cardTypeTrigger, dayTrigger] = screen.getAllByRole("combobox");
    expect(cardTypeTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(dayTrigger.getAttribute("aria-expanded")).toBe("false");

    await user.click(cardTypeTrigger);
    expect(cardTypeTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("option", { name: /polaroid/i })).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(cardTypeTrigger.getAttribute("aria-expanded")).toBe("false");

    await user.click(dayTrigger);
    expect(dayTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("option", { name: /day 1/i })).toBeTruthy();
  });
});
