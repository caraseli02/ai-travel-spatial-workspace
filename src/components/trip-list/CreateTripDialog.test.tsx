// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateTripDialog } from "./CreateTripDialog";

describe("CreateTripDialog", () => {
  it("validates required fields and submits a new trip", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn();

    render(<CreateTripDialog open={true} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

    expect(screen.getByRole("heading", { name: /new trip/i })).toBeTruthy();

    const submitButton = screen.getByRole("button", { name: /create trip/i }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    await user.type(screen.getByLabelText(/trip name/i), "Kyoto Food Notes");
    await user.type(screen.getByLabelText(/destination/i), "Kyoto, Japan");

    expect(submitButton.disabled).toBe(false);

    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith("Kyoto Food Notes", "Kyoto, Japan", "✈️", undefined);
  });
});
