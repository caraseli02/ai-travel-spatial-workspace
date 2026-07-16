// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TripPromptBar } from "./TripPromptBar";

describe("TripPromptBar", () => {
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
