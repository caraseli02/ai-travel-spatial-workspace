// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreateTripDialog } from "./CreateTripDialog";

describe("CreateTripDialog", () => {
  afterEach(() => {
    cleanup();
  });

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

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSubmit).toHaveBeenCalledWith("Kyoto Food Notes", "Kyoto, Japan", "✈️", undefined);
  });

  it("rejects an end date before the start date", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn();

    render(<CreateTripDialog open={true} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/trip name/i), "Weekend Trip");
    await user.type(screen.getByLabelText(/destination/i), "Paris, France");

    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0]!, { target: { value: "2026-08-10" } });
    fireEvent.change(dateInputs[1]!, { target: { value: "2026-08-01" } });

    await user.click(screen.getByRole("button", { name: /create trip/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/end date must be on or after/i);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("enforces trip name and destination length limits", () => {
    render(
      <CreateTripDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />,
    );

    expect(document.getElementById("trip-name")).toHaveAttribute("maxlength", "80");
    expect(document.getElementById("trip-destination")).toHaveAttribute("maxlength", "120");
  });
});
