// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TripPromptBar } from "./TripPromptBar";

describe("TripPromptBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("hides suggestion chips and the disclaimer when idle", () => {
    render(
      <TripPromptBar
        promptValue=""
        promptFocused={false}
        onPromptValueChange={vi.fn()}
        onPromptFocusedChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("trip-prompt-bar-suggestions")).not.toBeInTheDocument();
    expect(screen.queryByTestId("trip-prompt-bar-disclaimer")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Describe your dream trip...")).toBeInTheDocument();
  });

  it("reveals suggestion chips and the disclaimer once focused", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [promptFocused, setPromptFocused] = useState(false);

      return (
        <TripPromptBar
          promptValue=""
          promptFocused={promptFocused}
          onPromptValueChange={vi.fn()}
          onPromptFocusedChange={setPromptFocused}
          onSubmit={vi.fn()}
        />
      );
    }

    render(<Harness />);

    await user.click(screen.getByPlaceholderText("Describe your dream trip..."));

    expect(screen.getByTestId("trip-prompt-bar-suggestions")).toBeInTheDocument();
    expect(screen.getByTestId("trip-prompt-bar-disclaimer")).toBeInTheDocument();
  });

  it("submits when pressing Enter with non-empty text", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    function Harness() {
      const [promptValue, setPromptValue] = useState("");
      const [promptFocused, setPromptFocused] = useState(false);

      return (
        <TripPromptBar
          promptValue={promptValue}
          promptFocused={promptFocused}
          onPromptValueChange={setPromptValue}
          onPromptFocusedChange={setPromptFocused}
          onSubmit={onSubmit}
        />
      );
    }

    render(<Harness />);

    const input = screen.getByPlaceholderText("Describe your dream trip...");
    await user.type(input, "Plan a trip to Rome");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
